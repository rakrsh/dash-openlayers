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

Add a `SelectInteraction` to a map to select vector features on click. Its
read-only `selectedFeature` prop contains the first selected GeoJSON Feature,
including its properties and geometry in EPSG:4326; it becomes `None` when
selection is cleared. `selectedGeoJSON` remains available for the full
selection, while `Map.clickData` independently reports click coordinates:

```python
dol.Map(
    id="map",
    children=[
        dol.VectorLayer(id="points", data=point_feature_collection),
        dol.SelectInteraction(id="select", layerId="points"),
    ],
)


@app.callback(Output("feature-details", "children"), Input("select", "selectedFeature"))
def show_feature(feature):
    return json.dumps(feature["properties"], indent=2) if feature else "Select a feature"
```

## Popups

Add `Popup` as a `Map` child to render Dash content at a coordinate. The
coordinate uses `[x, y]` units in the map view projection. Set `position` to
`None` to hide the popup; `autoPan=True` keeps it in view when it is positioned.
Use `className` or `style` to customize the popup content.

```python
dol.Map(
    id="popup-map",
    center=[0, 0],
    zoom=2,
    children=[
        dol.TileLayer(source="OSM"),
        dol.Popup(
            id="place-popup",
            position=[0, 0],
            positioning="bottom-center",
            offset=[0, -12],
            autoPan=True,
            className="place-popup",
            style={"backgroundColor": "white", "padding": "8px 12px"},
            children=html.Div([html.Strong("Null Island"), html.P("0, 0")]),
        ),
    ],
    style={"height": "500px"},
)
```

Add `LayerControl` as a child of `Map` to toggle visibility, adjust opacity,
and change the drawing order of declarative layer components. Layers are
identified by their component `id`; interaction-owned temporary layers are
not listed. `Up` moves a layer above the managed layers below it, and `Down`
moves it lower in the stack.

```python
dol.Map(
    id="controlled-map",
    center=[0, 0],
    zoom=2,
    children=[
        dol.TileLayer(id="basemap", source="OSM"),
        dol.VectorLayer(
            id="observations",
            geojson={"type": "FeatureCollection", "features": []},
        ),
        dol.LayerControl(id="layer-control", position="top-right", title="Map layers"),
    ],
    style={"height": "500px"},
)
```

The control's `position` can be `top-left`, `top-right`, `bottom-left`, or
`bottom-right`.

## Point Clustering and Decluttering

Set `clusterDistance` on a `VectorLayer` to cluster nearby Point features;
the distance is measured in screen pixels, and `0` (the default) disables
clustering. `clusterMinDistance` sets a minimum pixel gap between cluster
symbols and is capped at `clusterDistance`. Multi-point clusters render with
a count badge, while individual points retain the layer's configured style.
When clustering is enabled, use Point geometries in that layer.

Set `declutter=True` to prevent overlapping labels and symbols on a vector
layer. A string such as `declutter="map-labels"` groups layers that should
declutter together; layers with different group names are handled separately.
Decluttering is opt-in and does not change existing layer rendering by default.

```python
dol.VectorLayer(
    id="city-sites",
    geojson=city_site_points,
    clusterDistance=40,
    clusterMinDistance=12,
    declutter="place-labels",
    style={
        "circle-radius": 5,
        "circle-fill-color": "#d66f41",
        "text-value": ["get", "name"],
        "text-offset-y": -12,
    },
)
```

See `tests/demos/layer_control.py` for a runnable example with nearby points.

## WebGL Points for Large Datasets

Use `WebGLPointsLayer` for GeoJSON point datasets that benefit from GPU-backed
rendering. Its `style` prop uses OpenLayers' WebGL style expressions, which can
derive color, size, and symbol shape from feature properties. The layer accepts
GeoJSON as an object or JSON string; embedded CRS metadata is honored, with
EPSG:4326 used when it is absent. WebGL styles are compiled when the layer is
created, so changing `style` recreates the layer. Set `disableHitDetection=True`
when feature hit detection is not needed for a small additional performance
gain.

```python
webgl_style = {
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

dol.Map(
    id="large-points-map",
    center=[0, 0],
    zoom=5,
    children=[
        dol.WebGLPointsLayer(
            id="large-points",
            data=point_feature_collection,
            style=webgl_style,
            disableHitDetection=True,
        )
    ],
    style={"height": "500px"},
)
```

See `usage_webgl_points_layer.py` for a runnable example that creates 20,000
styled points. Use Point or MultiPoint geometries with this layer.

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

`WFSLayer` sends a browser-side WFS `GetFeature` request and reads its GeoJSON
response into an editable vector source. Set `url` and `typeNames`; use
`version`, `srsName`, `outputFormat`, and `params` for service-specific
requests. `params` can carry server-supported filters and limits. The endpoint
must allow CORS, return GeoJSON, and use coordinates compatible with `srsName`.

```python
dol.Map(
    id="wfs-map",
    center=[0, 0],
    zoom=2,
    children=[
        dol.WFSLayer(
            id="places",
            url="https://maps.example.com/geoserver/wfs",
            typeNames="workspace:places",
            params={"count": 100},
        ),
        dol.ModifyInteraction(id="modify-places", layerId="places"),
        dol.SelectInteraction(id="select-places", layerId="places"),
    ],
    style={"height": "500px"},
)
```

`featureCount` and `loadError` report the latest request outcome. `WFSLayer`
only reads features; it does not submit WFS-T transactions. The demo
`tests/demos/wfs_demo.py` shows an explicit application-owned WFS-T callback
that updates edited points. Writes are disabled unless `WFS_TRANSACTION_URL`
is configured; never point it at a shared or read-only WFS endpoint.

The demo expects the service URL in `WFS_URL`, feature type in
`WFS_FEATURE_TYPE`, and, for transactional writes, `WFS_TRANSACTION_URL`,
`WFS_FEATURE_NAMESPACE`, and `WFS_GEOMETRY_PROPERTY`. The sample transaction
updates Point geometries in CRS84; adapt its geometry encoding and feature ID
filter to the schema and WFS version supported by your server.

## Feature Selection

`SelectInteraction` reports the current selection as a GeoJSON FeatureCollection
in `selectedGeoJSON`. Use `layerId` to restrict selection to a specific layer;
omit it to allow selection from all map layers. Coordinates are transformed to
EPSG:4326 for the callback payload.

```python
dol.Map(
    id="map",
    center=[10, 45],
    zoom=5,
    children=[
        dol.TileLayer(source="OSM"),
        dol.VectorLayer(id="places", geojson=features),
        dol.SelectInteraction(id="selection", layerId="places"),
    ],
    style={"height": "500px"},
)


@app.callback(Output("selected", "children"), Input("selection", "selectedGeoJSON"))
def show_selection(selection):
    return json.dumps(selection) if selection else "Select a feature"
```

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
`tests/demos/draw_demo.py` and `tests/demos/wfs_demo.py`. The browser rollback
case is covered in `tests/integration/test_simple_map_integration.py`.

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

`VectorLayer.data` accepts a GeoJSON Feature or FeatureCollection as either a
Python dictionary or a serialized JSON string. This includes the string
returned by `GeoDataFrame.to_json()`:

```python
geojson_text = geodataframe.to_json()

dol.Map(
    id="map",
    center=[0, 0],
    zoom=8,
    children=[dol.VectorLayer(id="features", data=geojson_text)],
    style={"height": "500px"},
)
```

For GeoJSON without embedded CRS metadata, coordinates default to EPSG:4326
and are transformed into the map projection. Embedded CRS metadata, including
GeoPandas `to_json()` output for projected data, is honored. `geojson` remains
available as a backward-compatible object alias; `data` takes precedence when
both are set. A non-empty `wkt` takes precedence over both. WKT coordinates use
`[x, y]` order and default to EPSG:4326.

GeoJSON feature properties can drive flat-style rules. The same layer can
render points, lines, and polygons using rules that match a feature property:

```python
dol.VectorLayer(
    id="styled-features",
    data=geojson_text,
    style=[
        {
            "filter": ["==", ["get", "category"], "site"],
            "style": {"circle-radius": 6, "circle-fill-color": "#d66f41"},
        },
        {
            "filter": ["==", ["get", "category"], "route"],
            "style": {"stroke-color": "#1f6a5e", "stroke-width": 3},
        },
        {
            "else": True,
            "style": {
                "fill-color": "rgba(31, 106, 94, 0.24)",
                "stroke-color": "#1f6a5e",
                "stroke-width": 2,
            },
        },
    ],
)
```

Draw and modify interactions keep their GeoJSON outputs and also publish WKT
and TopoJSON:

```python
dol.VectorLayer(id="wkt-feature", wkt="POINT (0 0)")

dol.DrawInteraction(
    id="draw",
    geometryType="Point",
)


@app.callback(
    Output("formats", "children"),
    Input("draw", "drawnWKT"),
    Input("draw", "drawnTopoJSON"),
)
def show_formats(wkt, topojson):
    return json.dumps({"wkt": wkt, "topojson": topojson}) if wkt else ""
```

For a modified feature, the corresponding properties are `modifiedGeoJSON`,
`modifiedWKT`, and `modifiedTopoJSON`. GeoJSON properties contain a Feature
or FeatureCollection; TopoJSON properties contain a Topology object. TopoJSON
output is quantized at 100,000 and can therefore slightly adjust coordinates.

The JavaScript package also exports `readFeatures(data, options)`,
`exportFeature(feature, options)`, and `exportFeatures(features, options)`.
`readFeatures` accepts `format: "GeoJSON"` (the default) or `format: "WKT"`;
the export helpers return an object with `geojson`, `wkt`, and `topojson`
fields. Pass OpenLayers `dataProjection` and `featureProjection` options when
reading or writing coordinates in projections other than EPSG:4326.

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
