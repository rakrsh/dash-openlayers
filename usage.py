import dash
from dash import Input, Output, html

import dash_openlayers as dol

app = dash.Dash(__name__)

SAMPLE_FEATURES = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [10, 45]},
            "properties": {"name": "Sample location"},
        }
    ],
}

app.layout = html.Div(
    [
        dol.Map(
            id="map",
            center=[10, 45],
            zoom=5,
            children=[
                dol.TileLayer(id="basemap", source="OSM"),
                dol.VectorLayer(
                    id="sample-features",
                    geojson=SAMPLE_FEATURES,
                    style={"circle-radius": 7, "circle-fill-color": "#d66f41"},
                ),
                dol.SelectInteraction(id="selection", layerId="sample-features"),
                dol.LayerControl(id="layer-control"),
            ],
            style={"height": "600px", "width": "100%"},
        ),
        html.Pre(id="map-info"),
        html.Pre(id="selection-info"),
    ]
)


@app.callback(Output("map-info", "children"), Input("map", "clickData"))
def show_click(click):
    return str(click) if click else "Click the map to see event data."


@app.callback(Output("selection-info", "children"), Input("selection", "selectedGeoJSON"))
def show_selection(selection):
    count = len(selection.get("features", [])) if selection else 0
    return f"Selected features: {count}"


if __name__ == "__main__":
    app.run_server(debug=True)
