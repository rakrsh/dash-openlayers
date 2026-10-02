import json
import time

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
                center=[0, 0],
                zoom=2,
                children=[
                    dol.TileLayer(source="OSM"),
                    dol.DrawInteraction(id="draw-tool", geometryType="Point"),
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
    time.sleep(1)

    viewport = dash_duo.find_element("#map .ol-viewport")
    ActionChains(dash_duo.driver).move_to_element(viewport).click().perform()
    dash_duo.wait_for_contains_text("#geojson-output", '"type": "Feature"', timeout=10)

    feature = json.loads(dash_duo.find_element("#geojson-output").text)
    assert feature["geometry"]["type"] == "Point"
    assert len(feature["geometry"]["coordinates"]) == 2
    assert dash_duo.get_logs() == []
