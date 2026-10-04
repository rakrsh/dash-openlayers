import json

import dash
from dash import Input, Output, State, html
from selenium.webdriver.common.action_chains import ActionChains
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


def test_popup_child_mounts_and_unmounts(dash_duo):
    app = dash.Dash(__name__)
    app.layout = dash.html.Div(
        [
            dash.dcc.Checklist(
                id="show-popup",
                options=[{"label": "Show popup", "value": "show"}],
                value=["show"],
            ),
            dol.Map(
                id="map",
                center=[0, 0],
                zoom=2,
                children=[
                    dol.Popup(
                        id="popup",
                        position=[0, 0],
                        className="place-popup",
                        children=html.Div("Popup body"),
                    ),
                ],
                style={"height": "300px"},
            ),
        ]
    )

    @app.callback(
        dash.Output("map", "children"),
        dash.Input("show-popup", "value"),
    )
    def show_popup(values):
        if "show" in (values or []):
            return [
                dol.Popup(
                    id="popup",
                    position=[0, 0],
                    className="place-popup",
                    children=html.Div("Popup body"),
                )
            ]
        return []

    dash_duo.start_server(app)
    dash_duo.wait_for_element("#map .ol-viewport", timeout=15)
    dash_duo.wait_for_element("#popup", timeout=15)
    assert dash_duo.find_element("#popup").text == "Popup body"

    dash_duo.find_element("#show-popup input").click()
    WebDriverWait(dash_duo.driver, 15).until(
        lambda driver: not driver.find_elements(By.CSS_SELECTOR, "#popup")
    )
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


def test_vector_layer_renders_geopandas_geojson_string_and_property_styles(dash_duo):
    geojson_text = json.dumps(
        {
            "type": "FeatureCollection",
            "crs": {
                "type": "name",
                "properties": {"name": "urn:ogc:def:crs:EPSG::3857"},
            },
            "features": [
                {
                    "type": "Feature",
                    "geometry": {"type": "Point", "coordinates": [1_000_000, 2_000_000]},
                    "properties": {"category": "site", "details": {"name": "Point"}},
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [[900_000, 1_900_000], [1_100_000, 2_100_000]],
                    },
                    "properties": {"category": "route", "details": {"name": "Line"}},
                },
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [
                            [
                                [900_000, 1_900_000],
                                [1_100_000, 1_900_000],
                                [1_100_000, 2_100_000],
                                [900_000, 2_100_000],
                                [900_000, 1_900_000],
                            ]
                        ],
                    },
                    "properties": {"category": "area", "details": {"name": "Polygon"}},
                },
            ],
        }
    )
    style = [
        {
            "filter": ["==", ["get", "category"], "site"],
            "style": {"circle-radius": 6, "circle-fill-color": "#d66f41"},
        },
        {
            "filter": ["==", ["get", "category"], "route"],
            "style": {"stroke-color": "#1f6a5e", "stroke-width": 3},
        },
        {
            "else": True,
            "style": {
                "fill-color": "rgba(31, 106, 94, 0.24)",
                "stroke-color": "#1f6a5e",
                "stroke-width": 2,
            },
        },
    ]
    app = dash.Dash(__name__)
    app.layout = dol.Map(
        id="map",
        center=[1_000_000, 2_000_000],
        zoom=5,
        children=[dol.VectorLayer(id="features", data=geojson_text, style=style)],
        style={"height": "400px", "width": "600px"},
    )

    dash_duo.start_server(app)
    dash_duo.wait_for_element("#map .ol-viewport", timeout=15)
    WebDriverWait(dash_duo.driver, 15).until(
        lambda driver: driver.execute_script(
            """
            const canvas = document.querySelector('#map .ol-layer canvas');
            if (!canvas) return false;
            const pixels = canvas.getContext('2d').getImageData(
              0, 0, canvas.width, canvas.height
            ).data;
            return pixels.some((value, index) => index % 4 === 3 && value > 0);
            """
        )
    )
    assert dash_duo.get_logs() == []


def test_modify_reverts_self_intersecting_polygon_edit(dash_duo):
    geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[-10, -10], [10, -10], [10, 10], [-10, 10], [-10, -10]]],
                },
                "properties": {"name": "Editable area"},
            }
        ],
    }
    app = dash.Dash(__name__)
    app.layout = dash.html.Div(
        [
            dol.Map(
                id="map",
                center=[0, 0],
                zoom=3,
                projection="EPSG:4326",
                children=[
                    dol.VectorLayer(id="editable-layer", geojson=geojson),
                    dol.ModifyInteraction(
                        id="modify",
                        layerId="editable-layer",
                        snapToVertex=False,
                        snapToEdge=False,
                    ),
                ],
                style={"height": "400px", "width": "600px"},
            ),
            html.Pre(id="modified-output"),
            html.Pre(id="validation-output"),
            html.Pre(id="history-output"),
        ]
    )

    @app.callback(Output("modified-output", "children"), Input("modify", "modifiedGeoJSON"))
    def show_modified_geojson(modified_geojson):
        return json.dumps(modified_geojson) if modified_geojson else ""

    @app.callback(Output("validation-output", "children"), Input("modify", "geometryValidation"))
    def show_validation(result):
        return json.dumps(result) if result else ""

    @app.callback(
        Output("history-output", "children"),
        Input("map", "canUndo"),
        Input("map", "canRedo"),
    )
    def show_history(can_undo, can_redo):
        return json.dumps({"canUndo": can_undo, "canRedo": can_redo})

    dash_duo.start_server(app)
    viewport = dash_duo.wait_for_element("#map .ol-viewport", timeout=15)
    dash_duo.wait_for_element("#map canvas", timeout=15)

    (
        ActionChains(dash_duo.driver)
        .move_to_element_with_offset(viewport, 57, -57)
        .click_and_hold()
        .move_by_offset(-142, 57)
        .release()
        .perform()
    )

    dash_duo.wait_for_contains_text("#validation-output", '"valid": false', timeout=10)
    result = json.loads(dash_duo.find_element("#validation-output").text)
    assert any(error["code"] == "self_intersection" for error in result["errors"])

    restored = json.loads(dash_duo.find_element("#modified-output").text)
    assert (
        restored["features"][0]["geometry"]["coordinates"]
        == geojson["features"][0]["geometry"]["coordinates"]
    )
    dash_duo.wait_for_contains_text("#history-output", '"canUndo": false', timeout=10)
    assert dash_duo.get_logs() == []


def test_modify_interaction_emits_updated_geojson(dash_duo):
    geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[-10, -10], [10, -10], [10, 10], [-10, 10], [-10, -10]]],
                },
                "properties": {"name": "Editable area"},
            }
        ],
    }
    app = dash.Dash(__name__)
    app.layout = dash.html.Div(
        [
            dol.Map(
                id="map",
                center=[0, 0],
                zoom=3,
                projection="EPSG:4326",
                undo=0,
                redo=0,
                children=[
                    dol.VectorLayer(id="editable-layer", geojson=geojson),
                    dol.ModifyInteraction(id="modify", layerId="editable-layer"),
                ],
                style={"height": "400px", "width": "600px"},
            ),
            html.Pre(id="modified-output"),
            html.Button("Undo", id="undo-button"),
            html.Button("Redo", id="redo-button"),
            html.Pre(id="history-output"),
        ]
    )

    @app.callback(
        Output("modified-output", "children"),
        Input("modify", "modifiedGeoJSON"),
    )
    def show_modified_geojson(modified_geojson):
        return json.dumps(modified_geojson) if modified_geojson else ""

    @app.callback(
        Output("map", "undo"),
        Input("undo-button", "n_clicks"),
        State("map", "undo"),
        prevent_initial_call=True,
    )
    def request_undo(clicks, command):
        return command + 1

    @app.callback(
        Output("map", "redo"),
        Input("redo-button", "n_clicks"),
        State("map", "redo"),
        prevent_initial_call=True,
    )
    def request_redo(clicks, command):
        return command + 1

    @app.callback(
        Output("history-output", "children"),
        Input("map", "canUndo"),
        Input("map", "canRedo"),
    )
    def show_history(can_undo, can_redo):
        return json.dumps({"canUndo": can_undo, "canRedo": can_redo})

    dash_duo.start_server(app)
    viewport = dash_duo.wait_for_element("#map .ol-viewport", timeout=15)
    dash_duo.wait_for_element("#map canvas", timeout=15)

    (
        ActionChains(dash_duo.driver)
        .move_to_element_with_offset(viewport, 57, -57)
        .click_and_hold()
        .move_by_offset(30, 0)
        .release()
        .perform()
    )
    dash_duo.wait_for_contains_text("#modified-output", '"type": "FeatureCollection"', timeout=10)

    modified = json.loads(dash_duo.find_element("#modified-output").text)
    assert (
        modified["features"][0]["geometry"]["coordinates"]
        != geojson["features"][0]["geometry"]["coordinates"]
    )

    dash_duo.wait_for_contains_text("#history-output", '"canUndo": true', timeout=10)
    dash_duo.find_element("#undo-button").click()
    dash_duo.wait_for_contains_text("#history-output", '"canRedo": true', timeout=10)
    WebDriverWait(dash_duo.driver, 10).until(
        lambda driver: (
            json.loads(dash_duo.find_element("#modified-output").text)["features"][0]["geometry"][
                "coordinates"
            ]
            == geojson["features"][0]["geometry"]["coordinates"]
        )
    )

    dash_duo.find_element("#redo-button").click()
    dash_duo.wait_for_contains_text("#history-output", '"canUndo": true', timeout=10)
    WebDriverWait(dash_duo.driver, 10).until(
        lambda driver: (
            json.loads(dash_duo.find_element("#modified-output").text)["features"][0]["geometry"][
                "coordinates"
            ]
            == modified["features"][0]["geometry"]["coordinates"]
        )
    )
    assert dash_duo.get_logs() == []


def test_draw_exports_wkt_and_topojson(dash_duo):
    app = dash.Dash(__name__)
    app.layout = dash.html.Div(
        [
            dol.Map(
                id="map",
                center=[0, 0],
                zoom=3,
                projection="EPSG:4326",
                children=[
                    dol.TileLayer(source="OSM"),
                    dol.DrawInteraction(
                        id="draw",
                        geometryType="Point",
                        snapToVertex=False,
                        snapToEdge=False,
                    ),
                ],
                style={"height": "400px", "width": "600px"},
            ),
            html.Pre(id="draw-formats"),
        ]
    )

    @app.callback(
        Output("draw-formats", "children"),
        Input("draw", "drawnWKT"),
        Input("draw", "drawnTopoJSON"),
    )
    def show_draw_formats(wkt, topojson):
        return json.dumps({"wkt": wkt, "topojson": topojson}) if wkt else ""

    dash_duo.start_server(app)
    viewport = dash_duo.wait_for_element("#map .ol-viewport", timeout=15)
    dash_duo.wait_for_element("#map canvas", timeout=15)
    viewport.click()

    dash_duo.wait_for_contains_text("#draw-formats", '"type": "Topology"', timeout=10)
    formats = json.loads(dash_duo.find_element("#draw-formats").text)
    assert formats["wkt"].startswith("POINT(")
    assert formats["topojson"]["type"] == "Topology"
    assert dash_duo.get_logs() == []


def test_wkt_vector_layer_exports_modified_formats(dash_duo):
    app = dash.Dash(__name__)
    app.layout = dash.html.Div(
        [
            dol.Map(
                id="map",
                center=[0, 0],
                zoom=4,
                projection="EPSG:4326",
                children=[
                    dol.VectorLayer(id="wkt-layer", wkt="POINT (0 0)"),
                    dol.ModifyInteraction(
                        id="modify",
                        layerId="wkt-layer",
                        snapToVertex=False,
                        snapToEdge=False,
                    ),
                ],
                style={"height": "400px", "width": "600px"},
            ),
            html.Pre(id="modified-formats"),
        ]
    )

    @app.callback(
        Output("modified-formats", "children"),
        Input("modify", "modifiedGeoJSON"),
        Input("modify", "modifiedWKT"),
        Input("modify", "modifiedTopoJSON"),
    )
    def show_modified_formats(geojson, wkt, topojson):
        return json.dumps({"geojson": geojson, "wkt": wkt, "topojson": topojson}) if wkt else ""

    dash_duo.start_server(app)
    viewport = dash_duo.wait_for_element("#map .ol-viewport", timeout=15)
    dash_duo.wait_for_element("#map canvas", timeout=15)
    (
        ActionChains(dash_duo.driver)
        .move_to_element_with_offset(viewport, 0, 0)
        .click_and_hold()
        .move_by_offset(30, 0)
        .release()
        .perform()
    )

    dash_duo.wait_for_contains_text("#modified-formats", '"type": "Topology"', timeout=10)
    formats = json.loads(dash_duo.find_element("#modified-formats").text)
    assert formats["geojson"]["features"][0]["geometry"]["type"] == "Point"
    assert formats["wkt"].startswith("POINT(")
    assert formats["topojson"]["type"] == "Topology"
    assert dash_duo.get_logs() == []


def test_map_center_zoom_syncs_both_directions(dash_duo):
    target_center = [1_000_000, 2_000_000]
    target_zoom = 5
    app = dash.Dash(__name__)
    app.layout = dash.html.Div(
        [
            html.Button("Set view", id="set-view"),
            dol.Map(
                id="map",
                center=[0, 0],
                zoom=2,
                children=[
                    dol.VectorLayer(
                        id="sync-features",
                        geojson={
                            "type": "FeatureCollection",
                            "features": [
                                {
                                    "type": "Feature",
                                    "geometry": {
                                        "type": "Point",
                                        "coordinates": [8.9831528, 17.6789142],
                                    },
                                    "properties": {},
                                }
                            ],
                        },
                    ),
                ],
                style={"height": "400px", "width": "600px"},
            ),
            html.Pre(id="view-state"),
            html.Pre(id="click-state"),
        ]
    )

    @app.callback(
        Output("map", "center"),
        Output("map", "zoom"),
        Input("set-view", "n_clicks"),
        prevent_initial_call=True,
    )
    def set_view(n_clicks):
        return target_center, target_zoom

    @app.callback(
        Output("view-state", "children"),
        Input("map", "center"),
        Input("map", "zoom"),
    )
    def show_view_state(center, zoom):
        return json.dumps({"center": center, "zoom": zoom})

    @app.callback(Output("click-state", "children"), Input("map", "clickData"))
    def show_click_state(click_data):
        return json.dumps(click_data) if click_data else ""

    dash_duo.start_server(app)
    viewport = dash_duo.wait_for_element("#map .ol-viewport", timeout=15)
    dash_duo.wait_for_element("#map canvas", timeout=15)
    vector_canvas = WebDriverWait(dash_duo.driver, 15).until(
        lambda driver: driver.find_element(By.CSS_SELECTOR, "#map .ol-layer canvas")
    )

    dash_duo.find_element("#set-view").click()
    WebDriverWait(dash_duo.driver, 15).until(
        lambda driver: (
            json.loads(driver.find_element(By.ID, "view-state").text)
            == {"center": target_center, "zoom": target_zoom}
        )
    )
    current_vector_canvas = dash_duo.driver.find_element(By.CSS_SELECTOR, "#map .ol-layer canvas")
    assert current_vector_canvas == vector_canvas
    assert dash_duo.driver.execute_script(
        """
        const canvas = document.querySelector('#map .ol-layer canvas');
        const context = canvas?.getContext('2d');
        if (!context) return false;
        const pixels = context.getImageData(0, 0, context.canvas.width, context.canvas.height).data;
        return pixels.some((value, index) => index % 4 === 3 && value > 0);
        """
    )

    viewport.click()
    dash_duo.wait_for_contains_text("#click-state", '"coordinate"', timeout=10)
    click_data = json.loads(dash_duo.find_element("#click-state").text)
    assert abs(click_data["coordinate"][0] - target_center[0]) < 10_000
    assert abs(click_data["coordinate"][1] - target_center[1]) < 10_000

    (
        ActionChains(dash_duo.driver)
        .move_to_element_with_offset(viewport, 57, -57)
        .click_and_hold()
        .move_by_offset(30, 0)
        .move_by_offset(30, 0)
        .release()
        .perform()
    )
    WebDriverWait(dash_duo.driver, 15).until(
        lambda driver: (
            json.loads(driver.find_element(By.ID, "view-state").text)["center"] != target_center
        )
    )

    dash_duo.driver.execute_script(
        """
        document.querySelector('#map .ol-viewport').dispatchEvent(
          new WheelEvent('wheel', {deltaY: -100, bubbles: true, cancelable: true})
        );
        """
    )
    WebDriverWait(dash_duo.driver, 15).until(
        lambda driver: (
            json.loads(driver.find_element(By.ID, "view-state").text)["zoom"] > target_zoom
        )
    )
    assert dash_duo.get_logs() == []


def test_map_registers_custom_projection(dash_duo):
    app = dash.Dash(__name__)
    app.layout = dash.html.Div(
        [
            dol.Map(
                id="map",
                center=[530_000, 180_000],
                zoom=10,
                projection="EPSG:27700",
                proj4Defs=[
                    {
                        "code": "EPSG:27700",
                        "def": (
                            "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 "
                            "+x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 "
                            "+units=m +no_defs"
                        ),
                    }
                ],
                style={"height": "400px", "width": "600px"},
            ),
            html.Pre(id="click-state"),
        ]
    )

    @app.callback(Output("click-state", "children"), Input("map", "clickData"))
    def show_click_state(click_data):
        return json.dumps(click_data) if click_data else ""

    dash_duo.start_server(app)
    viewport = dash_duo.wait_for_element("#map .ol-viewport", timeout=15)
    viewport.click()
    dash_duo.wait_for_contains_text("#click-state", '"latLon"', timeout=10)

    click_data = json.loads(dash_duo.find_element("#click-state").text)
    latitude, longitude = click_data["latLon"]
    assert abs(latitude - 51.5) < 0.1
    assert abs(longitude - (-0.13)) < 0.1
    assert dash_duo.get_logs() == []
