import dash
from dash import html

import dash_openlayers as dol

features = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [0, 0]},
            "properties": {"name": "Origin"},
        },
        {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [0.15, 0.08]},
            "properties": {"name": "Near origin A"},
        },
        {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [-0.12, -0.06]},
            "properties": {"name": "Near origin B"},
        },
    ],
}

app = dash.Dash(__name__)
app.layout = html.Div(
    [
        dol.Map(
            id="map",
            center=[0, 0],
            zoom=3,
            children=[
                dol.TileLayer(id="base-map", source="OSM"),
                dol.VectorLayer(
                    id="observations",
                    geojson=features,
                    clusterDistance=40,
                    clusterMinDistance=12,
                    declutter="map-labels",
                ),
                dol.LayerControl(id="layer-control"),
            ],
            style={"height": "600px"},
        )
    ]
)


if __name__ == "__main__":
    app.run(debug=True)
