import json

import dash
from dash import Input, Output, html
from selenium.webdriver.common.action_chains import ActionChains

import dash_openlayers as dol


def test_draw_interaction(dash_duo):
    app = dash.Dash(__name__)
    app.layout = dash.html.Div(
        [
            dol.Map(
                id="map",
                center=[1_113_194.9, 5_621_521.5],
                zoom=5,
                children=[
                    dol.TileLayer(source="OSM"),
                    dol.DrawInteraction(id="draw-tool", geometryType="Polygon"),
                ],
                style={"height": "300px"},
            ),
            html.Pre(id="geojson-output"),
            html.Pre(id="validation-output"),
        ]
    )

    @app.callback(Output("geojson-output", "children"), Input("draw-tool", "drawnGeoJSON"))
    def show_drawn_geojson(feature):
        return json.dumps(feature) if feature else ""

    @app.callback(Output("validation-output", "children"), Input("draw-tool", "geometryValidation"))
    def show_geometry_validation(result):
        return json.dumps(result) if result else ""

    dash_duo.start_server(app)
    # Wait for OpenLayers map viewport to appear (created by the client-side JS)
    try:
        el = dash_duo.wait_for_element("div.ol-viewport", timeout=15)
    except Exception:
        print(dash_duo.driver.page_source[:10000])
        try:
            print(dash_duo.driver.get_log("browser"))
        except Exception:
            pass
        raise
    assert el is not None
    dash_duo.wait_for_element("#map canvas", timeout=15)

    viewport = dash_duo.find_element("#map .ol-viewport")
    (
        ActionChains(dash_duo.driver)
        .move_to_element_with_offset(viewport, -40, -30)
        .click()
        .move_to_element_with_offset(viewport, 40, -30)
        .click()
        .move_to_element_with_offset(viewport, 40, 30)
        .click()
        .move_to_element_with_offset(viewport, -40, 30)
        .click()
        .double_click()
        .perform()
    )
    dash_duo.wait_for_contains_text("#geojson-output", '"type": "Feature"', timeout=10)
    dash_duo.wait_for_contains_text("#validation-output", '"valid": true', timeout=10)

    feature = json.loads(dash_duo.find_element("#geojson-output").text)
    assert feature["geometry"]["type"] == "Polygon"
    ring = feature["geometry"]["coordinates"][0]
    assert len(ring) >= 4
    assert all(-180 <= longitude <= 180 and -90 <= latitude <= 90 for longitude, latitude in ring)
    assert all(8 < longitude < 12 and 43 < latitude < 47 for longitude, latitude in ring)
    assert dash_duo.get_logs() == []


def test_draw_line_string_emits_geojson(dash_duo):
    app = dash.Dash(__name__)
    app.layout = dash.html.Div(
        [
            dol.Map(
                id="map",
                center=[1_113_194.9, 5_621_521.5],
                zoom=5,
                children=[
                    dol.TileLayer(source="OSM"),
                    dol.DrawInteraction(id="draw-tool", geometryType="LineString"),
                ],
                style={"height": "300px"},
            ),
            html.Pre(id="geojson-output"),
        ]
    )

    @app.callback(Output("geojson-output", "children"), Input("draw-tool", "drawnGeoJSON"))
    def show_drawn_geojson(feature):
        return json.dumps(feature) if feature else ""

    dash_duo.start_server(app)
    viewport = dash_duo.wait_for_element("#map .ol-viewport", timeout=15)
    dash_duo.wait_for_element("#map canvas", timeout=15)

    (
        ActionChains(dash_duo.driver)
        .move_to_element_with_offset(viewport, -40, -20)
        .click()
        .move_to_element_with_offset(viewport, 0, 20)
        .click()
        .move_to_element_with_offset(viewport, 40, -20)
        .double_click()
        .perform()
    )
    dash_duo.wait_for_contains_text("#geojson-output", '"type": "Feature"', timeout=10)

    feature = json.loads(dash_duo.find_element("#geojson-output").text)
    assert feature["geometry"]["type"] == "LineString"
    coordinates = feature["geometry"]["coordinates"]
    assert len(coordinates) >= 2
    assert all(
        -180 <= longitude <= 180 and -90 <= latitude <= 90 for longitude, latitude in coordinates
    )
    assert all(8 < longitude < 12 and 43 < latitude < 47 for longitude, latitude in coordinates)
    assert dash_duo.get_logs() == []
