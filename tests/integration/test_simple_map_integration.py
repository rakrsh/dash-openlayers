import time

import dash

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
            )
        ]
    )

    dash_duo.start_server(app)
    # Wait for OpenLayers map viewport to appear (created by the client-side JS)
    el = dash_duo.wait_for_element("div.ol-viewport", timeout=15)
    assert el is not None
    # allow map to initialize
    time.sleep(1)
