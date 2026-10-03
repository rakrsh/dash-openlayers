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
        }
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
                dol.VectorLayer(id="observations", geojson=features),
                dol.LayerControl(id="layer-control"),
            ],
            style={"height": "600px"},
        )
    ]
)


if __name__ == "__main__":
    app.run(debug=True)
