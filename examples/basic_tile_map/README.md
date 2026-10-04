# Basic Tile Map

This app displays OpenStreetMap tiles and reports the coordinates of the last
map click through a Dash callback.

## Install and run

From the repository root:

```bash
python -m pip install -e .
python -m pip install -r examples/basic_tile_map/requirements.txt
python examples/basic_tile_map/app.py
```

Open `http://127.0.0.1:8050`. Click the map to see its projected coordinate
and latitude/longitude in the output below it. The view uses EPSG:4326, so the
center is provided as `[longitude, latitude]`.
