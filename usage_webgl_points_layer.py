import dash

import dash_openlayers as dol

FEATURES = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [((index % 200) - 100) / 100, ((index // 200) - 50) / 100],
            },
            "properties": {
                "kind": "station" if index % 2 else "incident",
                "magnitude": index % 11,
            },
        }
        for index in range(20_000)
    ],
}

STYLE = {
    "shape-points": ["match", ["get", "kind"], "station", 5, 4],
    "shape-radius": ["interpolate", ["linear"], ["get", "magnitude"], 0, 3, 10, 9],
    "shape-fill-color": [
        "match",
        ["get", "kind"],
        "station",
        "#d66f41",
        "incident",
        "#1f6a5e",
        "#284d78",
    ],
}

app = dash.Dash(__name__)
app.layout = dol.Map(
    id="large-points-map",
    center=[0, 0],
    zoom=5,
    children=[
        dol.WebGLPointsLayer(
            id="large-points",
            data=FEATURES,
            style=STYLE,
            disableHitDetection=True,
        )
    ],
    style={"height": "600px", "width": "100%"},
)


if __name__ == "__main__":
    app.run(debug=True)
