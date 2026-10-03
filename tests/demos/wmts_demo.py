import os

import dash
from dash import html

import dash_openlayers as dol

CAPABILITIES_URL = os.environ.get(
    "WMTS_CAPABILITIES_URL",
    "https://ahocevar.com/geoserver/gwc/service/wmts?REQUEST=GetCapabilities",
)
LAYER_NAME = os.environ.get("WMTS_LAYER", "ne:ne_10m_admin_0_countries")

app = dash.Dash(__name__)

app.layout = html.Div(
    [
        dol.Map(
            id="map",
            center=[0, 0],
            zoom=2,
            children=[
                dol.TileLayer(source="OSM"),
                dol.WMTSLayer(
                    id="countries-wmts",
                    url=CAPABILITIES_URL,
                    layer=LAYER_NAME,
                    projection="EPSG:3857",
                    attributions="GeoServer demo data",
                ),
            ],
            style={"height": "600px", "width": "100%"},
        )
    ]
)

if __name__ == "__main__":
    app.run(debug=True)
