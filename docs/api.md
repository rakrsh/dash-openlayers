# API Reference

This reference is generated from the component metadata used to build the Python wrappers.
For runnable examples, see the [usage guide](usage.md).

## `DrawControl`

Add map controls for drawing, selecting, editing, and deleting spatial features.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | — | Component ID used to identify this drawing control and its callback outputs. |
| `geometryTypes` | `list['Point' \| 'LineString' \| 'Polygon' \| 'Circle' \| 'Box']` | `['Point', 'LineString', 'Polygon', 'Circle', 'Box']` | Drawing modes displayed in the control: Point, LineString, Polygon, Circle, and Box (rectangle). |
| `activeDrawMode` | `null \| 'Point' \| 'LineString' \| 'Polygon' \| 'Circle' \| 'Box'` | — | Active drawing mode; set to null to stop drawing. Bidirectional when changed by toolbar clicks. |
| `editMode` | `bool` | — | Whether selection and vertex editing are enabled; toolbar changes are bidirectional. |
| `deleteSelected` | `number` | `0` | Increment to delete the currently selected feature or features. |
| `position` | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'top-left'` | Corner of the map where the drawing tools are displayed. |
| `title` | `string` | `'Draw'` | Accessible toolbar label and visible heading. |
| `style` | `dict` | — | Inline styles applied to the toolbar control container. |
| `buttonStyle` | `dict` | — | Inline styles applied to each drawing mode button. |
| `drawnGeoJSON` | `dict` | — | Read-only: GeoJSON Feature emitted only when geometry validation succeeds. |
| `drawnFeatures` | `dict` | — | Read-only: GeoJSON FeatureCollection of all drawn features, updated after drawing, editing, undo, or removal. |
| `editedFeature` | `dict` | — | Read-only: selected or last modified GeoJSON Feature, or null after deselection or deletion. |
| `drawnWKT` | `string` | — | Read-only: WKT geometry emitted only when geometry validation succeeds. |
| `drawnTopoJSON` | `dict` | — | Read-only: TopoJSON topology emitted only when geometry validation succeeds. |
| `geometryValidation` | `dict` | — | Read-only: validity, topology errors, and repair suggestions from the last draw. |
| `snapToVertex` | `bool` | `true` | Whether drawing snaps to existing vector vertices. |
| `snapToEdge` | `bool` | `true` | Whether drawing snaps to existing vector edges. |
| `snapTolerance` | `number` | `10` | Maximum snap distance in screen pixels. |

## `DrawInteraction`

Draw, validate, select, and edit spatial features.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | — | The ID used to identify this component in Dash callbacks. |
| `geometryType` | `'Point' \| 'LineString' \| 'Polygon' \| 'Circle' \| 'Box'` | `'Polygon'` | Geometry to draw: Point, LineString, Polygon, Circle, or Box (an axis-aligned rectangle). |
| `editMode` | `bool` | `false` | Whether to select and modify features created by this interaction. |
| `deleteSelected` | `number` | `0` | Increment to delete the currently selected feature or features. |
| `drawnGeoJSON` | `dict` | — | Read-only: GeoJSON Feature emitted only when geometry validation succeeds. |
| `drawnFeatures` | `dict` | — | Read-only: GeoJSON FeatureCollection containing every currently drawn feature. |
| `editedFeature` | `dict` | — | Read-only: selected or last modified GeoJSON Feature, or null after deselection or deletion. |
| `drawnWKT` | `string` | — | Read-only: WKT geometry emitted only when geometry validation succeeds. |
| `drawnTopoJSON` | `dict` | — | Read-only: TopoJSON topology emitted only when geometry validation succeeds. |
| `geometryValidation` | `dict` | — | Read-only: validity, topology errors, and repair suggestions from the last draw. |
| `snapToVertex` | `bool` | `true` | Whether drawing snaps to existing vector vertices. |
| `snapToEdge` | `bool` | `true` | Whether drawing snaps to existing vector edges. |
| `snapTolerance` | `number` | `10` | Maximum snap distance in screen pixels. |

## `ImageWMS`

Render a single-image OGC Web Map Service layer.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | — | Component ID used to identify this layer in the Dash layout. |
| `url` | `string` | `null` | OGC WMS endpoint URL. |
| `params` | `dict` | `{}` | WMS request parameters, including LAYERS; changes refresh the source. |
| `serverType` | `'carmentaserver' \| 'geoserver' \| 'mapserver' \| 'qgis'` | `null` | WMS server type used for vendor-specific HiDPI request parameters. |

## `LayerControl`

Layer visibility, opacity, and stacking-order controls for map layers.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | — | The ID used to identify this component in Dash callbacks. |
| `position` | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'top-right'` | Corner of the map where the control is displayed. |
| `title` | `string` | `'Layers'` | Heading displayed above the layer controls. |

## `Map`

Create an OpenLayers map and synchronize its view and click events with Dash.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | — | The ID used to identify this component in Dash callbacks. |
| `children` | `Dash component` | — | OpenLayers layer and interaction components rendered inside this map. |
| `center` | `list[number]` | `[0, 0]` | Map view center as [x, y] in projection's units (e.g. [lon, lat] for EPSG:4326, [x, y] in meters for EPSG:3857/projected CRSs). Bidirectional: updates on moveend and can be set from Python. |
| `zoom` | `number` | `2` | Map zoom level. Bidirectional: updates on moveend and can be set from Python. |
| `projection` | `string` | `'EPSG:3857'` | EPSG code the view is rendered in, e.g. 'EPSG:3857' or a custom code registered via `proj4Defs`. |
| `proj4Defs` | `list[dict]` | `[]` | Custom proj4 projection definitions to register before the view is constructed, e.g. [{ code: 'EPSG:27700', def: '+proj=tmerc ...' }]. |
| `style` | `dict` | — | Inline CSS style object applied to the map container div. |
| `clickData` | `dict` | — | Read-only: set on `singleclick` with `{ coordinate: [x, y], latLon: [lat, lon] }`. |
| `undo` | `number` | `0` | Increment to undo the latest draw or modify operation on this map. |
| `redo` | `number` | `0` | Increment to redo the latest undone draw or modify operation on this map. |
| `canUndo` | `bool` | — | Read-only: whether this map's edit history has an operation to undo. |
| `canRedo` | `bool` | — | Read-only: whether this map's edit history has an operation to redo. |

## `MeasureControl`

Draw lines and polygons with live geodesic length and area measurements.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | — | Component ID used to identify this measurement control in Dash. |
| `units` | `'metric' \| 'imperial'` | `'metric'` | Measurement units: metric uses meters, kilometers, and hectares; imperial uses feet, miles, and acres. |
| `clearMeasurements` | `number` | `0` | Increment to clear all completed and in-progress measurements. |
| `position` | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'top-left'` | Corner of the map where the measurement toolbar is displayed. |
| `title` | `string` | `'Measure'` | Accessible toolbar label and visible heading. |
| `style` | `dict` | — | Inline styles applied to the toolbar control container. |

## `ModifyInteraction`

Allow editing vertices in a VectorLayer and report the updated features.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | — | The ID used to identify this component in Dash callbacks. |
| `layerId` | `string` | `null` | Dash ID of the VectorLayer to modify; defaults to the first vector layer on the map. |
| `snapToVertex` | `bool` | `true` | Whether editing snaps to vector vertices. |
| `snapToEdge` | `bool` | `true` | Whether editing snaps to vector edges. |
| `snapTolerance` | `number` | `10` | Maximum snap distance in screen pixels. |
| `preserveTopology` | `bool` | `true` | Revert polygon edits that introduce invalid topology. |
| `modifiedGeoJSON` | `dict` | — | Read-only: GeoJSON FeatureCollection of the target layer after a modify operation. |
| `modifiedWKT` | `string` | — | Read-only: WKT geometry collection of the target layer after modification. |
| `modifiedTopoJSON` | `dict` | — | Read-only: TopoJSON topology of the target layer after modification. |
| `geometryValidation` | `dict` | — | Read-only: topology validation result from the last modification. |

## `Popup`

Render Dash content in an OpenLayers overlay anchored to a map coordinate.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | — | The ID used to identify this component in Dash callbacks. |
| `children` | `Dash component` | — | Dash children rendered inside the overlay element. |
| `position` | `list[number]` | `null` | Overlay position as [x, y] in the map view projection; null hides the popup. |
| `positioning` | `'bottom-left' \| 'bottom-center' \| 'bottom-right' \| 'center-left' \| 'center-center' \| 'center-right' \| 'top-left' \| 'top-center' \| 'top-right'` | `'bottom-center'` | Overlay alignment relative to its position coordinate. |
| `offset` | `list[number]` | `[0, 0]` | Pixel offset [x, y] applied to the overlay. |
| `autoPan` | `bool` | `false` | Pan the map when positioning the overlay would place it outside the viewport. |
| `className` | `string` | `null` | CSS class applied to the popup content element. |
| `style` | `dict` | `null` | Inline CSS style applied to the popup content element. |

## `SelectInteraction`

Select vector features and report the current selection to Dash.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | — | The ID used to identify this component in Dash callbacks. |
| `layerId` | `string` | `null` | Dash ID of the vector layer to select from; omit to allow all selectable layers. |
| `selectedGeoJSON` | `dict` | — | Read-only: current selection as a GeoJSON FeatureCollection in EPSG:4326. |
| `selectedFeature` | `dict` | — | Read-only: first selected GeoJSON Feature in EPSG:4326, or null when nothing is selected. |

## `TileLayer`

Render OpenStreetMap or custom XYZ tiles on the map.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | — | The ID used to identify this layer in Dash callbacks. |
| `source` | `string` | `null` | Built-in tile source identifier. Currently supports "OSM". |
| `url` | `string` | `null` | URL template for a custom XYZ tile source, e.g. 'https://tiles.example.com/{z}/{x}/{y}.png'. |

## `TileWMS`

Render a tiled OGC Web Map Service layer.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | — | Component ID used to identify this layer in the Dash layout. |
| `url` | `string` | `null` | OGC WMS endpoint URL. |
| `params` | `dict` | `{}` | WMS request parameters, including LAYERS; changes refresh the source. |
| `serverType` | `'carmentaserver' \| 'geoserver' \| 'mapserver' \| 'qgis'` | `null` | WMS server type used for vendor-specific HiDPI request parameters. |

## `VectorLayer`

Load and interact with GeoJSON, TopoJSON, KML, or WKT vector data in an OpenLayers vector layer.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | — | Dash component ID; also used by ModifyInteraction to target this vector layer. |
| `data` | `string \| dict` | `null` | GeoJSON Feature or FeatureCollection as an object or JSON string; embedded CRS metadata is honored, otherwise coordinates default to EPSG:4326. Takes precedence over geojson. |
| `geojson` | `dict` | `null` | Backward-compatible GeoJSON Feature or FeatureCollection object alias for `data`. |
| `wkt` | `string` | `null` | WKT geometry string in [x, y] order; takes precedence over `data` and `geojson` when non-empty. |
| `url` | `string` | `null` | Remote URL for vector data; used when data, geojson, and wkt are not provided. |
| `format` | `'GeoJSON' \| 'TopoJSON' \| 'KML' \| 'WKT'` | `'GeoJSON'` | Data format for data or url: GeoJSON, TopoJSON, KML, or WKT. |
| `dataProjection` | `string` | `null` | Projection of input coordinates; defaults to EPSG:4326 unless GeoJSON embeds a CRS. |
| `style` | `dict \| list[dict]` | `null` | OpenLayers flat style or declarative style dictionary with fillColor, strokeColor, strokeWidth, radius, opacity, marker, and ordered rules. Each rule uses property, operator (==, !=, >, >=, <, <=, in, or notIn), value, and style. A marker may be a URL, an SVG string, or circle. |
| `hoverStyle` | `dict` | `null` | Declarative feature style applied while the pointer is over a feature; supports fillColor, strokeColor, strokeWidth, radius, opacity, marker, and property rules. |
| `selectedStyle` | `dict` | `null` | Declarative feature style applied to the most recently clicked feature; supports fillColor, strokeColor, strokeWidth, radius, opacity, marker, and property rules. |
| `clusterDistance` | `number` | `0` | Point clustering distance in screen pixels; set to 0 to disable clustering. |
| `clusterMinDistance` | `number` | `0` | Minimum distance in screen pixels between clusters; capped at clusterDistance. |
| `declutter` | `bool \| string` | `false` | Enable label decluttering, or provide a shared group name to declutter with other layers. |
| `hoveredFeature` | `dict` | — | Read-only: GeoJSON Feature under the pointer, with coordinates in EPSG:4326. |
| `clickedFeature` | `dict` | — | Read-only: GeoJSON Feature clicked on this layer, with coordinates in EPSG:4326. |
| `featureCount` | `number` | — | Read-only: number of features in the loaded source. |
| `loadError` | `string` | — | Read-only: message from the last failed data load, or null after success. |

## `VectorTileLayer`

Render MVT/PBF vector tiles with OpenLayers flat styles or Mapbox GL style documents and report clicked or hovered feature attributes.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | — | Component ID used to identify this layer in the Dash layout. |
| `url` | `string` | `null` | MVT URL template containing {z}, {x}, and {y} or {-y}; ignored when urls is provided. |
| `urls` | `list[string]` | `null` | Alternative MVT URL templates for load balancing; takes precedence over url. |
| `projection` | `string` | `'EPSG:3857'` | Projection of the vector tile grid; use the CRS served by the tile endpoint. |
| `attributions` | `string \| list[string]` | `null` | Attribution text or a list of attribution strings for the tile provider. |
| `style` | `dict` | `null` | OpenLayers flat-style object used to style MVT features; ignored when mapboxStyle is provided. |
| `mapboxStyle` | `dict` | `null` | Mapbox GL Style document used to style this layer's vector source. |
| `mapboxSource` | `string` | `null` | Vector source key within mapboxStyle; inferred when that document contains one vector source. |
| `clickedFeature` | `dict` | — | Read-only: attributes of the vector-tile feature clicked on this layer, or null. |
| `hoveredFeature` | `dict` | — | Read-only: attributes of the vector-tile feature currently under the pointer, or null. |

## `WFSLayer`

Load WFS GeoJSON features into an editable vector layer.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | — | The ID used to identify this component and layer in Dash callbacks. |
| `url` | `string` | `null` | WFS endpoint URL; the service must allow browser CORS access. |
| `typeNames` | `string` | `null` | WFS feature type name (sent as typeNames for 2.x, typeName for 1.x). |
| `version` | `string` | `'2.0.0'` | WFS protocol version. |
| `srsName` | `string` | `'EPSG:4326'` | Coordinate reference system requested from the service and used to parse response coordinates. |
| `outputFormat` | `string` | `'application/json'` | WFS response format; the component currently parses GeoJSON responses. |
| `params` | `dict` | `{}` | Additional GetFeature query parameters, such as count, bbox, or CQL_FILTER. |
| `featureCount` | `number` | — | Read-only: number of features loaded by the last successful request. |
| `loadError` | `string` | — | Read-only: message from the last failed request, or null after success. |

## `WMTSLayer`

Render a WMTS layer using its service capabilities to configure the tile grid.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | — | Component ID used to identify this layer in the Dash layout. |
| `url` | `string` | `null` | URL of the WMTS GetCapabilities document; the server must allow browser CORS access. |
| `layer` | `string` | `null` | Layer identifier advertised by the WMTS capabilities. |
| `matrixSet` | `string` | `null` | Tile matrix set identifier; inferred when the capabilities advertise a single set. |
| `projection` | `string` | `null` | Projection code to select a compatible matrix set, such as EPSG:3857. |
| `style` | `string` | `null` | Advertised WMTS style identifier. |
| `format` | `string` | `null` | Tile image format; defaults to the first advertised format. |
| `requestEncoding` | `'KVP' \| 'REST'` | `null` | WMTS request encoding, either KVP or REST. |
| `dimensions` | `dict` | `null` | Values for advertised WMTS dimensions, such as TIME or ELEVATION. |
| `attributions` | `string \| list[string]` | `null` | Attribution text or a list of attribution strings for the tile provider. |

## `WebGLPointsLayer`

Render large GeoJSON point datasets with the OpenLayers WebGL renderer.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | — | Component ID used to identify this layer in the Dash layout. |
| `data` | `string \| dict` | `null` | GeoJSON Point or MultiPoint FeatureCollection as an object or JSON string; embedded CRS metadata is honored, otherwise coordinates default to EPSG:4326. |
| `style` | `dict` | `null` | OpenLayers WebGL style object; expressions such as get, match, and interpolate style feature properties. Changing the style recreates the layer; the default style is blue circles. |
| `disableHitDetection` | `bool` | `false` | Disable WebGL feature hit detection for a small rendering performance gain. |
