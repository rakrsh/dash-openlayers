# Example Gallery

These complete Dash applications progress from a basic tile map to
GeoPandas-based styling and callback-driven spatial analysis. The full source,
per-example requirements, and run instructions are available in the
[repository's `examples/` directory](https://github.com/rakrsh/dash-openlayers/tree/main/examples).

## Setup

Use Python 3.10 or newer. From a source checkout, install the library and the
requirements for the selected example:

```bash
python -m pip install -e .
python -m pip install -r examples/basic_tile_map/requirements.txt
python examples/basic_tile_map/app.py
```

For a published package, replace the editable install with
`python -m pip install dash-openlayers`. The choropleth and spatial-filter apps
install GeoPandas or Shapely only for their own use cases; neither is a
dependency of `dash-openlayers`. All maps use OpenStreetMap tiles, so the
browser needs network access to the tile provider.

## Applications

### Basic Tile Map

Uses the built-in OSM source and reports the most recent map click in a Dash
callback. Its view is EPSG:4326 and its center is provided in
`[longitude, latitude]` order.

- [App source](https://github.com/rakrsh/dash-openlayers/blob/main/examples/basic_tile_map/app.py)
- [Setup and usage](https://github.com/rakrsh/dash-openlayers/blob/main/examples/basic_tile_map/README.md)

### GeoPandas Choropleth

Builds a GeoDataFrame of sample polygons, serializes it to a GeoJSON
FeatureCollection, and uses feature properties in an OpenLayers style
expression. Its sample data is generated in Python, so no external boundary
file or data download is required.

- [App source](https://github.com/rakrsh/dash-openlayers/blob/main/examples/geopandas_choropleth/app.py)
- [Setup and usage](https://github.com/rakrsh/dash-openlayers/blob/main/examples/geopandas_choropleth/README.md)

### Spatial Filter Dashboard

Offers Polygon and Rectangle drawing tools. A completed geometry arrives in a
Dash callback, Shapely filters a point FeatureCollection, and the callback
updates the vector layer and match count.

- [App source](https://github.com/rakrsh/dash-openlayers/blob/main/examples/spatial_filter_dashboard/app.py)
- [Sample data](https://github.com/rakrsh/dash-openlayers/blob/main/examples/spatial_filter_dashboard/data.py)
- [Setup and usage](https://github.com/rakrsh/dash-openlayers/blob/main/examples/spatial_filter_dashboard/README.md)

## Data Flow

1. Python declares the map, layers, styles, and drawing tools.
2. The generated Dash wrappers serialize component props to the React frontend.
3. React creates and cleans up OpenLayers maps, layers, and interactions.
4. OpenLayers renders the map and emits events such as clicks or completed drawings.
5. React sends event values to Dash with `setProps`; Python callbacks can update layer props.

OpenLayers coordinates use `[x, y]` order. For EPSG:4326, GeoJSON coordinates
are `[longitude, latitude]`; the drawing and selection examples also exchange
GeoJSON in EPSG:4326.
