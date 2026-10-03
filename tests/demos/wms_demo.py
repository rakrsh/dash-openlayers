import dash
from dash import Input, Output, dcc, html

import dash_openlayers as dol

WMS_URL = "https://ahocevar.com/geoserver/wms"
INITIAL_PARAMS = {"LAYERS": "ne:NE1_HR_LC_SR_W_DR", "STYLES": ""}

app = dash.Dash(__name__)

app.layout = html.Div(
    [
        html.Label("WMS layer"),
        dcc.Dropdown(
            id="wms-layer-select",
            options=[
                {"label": "Shaded relief", "value": "ne:NE1_HR_LC_SR_W_DR"},
                {"label": "Countries", "value": "ne:ne_10m_admin_0_countries"},
            ],
            value=INITIAL_PARAMS["LAYERS"],
            clearable=False,
        ),
        dol.Map(
            id="map",
            center=[0, 0],
            zoom=2,
            children=[
                dol.TileWMS(
                    id="tile-wms",
                    url=WMS_URL,
                    params=INITIAL_PARAMS,
                    serverType="geoserver",
                ),
                dol.ImageWMS(
                    id="image-wms",
                    url=WMS_URL,
                    params=INITIAL_PARAMS,
                    serverType="geoserver",
                ),
            ],
            style={"height": "600px", "width": "100%"},
        ),
    ]
)


@app.callback(
    Output("tile-wms", "params"),
    Output("image-wms", "params"),
    Input("wms-layer-select", "value"),
)
def update_wms_layers(layer_name):
    params = {"LAYERS": layer_name, "STYLES": ""}
    return params, params


if __name__ == "__main__":
    app.run(debug=True)
