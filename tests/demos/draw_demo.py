import json

import dash
from dash import Input, Output, dcc, html

import dash_openlayers as dol

snap_targets = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[-10, -10], [10, -10], [10, 10], [-10, 10], [-10, -10]]],
            },
            "properties": {"name": "Editable area"},
        },
        {
            "type": "Feature",
            "geometry": {"type": "LineString", "coordinates": [[-20, 0], [-10, 0]]},
            "properties": {"name": "Reference edge"},
        },
    ],
}

app = dash.Dash(__name__)

app.layout = html.Div(
    [
        dol.Map(
            id="map",
            center=[0, 0],
            zoom=3,
            children=[
                dol.TileLayer(source="OSM"),
                dol.VectorLayer(
                    id="snap-targets",
                    geojson=snap_targets,
                    style={
                        "fill-color": "rgba(31, 106, 94, 0.2)",
                        "stroke-color": "#1f6a5e",
                        "stroke-width": 2,
                    },
                ),
                dol.ModifyInteraction(
                    id="modify-tool",
                    layerId="snap-targets",
                    snapToVertex=True,
                    snapToEdge=True,
                    snapTolerance=14,
                    preserveTopology=True,
                ),
                dol.DrawInteraction(
                    id="draw-tool",
                    geometryType="Polygon",
                    snapToVertex=True,
                    snapToEdge=True,
                    snapTolerance=14,
                ),
            ],
            style={"height": "600px"},
        ),
        html.P(
            "Draw near the polygon or line to snap. "
            "Drag a polygon corner across an edge to see the topology guard."
        ),
        html.Label("Snap tolerance (pixels)"),
        dcc.Slider(
            id="snap-tolerance",
            min=0,
            max=30,
            step=1,
            value=14,
            marks={0: "0", 10: "10", 20: "20", 30: "30"},
        ),
        html.Pre(id="geojson-output"),
        html.Pre(id="draw-validation-output"),
        html.Pre(id="modify-validation-output"),
    ]
)


@app.callback(Output("geojson-output", "children"), Input("draw-tool", "drawnGeoJSON"))
def show_drawn_geojson(feature):
    return json.dumps(feature, indent=2) if feature else "Draw a feature to inspect its GeoJSON."


@app.callback(
    Output("draw-tool", "snapTolerance"),
    Output("modify-tool", "snapTolerance"),
    Input("snap-tolerance", "value"),
)
def update_snap_tolerance(value):
    return value, value


@app.callback(
    Output("draw-validation-output", "children"),
    Input("draw-tool", "geometryValidation"),
)
def show_draw_validation(result):
    return json.dumps(result, indent=2) if result else "Draw validation appears here."


@app.callback(
    Output("modify-validation-output", "children"),
    Input("modify-tool", "geometryValidation"),
)
def show_modify_validation(result):
    return json.dumps(result, indent=2) if result else "Modify validation appears here."


if __name__ == "__main__":
    app.run(debug=True)
