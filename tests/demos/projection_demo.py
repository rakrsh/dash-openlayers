import dash
from dash import html

import dash_openlayers as dol

BNG_PROJ = [
    {
        "code": "EPSG:27700",
        "def": (
            "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 "
            "+x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs"
        ),
    }
]

app = dash.Dash(__name__)

app.layout = html.Div(
    [
        dol.Map(
            id="map",
            projection="EPSG:27700",
            proj4Defs=BNG_PROJ,
            center=[530000, 180000],
            zoom=10,
            children=[dol.TileLayer(source="OSM")],
            style={"height": "500px"},
        )
    ]
)

if __name__ == "__main__":
    app.run(debug=True)
