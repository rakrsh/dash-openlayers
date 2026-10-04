# Example Gallery

Three complete Dash applications demonstrate the library from a small tile map
through GeoPandas styling to a callback-driven spatial filter. Each example has
its own README and can be run independently.

## Installation

Use Python 3.10 or newer. From a source checkout, install the library in
editable mode and then install the requirements for the example you want to
run:

```bash
python -m pip install -e .
python -m pip install -r examples/basic_tile_map/requirements.txt
python examples/basic_tile_map/app.py
```

For a published release, replace `python -m pip install -e .` with
`python -m pip install dash-openlayers`. The GeoPandas and spatial-filter
examples have separate requirements files because their GIS packages are
optional and are not needed by the library itself.

All examples request OpenStreetMap tiles, so the browser needs network access
to `tile.openstreetmap.org`. Keep the map container height set; OpenLayers
needs a nonzero-sized target to render.

## Examples

| Application | What it demonstrates | Run from repository root |
| --- | --- | --- |
| [Basic tile map](basic_tile_map/README.md) | OSM tiles, map view, and click callbacks | `python examples/basic_tile_map/app.py` |
| [GeoPandas choropleth](geopandas_choropleth/README.md) | GeoDataFrame to GeoJSON and data-driven vector styling | `python examples/geopandas_choropleth/app.py` |
| [Spatial filter dashboard](spatial_filter_dashboard/README.md) | Draw a polygon or box, filter point features with Shapely, update the map through Dash callbacks | `python examples/spatial_filter_dashboard/app.py` |

Each app starts a local development server at `http://127.0.0.1:8050`. Stop
the current app before starting another, or set a different port in that
example's `app.run()` call.

## Quick Starts

The smallest map uses the built-in OpenStreetMap source:

```python
dol.Map(
    id="map",
    center=[0, 0],
    zoom=2,
    children=[dol.TileLayer(source="OSM")],
    style={"height": "600px"},
)
```

A GeoPandas choropleth serializes its GeoDataFrame to a GeoJSON FeatureCollection
and gives that to `VectorLayer`:

```python
geojson = json.loads(regions.to_json(drop_id=True))
dol.VectorLayer(id="regions", data=geojson, style=choropleth_style)
```

For interactive filtering, `DrawControl.drawnGeoJSON` is a callback input and
the filtered FeatureCollection is written back to `VectorLayer.data`:

```python
@app.callback(
    Output("observations", "data"),
    Input("area-draw", "drawnGeoJSON"),
)
def filter_observations(area): ...
```

See each example's `app.py` for the complete layout and callbacks.

## Architecture

The examples use the same data flow:

1. Python creates the Dash component tree and supplies GeoJSON/style props.
2. The generated Python wrappers serialize the layout for the bundled React components.
3. React creates and cleans up OpenLayers maps, layers, and interactions.
4. OpenLayers renders the map and emits events such as map clicks or completed drawings.
5. React sends event data to Python with Dash `setProps`; callbacks can then update component props.

The library accepts map view coordinates in the configured projection's `[x, y]`
order. The examples use EPSG:4326, so centers and GeoJSON positions are
`[longitude, latitude]`. GeoJSON from draw tools is also returned in EPSG:4326.

## Troubleshooting

- If the map area is blank, confirm that the app is running and that the browser can reach the tile provider.
- If `dash_openlayers` cannot be imported from a source checkout, run `python -m pip install -e .` from the repository root.
- If an example cannot import GeoPandas or Shapely, install that example's `requirements.txt` in the same environment used to start the app.
- If you change a map's projection, keep the center coordinates and input data in that projection or transform them before creating the layer.
