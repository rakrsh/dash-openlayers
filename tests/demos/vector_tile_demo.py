import dash
from dash import html

import dash_openlayers as dol

app = dash.Dash(__name__)

VECTOR_STYLE = {
    "fill-color": "rgba(31, 106, 94, 0.24)",
    "stroke-color": "#1f6a5e",
    "stroke-width": 1,
    "circle-radius": 3,
    "circle-fill-color": "#d66f41",
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 1,
}

app.layout = html.Div(
    [
        html.H1("Vector tile layer"),
        dol.Map(
            id="map",
            center=[0, 0],
            zoom=2,
            children=[
                dol.VectorTileLayer(
                    id="vector-tiles",
                    url="https://tiles.openfreemap.org/planet/{z}/{x}/{y}.pbf",
                    projection="EPSG:3857",
                    attributions="© OpenFreeMap, © OpenStreetMap contributors",
                    style=VECTOR_STYLE,
                )
            ],
            style={"height": "600px", "width": "100%"},
        ),
    ]
)

if __name__ == "__main__":
    app.run(debug=True)
