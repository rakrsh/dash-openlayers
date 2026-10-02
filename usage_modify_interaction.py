import json

import dash
from dash import Input, Output, html

import dash_openlayers as dol

FEATURES = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[-10, -10], [10, -10], [10, 10], [-10, 10], [-10, -10]]],
            },
            "properties": {"name": "Editable area"},
        }
    ],
}

app = dash.Dash(__name__)
app.layout = html.Div(
    [
        dol.Map(
            id="map",
            center=[0, 0],
            zoom=3,
            projection="EPSG:4326",
            children=[
                dol.VectorLayer(id="editable-layer", geojson=FEATURES),
                dol.ModifyInteraction(id="modify", layerId="editable-layer"),
            ],
            style={"height": "500px", "width": "100%"},
        ),
        html.Pre(id="modified-output"),
    ]
)


@app.callback(
    Output("modified-output", "children"),
    Input("modify", "modifiedGeoJSON"),
)
def show_modified_geojson(modified_geojson):
    return json.dumps(modified_geojson, indent=2) if modified_geojson else ""


if __name__ == "__main__":
    app.run(debug=True)
