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
            children=[dol.TileLayer(source="OSM")],
            style={"height": "500px"},
        ),
        html.Pre(id="click-output"),
    ]
)


@app.callback(Output("click-output", "children"), Input("map", "clickData"))
def show_click_data(click_data):
    return json.dumps(click_data, indent=2) if click_data else "Click the map to inspect clickData."


if __name__ == "__main__":
    app.run_server(debug=True)
