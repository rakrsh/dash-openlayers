import json

import dash
import geopandas as gpd
from dash import html
from shapely.geometry import Polygon

import dash_openlayers as dol

regions = gpd.GeoDataFrame(
    {
        "name": ["West", "Central", "East", "North"],
        "rate": [18, 42, 67, 91],
    },
    geometry=[
        Polygon([(-0.65, 51.35), (-0.22, 51.35), (-0.22, 51.62), (-0.65, 51.62)]),
        Polygon([(-0.22, 51.35), (0.18, 51.35), (0.18, 51.62), (-0.22, 51.62)]),
        Polygon([(0.18, 51.35), (0.62, 51.35), (0.62, 51.62), (0.18, 51.62)]),
        Polygon([(-0.22, 51.62), (0.18, 51.62), (0.18, 51.88), (-0.22, 51.88)]),
    ],
    crs="EPSG:4326",
)
geojson = json.loads(regions.to_json(drop_id=True))

choropleth_style = {
    "fill-color": [
        "interpolate",
        ["linear"],
        ["get", "rate"],
        0,
        "#e8f1ed",
        100,
        "#176b5b",
    ],
    "stroke-color": "#ffffff",
    "stroke-width": 2,
    "text-value": ["get", "name"],
    "text-fill-color": "#142823",
    "text-stroke-color": "#ffffff",
    "text-stroke-width": 3,
}

app = dash.Dash(__name__)
app.layout = html.Main(
    [
        html.H1("GeoPandas choropleth"),
        html.P("Example rate by area"),
        dol.Map(
            id="map",
            center=[-0.05, 51.60],
            zoom=9,
            projection="EPSG:4326",
            children=[
                dol.TileLayer(id="basemap", source="OSM"),
                dol.VectorLayer(id="regions", data=geojson, style=choropleth_style),
            ],
            style={"height": "600px", "width": "100%"},
        ),
        html.P("The rate is stored in each feature's GeoJSON properties."),
    ],
    style={"maxWidth": "1100px", "margin": "0 auto", "padding": "16px"},
)


if __name__ == "__main__":
    app.run(debug=True)
