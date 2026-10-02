import json

import dash
from dash import Input, Output, html

import dash_openlayers as dol

app = dash.Dash(__name__)

app.layout = html.Div(
    [
        dol.Map(
            id="map",
            center=[0, 0],
            zoom=2,
            children=[
                dol.TileLayer(source="OSM"),
                dol.DrawInteraction(id="draw-tool", geometryType="Polygon"),
            ],
            style={"height": "500px"},
        ),
        html.Pre(id="geojson-output"),
    ]
)


@app.callback(Output("geojson-output", "children"), Input("draw-tool", "drawnGeoJSON"))
def show_drawn_geojson(feature):
    return json.dumps(feature, indent=2) if feature else "Draw a feature to inspect its GeoJSON."


if __name__ == "__main__":
    app.run(debug=True)
