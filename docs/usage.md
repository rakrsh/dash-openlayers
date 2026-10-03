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

`TileWMS` requests tiled WMS images. `ImageWMS` requests one image for the map
viewport. Both accept a WMS endpoint, request `params` (including `LAYERS`),
and an optional `serverType` (`geoserver`, `mapserver`, `carmentaserver`, or
`qgis`). Changing the `params` prop calls OpenLayers `updateParams`, causing the
source to request the updated layer:

```python
dol.Map(
    id="wms-map",
    center=[0, 0],
    zoom=2,
    children=[
        dol.TileWMS(
            id="roads-wms",
            url="https://maps.example.com/geoserver/wms",
            params={"LAYERS": "workspace:roads", "STYLES": ""},
            serverType="geoserver",
        ),
        dol.ImageWMS(
            id="boundaries-wms",
            url="https://maps.example.com/geoserver/wms",
            params={"LAYERS": "workspace:boundaries", "STYLES": ""},
            serverType="geoserver",
        ),
    ],
    style={"height": "500px"},
)
```

For dynamic layer switching, update the full `params` object from a Dash
callback, for example `Output("roads-wms", "params")`. WMS servers must allow
cross-origin requests from the Dash app's origin.

`VectorTileLayer` loads Mapbox Vector Tile (MVT/PBF) data from a URL template.
Use `urls` instead of `url` to supply multiple templates for load balancing.
The `style` prop is an OpenLayers flat-style object, not a Mapbox GL style
document:

```python
vector_style = {
    "fill-color": "rgba(31, 106, 94, 0.24)",
    "stroke-color": "#1f6a5e",
    "stroke-width": 1,
    "circle-radius": 3,
    "circle-fill-color": "#d66f41",
}

dol.Map(
    id="vector-map",
    center=[0, 0],
    zoom=2,
    children=[
        dol.VectorTileLayer(
            id="vector-tiles",
            url="https://tiles.openfreemap.org/planet/{z}/{x}/{y}.pbf",
            projection="EPSG:3857",
            attributions="© OpenFreeMap, © OpenStreetMap contributors",
            style=vector_style,
        )
    ],
    style={"height": "500px"},
)
```

The `projection` prop describes the tile source's projection and defaults to
`EPSG:3857`. It must match the CRS and tile grid advertised by the MVT server.
OpenLayers transforms source coordinates for the map view when the required
projections are registered. For custom CRSs, register the definition through
the parent `Map`'s `proj4Defs` prop before using that code as the map or source
projection. Some providers use nonstandard tile matrices that cannot be
described by the `{z}/{x}/{y}` URL template; use a compatible XYZ MVT endpoint.
See `tests/demos/vector_tile_demo.py` for a runnable styled example.

Add a `ModifyInteraction` beside a `VectorLayer` to drag feature vertices.
Pass the vector layer's Dash `id` as `layerId`; `modifiedGeoJSON` receives the
updated FeatureCollection after each completed edit:

```python
dol.Map(
    id="map",
    center=[0, 0],
    zoom=4,
    children=[
        dol.VectorLayer(id="editable", geojson=features),
        dol.ModifyInteraction(id="modify", layerId="editable"),
    ],
    style={"height": "500px"},
)
```

Use `Input("modify", "modifiedGeoJSON")` in a Dash callback to receive the
edited FeatureCollection.

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
