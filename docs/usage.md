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

`WMTSLayer` reads a WMTS GetCapabilities document and derives the advertised
tile grid, matrix set, style, and request URLs. Set `layer` to the advertised
identifier; provide `matrixSet` or `projection` when the service offers more
than one option. The capabilities endpoint must allow browser CORS access:

```python
dol.Map(
    id="wmts-map",
    center=[0, 0],
    zoom=2,
    children=[
        dol.WMTSLayer(
            id="basemap-wmts",
            url="https://tiles.example.com/wmts?SERVICE=WMTS&REQUEST=GetCapabilities",
            layer="example:basemap",
            matrixSet="EPSG:3857",
            projection="EPSG:3857",
            style="default",
            format="image/png",
            requestEncoding="KVP",
        )
    ],
    style={"height": "500px"},
)
```

See `tests/demos/wmts_demo.py` for a complete example.

## WFS and WFS-T

WFS features can be fetched as GeoJSON and passed to `VectorLayer`. Combine
that layer with `ModifyInteraction` to edit features in the browser. The demo
`tests/demos/wfs_demo.py` shows a WFS 2.0 `GetFeature` request, an edit action,
and an explicit WFS-T `Transaction` callback that writes edited points back to
a configured server. It only enables writes when `WFS_TRANSACTION_URL` is set;
never point the example at a shared or read-only WFS endpoint.

The demo expects the service URL in `WFS_URL`, feature type in
`WFS_FEATURE_TYPE`, and, for transactional writes, `WFS_TRANSACTION_URL`,
`WFS_FEATURE_NAMESPACE`, and `WFS_GEOMETRY_PROPERTY`. The sample transaction
updates Point geometries in CRS84; adapt its geometry encoding and feature ID
filter to the schema and WFS version supported by your server.

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

Draw and Modify snap to vertices and edges from mounted `VectorLayer` sources
on the same map. Both targets are enabled by default. Set `snapToVertex`,
`snapToEdge`, and `snapTolerance` to select targets and set the maximum distance
in screen pixels.

`ModifyInteraction` defaults to `preserveTopology=True`. If an edit changes a
valid Polygon or MultiPolygon into an invalid ring or self-intersecting shape,
the geometry is restored and the edit is not added to undo history. Read the
last result from `geometryValidation`; setting `preserveTopology=False` allows
the edit. This check is per feature and does not enforce adjacency, overlap, or
coverage rules between separate features.

```python
dol.ModifyInteraction(
    id="modify",
    layerId="editable",
    snapToVertex=True,
    snapToEdge=False,
    snapTolerance=16,
    preserveTopology=True,
)
```

Subscribe to the validation result with `Input("modify", "geometryValidation")`:

```python
import json
from dash import Input, Output


@app.callback(Output("validation-output", "children"), Input("modify", "geometryValidation"))
def show_edit_validation(result):
    return json.dumps(result) if result else ""
```

For runnable examples with vector snap targets and validation outputs, see
[draw_demo.py](../tests/demos/draw_demo.py) and
[wfs_demo.py](../tests/demos/wfs_demo.py). The browser rollback case is covered
in [test_simple_map_integration.py](../tests/integration/test_simple_map_integration.py).

Draw and Modify operations share an undo/redo stack owned by the map. Initialize
the map with `undo=0` and `redo=0`, then increment a command counter to execute
an operation. `canUndo` and `canRedo` are read-only outputs you can use to
disable buttons:

```python
from dash import Input, Output, State


@app.callback(
    Output("map", "undo"),
    Input("undo-button", "n_clicks"),
    State("map", "undo"),
    prevent_initial_call=True,
)
def request_undo(clicks, command):
    return command + 1


@app.callback(
    Output("map", "redo"),
    Input("redo-button", "n_clicks"),
    State("map", "redo"),
    prevent_initial_call=True,
)
def request_redo(clicks, command):
    return command + 1


@app.callback(Output("undo-button", "disabled"), Input("map", "canUndo"))
def disable_undo(can_undo):
    return not can_undo
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

Pass a JSON-serializable OpenLayers flat style to `VectorLayer.style`. Flat
styles use OpenLayers keys such as `icon-src`, `fill-color`, and `stroke-width`:

```python
dol.VectorLayer(
    id="styled-features",
    geojson=features,
    style={
        "icon-src": "https://openlayers.org/en/latest/examples/data/icon.png",
        "icon-scale": 0.7,
        "fill-color": "rgba(31, 106, 94, 0.24)",
        "stroke-color": "#1f6a5e",
        "stroke-width": 2,
    },
)
```

Use a rule array with a `resolution` expression to vary styles by map scale.
An `else` rule applies only when no earlier filter matches:

```python
dol.VectorLayer(
    id="scale-styled-features",
    geojson=features,
    style=[
        {
            "filter": ["<", ["resolution"], 2500],
            "style": {
                "icon-src": "https://openlayers.org/en/latest/examples/data/icon.png",
                "icon-scale": 0.7,
                "fill-color": "rgba(31, 106, 94, 0.24)",
                "stroke-color": "#1f6a5e",
                "stroke-width": 2,
            },
        },
        {
            "else": True,
            "style": {
                "circle-radius": 4,
                "circle-fill-color": "#d66f41",
                "circle-stroke-color": "#ffffff",
                "circle-stroke-width": 1,
                "fill-color": "rgba(214, 111, 65, 0.18)",
                "stroke-color": "#b34a36",
                "stroke-width": 1,
            },
        },
    ],
)
```

The runnable example below draws polygons and captures GeoJSON:

`DrawInteraction` validates completed features before emitting `drawnGeoJSON`.
Valid features are exported normally. Invalid features are removed from the
drawing layer, `drawnGeoJSON` is cleared, and the read-only `geometryValidation`
prop reports errors and suggestions. Self-intersection errors include their
`[longitude, latitude]` crossing coordinates; malformed rings suggest closing
the ring and providing enough positions.

Listen to the validation result with `Input("draw-tool", "geometryValidation")`
in a Dash callback. A self-intersection result has this shape:

```python
{
    "valid": False,
    "errors": [{"code": "self_intersection", "coordinates": [1, 1]}],
    "suggestions": ["Move the reported vertices so polygon boundaries do not cross."],
}
```

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
