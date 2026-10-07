import dash
from dash import Input, Output, html

import dash_openlayers as dol

FEATURES = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [-2, 1]},
            "properties": {"name": "Point"},
        },
        {
            "type": "Feature",
            "geometry": {"type": "LineString", "coordinates": [[-8, -5], [0, -2], [8, -5]]},
            "properties": {"name": "Line"},
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[3, 3], [10, 3], [10, 10], [3, 10], [3, 3]]],
            },
            "properties": {"name": "Polygon"},
        },
    ],
}

MOVED_FEATURES = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [18, 8]},
            "properties": {"name": "Moved point"},
        },
        {
            "type": "Feature",
            "geometry": {"type": "LineString", "coordinates": [[10, -5], [18, -2], [25, -5]]},
            "properties": {"name": "Moved line"},
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[18, 12], [25, 12], [25, 20], [18, 20], [18, 12]]],
            },
            "properties": {"name": "Moved polygon"},
        },
    ],
}

app = dash.Dash(__name__)
app.layout = html.Div(
    [
        html.Button("Move features", id="move-features"),
        dol.Map(
            id="map",
            center=[0, 0],
            zoom=4,
            children=[
                dol.VectorLayer(
                    id="vector-layer",
                    geojson=FEATURES,
                    style={
                        "fillColor": "#d5e8e2",
                        "strokeColor": "#1f6a5e",
                        "strokeWidth": 2,
                        "radius": 7,
                        "rules": [
                            {
                                "property": "name",
                                "operator": "==",
                                "value": "Point",
                                "style": {
                                    "marker": {
                                        "svg": (
                                            '<svg xmlns="http://www.w3.org/2000/svg" '
                                            'width="24" height="24" viewBox="0 0 24 24">'
                                            '<circle cx="12" cy="12" r="9" fill="#d66f41" '
                                            'stroke="#ffffff" stroke-width="2"/></svg>'
                                        )
                                    }
                                },
                            }
                        ],
                    },
                    hoverStyle={"fillColor": "#ffd166", "strokeWidth": 3, "radius": 9},
                    selectedStyle={"fillColor": "#ef476f", "strokeColor": "#ffffff"},
                )
            ],
            style={"height": "600px", "width": "100%"},
        ),
    ]
)


@app.callback(
    Output("vector-layer", "geojson"),
    Input("move-features", "n_clicks"),
)
def move_features(n_clicks):
    return MOVED_FEATURES if n_clicks else FEATURES


if __name__ == "__main__":
    app.run(debug=True)
