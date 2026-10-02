import json
import time

import dash
from dash import Input, Output, html

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
    time.sleep(1)
    dash_duo.find_element("#map .ol-viewport").click()
    dash_duo.wait_for_contains_text("#click-output", '"latLon"', timeout=10)

    click_data = json.loads(dash_duo.find_element("#click-output").text)
    assert len(click_data["coordinate"]) == 2
    assert len(click_data["latLon"]) == 2
    assert dash_duo.get_logs() == []
