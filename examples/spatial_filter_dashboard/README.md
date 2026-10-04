# Spatial Filter Dashboard

Draw a polygon or rectangle on the map to select observation points. A Dash
callback uses Shapely to filter the GeoJSON FeatureCollection, updates the
vector layer, and reports the number of matches.

## Install and run

From the repository root:

```bash
python -m pip install -e .
python -m pip install -r examples/spatial_filter_dashboard/requirements.txt
python examples/spatial_filter_dashboard/app.py
```

Open `http://127.0.0.1:8050`, select `Polygon` or `Rectangle` in the Draw
control, then draw on the map. Drawn geometries and observation coordinates
use EPSG:4326 `[longitude, latitude]` order.

The observations are kept in `data.py` to separate sample data from the Dash
layout and callback. Replace that FeatureCollection with GeoJSON from your own
data pipeline to adapt the example.
