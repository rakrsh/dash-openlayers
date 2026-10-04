import json

import dash
from dash import Input, Output, html

import dash_openlayers as dol

app = dash.Dash(__name__)
app.layout = html.Main(
    [
        html.H1("Basic tile map"),
        dol.Map(
            id="map",
            center=[-0.1276, 51.5072],
            zoom=10,
            projection="EPSG:4326",
            children=[dol.TileLayer(id="basemap", source="OSM")],
            style={"height": "600px", "width": "100%"},
        ),
        html.Pre(id="click-output", children="Click the map to inspect its coordinates."),
    ],
    style={"maxWidth": "1100px", "margin": "0 auto", "padding": "16px"},
)


@app.callback(Output("click-output", "children"), Input("map", "clickData"))
def show_click_data(click_data):
    if not click_data:
        return "Click the map to inspect its coordinates."
    return json.dumps(click_data, indent=2)


if __name__ == "__main__":
    app.run(debug=True)
