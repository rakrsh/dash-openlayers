import dash
from dash import Input, Output, html
from data import POINTS
from shapely.geometry import shape

import dash_openlayers as dol

app = dash.Dash(__name__)
app.layout = html.Main(
    [
        html.H1("Spatial filter dashboard"),
        html.P(id="filter-summary", children="Draw a polygon or rectangle to filter observations."),
        dol.Map(
            id="map",
            center=[-0.10, 51.515],
            zoom=12,
            projection="EPSG:4326",
            children=[
                dol.TileLayer(id="basemap", source="OSM"),
                dol.VectorLayer(
                    id="observations",
                    data=POINTS,
                    style={
                        "circle-radius": 7,
                        "circle-fill-color": "#d65b3d",
                        "circle-stroke-color": "#ffffff",
                        "circle-stroke-width": 2,
                    },
                ),
                dol.DrawControl(
                    id="area-draw",
                    geometryTypes=["Polygon", "Box"],
                    position="top-left",
                    title="Filter area",
                ),
            ],
            style={"height": "640px", "width": "100%"},
        ),
    ],
    style={"maxWidth": "1100px", "margin": "0 auto", "padding": "16px"},
)


@app.callback(
    Output("observations", "data"),
    Output("filter-summary", "children"),
    Input("area-draw", "drawnGeoJSON"),
)
def filter_observations(area_feature):
    if not area_feature:
        return POINTS, "Draw a polygon or rectangle to filter observations."

    area = shape(area_feature["geometry"])
    matching_features = [
        feature for feature in POINTS["features"] if area.intersects(shape(feature["geometry"]))
    ]
    filtered_points = {"type": "FeatureCollection", "features": matching_features}
    summary = f"{len(matching_features)} of {len(POINTS['features'])} observations in area."
    return filtered_points, summary


if __name__ == "__main__":
    app.run(debug=True)
