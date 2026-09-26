import json

import dash
from dash import Input, Output, html

import dash_openlayers as dol

app = dash.Dash(__name__)

BNG_PROJ = [
    {
        "code": "EPSG:27700",
        "def": "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs",  # noqa: E501
    }
]

app.layout = html.Div(
    [
        html.H1("dash-openlayers demo"),
        dol.Map(
            id="map",
            projection="EPSG:3857",
            proj4Defs=BNG_PROJ,
            center=[0, 0],
            zoom=2,
            style={"height": "600px", "width": "100%"},
        ),
        html.H3("Map Event Data"),
        html.Pre(id="map-info", style={"background": "#f4f4f4", "padding": "10px"}),
    ]
)


@app.callback(Output("map-info", "children"), Input("map", "clickData"))
def show_click(click):
    if click:
        return json.dumps(click, indent=2)
    return "Click on the map to see event data."


if __name__ == "__main__":
    app.run_server(debug=True)
