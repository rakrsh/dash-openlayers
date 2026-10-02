# Usage

`TileLayer` supports the built-in OpenStreetMap source and custom XYZ tile URL
templates:

```python
dol.Map(
    id="map",
    center=[0, 0],
    zoom=2,
    children=[
        dol.TileLayer(source="OSM"),
        dol.TileLayer(url="https://tiles.example.com/{z}/{x}/{y}.png"),
    ],
    style={"height": "500px"},
)
```

`VectorLayer` renders a GeoJSON Feature or FeatureCollection. Coordinates use
GeoJSON's `[longitude, latitude]` order and are transformed into the map's
projection. Updating `geojson` from a Dash callback replaces the rendered
features:

```python
features = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [-0.1, 51.5]},
            "properties": {"name": "London"},
        }
    ],
}

dol.Map(
    id="map",
    center=[-0.1, 51.5],
    zoom=8,
    children=[dol.VectorLayer(id="features", geojson=features)],
    style={"height": "500px"},
)
```

Example usage (from the repository `usage.py`) — draw polygons and capture GeoJSON:

```python
import dash
from dash import html, Output, Input, json
import dash_openlayers as dol

app = dash.Dash(__name__)

BNG_PROJ = [
    {
        "code": "EPSG:27700",
        "def": "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs",
    }
]

app.layout = html.Div(
    [
        dol.Map(
            id="map",
            projection="EPSG:27700",
            proj4Defs=BNG_PROJ,
            center=[530000, 180000],
            zoom=10,
            children=[
                dol.TileLayer(source="OSM"),
                dol.DrawInteraction(id="draw-tool", geometryType="Polygon"),
            ],
            style={"height": "600px", "width": "100%"},
        ),
        html.Pre(id="geojson-output"),
    ]
)

if __name__ == "__main__":
    app.run_server(debug=True)
```
