import dash
from dash import html

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
        )
    ]
)

if __name__ == "__main__":
    app.run_server(debug=True)
