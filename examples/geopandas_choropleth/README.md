# GeoPandas Choropleth

This app creates a small GeoDataFrame of example regions, serializes it to
GeoJSON, and styles each polygon by its `rate` property. The sample geometry is
generated in the app, so no external boundary file or download is needed.

## Install and run

From the repository root:

```bash
python -m pip install -e .
python -m pip install -r examples/geopandas_choropleth/requirements.txt
python examples/geopandas_choropleth/app.py
```

Open `http://127.0.0.1:8050`. The map uses EPSG:4326 and colors polygons with
an OpenLayers flat-style interpolation expression. Replace the sample
GeoDataFrame with your own geometries and keep its CRS explicit before
serializing it.
