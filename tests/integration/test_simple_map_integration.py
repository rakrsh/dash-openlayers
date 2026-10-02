import json

import dash
from dash import Input, Output, html
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

import dash_openlayers as dol


def test_simple_map_starts(dash_duo):
    app = dash.Dash(__name__)
    app.layout = dash.html.Div(
        [
            dol.Map(
                id="map",
                center=[0, 0],
                zoom=2,
                children=[dol.TileLayer(source="OSM")],
                style={"height": "300px"},
            ),
            html.Pre(id="click-output"),
        ]
    )

    @app.callback(Output("click-output", "children"), Input("map", "clickData"))
    def show_click_data(click_data):
        return json.dumps(click_data) if click_data else ""

    dash_duo.start_server(app)
    # Wait for OpenLayers map viewport to appear (created by the client-side JS)
    try:
        el = dash_duo.wait_for_element("div.ol-viewport", timeout=15)
    except Exception:
        # Dump page source and browser console logs for debugging
        print(dash_duo.driver.page_source[:10000])
        try:
            print(dash_duo.driver.get_log("browser"))
        except Exception:
            pass
        raise
    assert el is not None
    WebDriverWait(dash_duo.driver, 15).until(
        lambda driver: len(driver.find_elements(By.CSS_SELECTOR, "#map .ol-layer")) == 1
    )
    dash_duo.find_element("#map .ol-viewport").click()
    dash_duo.wait_for_contains_text("#click-output", '"latLon"', timeout=10)

    click_data = json.loads(dash_duo.find_element("#click-output").text)
    assert len(click_data["coordinate"]) == 2
    assert len(click_data["latLon"]) == 2
    assert dash_duo.get_logs() == []


def test_tile_layer_sources_attach_and_cleanup(dash_duo):
    app = dash.Dash(__name__)
    app.layout = dash.html.Div(
        [
            dash.dcc.Checklist(
                id="show-layers",
                options=[{"label": "Show tile layers", "value": "show"}],
                value=["show"],
            ),
            dol.Map(
                id="map",
                center=[0, 0],
                zoom=2,
                children=[
                    dol.TileLayer(
                        id="custom",
                        url="https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                    ),
                ],
                style={"height": "300px"},
            ),
        ]
    )

    @app.callback(
        dash.Output("map", "children"),
        dash.Input("show-layers", "value"),
    )
    def show_tile_layers(values):
        return dash.no_update if "show" in (values or []) else []

    dash_duo.start_server(app)
    dash_duo.wait_for_element("#map .ol-viewport", timeout=15)
    layer_selector = "#map .ol-layer"
    WebDriverWait(dash_duo.driver, 15).until(
        lambda driver: len(driver.find_elements(By.CSS_SELECTOR, layer_selector)) == 1
    )

    dash_duo.find_element("#show-layers input").click()
    WebDriverWait(dash_duo.driver, 15).until(
        lambda driver: not driver.find_elements(By.CSS_SELECTOR, layer_selector)
    )


def test_vector_layer_renders_geojson_and_updates(dash_duo):
    initial_geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [0, 0]},
                "properties": {},
            },
            {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [[-8, -8], [-4, -4], [0, -2]],
                },
                "properties": {},
            },
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[5, 5], [12, 5], [12, 12], [5, 12], [5, 5]]],
                },
                "properties": {},
            },
        ],
    }
    updated_geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [20, 10]},
                "properties": {},
            },
            {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [[10, -10], [15, -5], [20, -2]],
                },
                "properties": {},
            },
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[18, 12], [25, 12], [25, 20], [18, 20], [18, 12]]],
                },
                "properties": {},
            },
        ],
    }
    app = dash.Dash(__name__)
    app.layout = dash.html.Div(
        [
            dash.html.Button("Update features", id="update-features"),
            dol.Map(
                id="map",
                center=[0, 0],
                zoom=4,
                children=[dol.VectorLayer(id="vectors", geojson=initial_geojson)],
                style={"height": "400px", "width": "400px"},
            ),
        ]
    )

    @app.callback(
        dash.Output("vectors", "geojson"),
        dash.Input("update-features", "n_clicks"),
    )
    def update_features(n_clicks):
        return updated_geojson if n_clicks else initial_geojson

    dash_duo.start_server(app)
    dash_duo.wait_for_element("#map .ol-viewport", timeout=15)

    def rendered_canvas(driver):
        return driver.execute_script(
            """
            const canvas = document.querySelector('#map .ol-layer canvas');
            if (!canvas) return null;
            const pixels = canvas.getContext('2d').getImageData(
              0, 0, canvas.width, canvas.height
            ).data;
            const hasPixels = Array.from(pixels).some((value, index) =>
              index % 4 === 3 && value > 0
            );
            return hasPixels ? canvas.toDataURL() : null;
            """
        )

    initial_frame = WebDriverWait(dash_duo.driver, 15).until(rendered_canvas)
    dash_duo.find_element("#update-features").click()
    WebDriverWait(dash_duo.driver, 15).until(
        lambda driver: (frame := rendered_canvas(driver)) and frame != initial_frame
    )
    assert dash_duo.get_logs() == []
