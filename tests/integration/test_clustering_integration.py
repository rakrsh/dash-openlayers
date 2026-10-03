import dash

import dash_openlayers as dol


def test_vector_layer_clusters_points_and_declutters(dash_duo):
    points = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [0, 0]},
                "properties": {"name": "A"},
            },
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [0.02, 0.01]},
                "properties": {"name": "B"},
            },
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [-0.01, -0.02]},
                "properties": {"name": "C"},
            },
        ],
    }
    app = dash.Dash(__name__)
    app.layout = dol.Map(
        id="map",
        center=[0, 0],
        zoom=5,
        projection="EPSG:4326",
        children=[
            dol.VectorLayer(
                id="city-sites",
                geojson=points,
                clusterDistance=48,
                clusterMinDistance=16,
                declutter="city-labels",
                style={
                    "circle-radius": 5,
                    "circle-fill-color": "#d66f41",
                    "text-value": ["get", "name"],
                    "text-offset-y": -12,
                },
            )
        ],
        style={"height": "400px", "width": "600px"},
    )

    dash_duo.start_server(app)
    dash_duo.wait_for_element("#map .ol-viewport", timeout=15)
    canvas = dash_duo.wait_for_element("#map canvas", timeout=15)
    assert int(canvas.get_attribute("width")) > 0
    assert dash_duo.get_logs() == []
