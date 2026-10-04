# dash-openlayers

OpenLayers mapping components for Plotly Dash. Build maps declaratively in
Python, use OpenLayers for rendering and editing, and receive map events and
feature data in Dash callbacks.

## Install

```bash
pip install dash-openlayers
```

Requires Python 3.10 or newer. Dash is installed as a package dependency.

## Quick Example

```python
import dash
from dash import Input, Output, html
import dash_openlayers as dol

app = dash.Dash(__name__)
app.layout = html.Div(
    [
        dol.Map(
            id="map",
            center=[10, 45],
            zoom=5,
            children=[
                dol.TileLayer(id="osm", source="OSM"),
                dol.VectorLayer(
                    id="places",
                    geojson={
                        "type": "FeatureCollection",
                        "features": [
                            {
                                "type": "Feature",
                                "geometry": {"type": "Point", "coordinates": [10, 45]},
                                "properties": {"name": "Sample place"},
                            }
                        ],
                    },
                ),
                dol.SelectInteraction(id="selection", layerId="places"),
                dol.LayerControl(id="layers"),
            ],
            style={"height": "600px"},
        ),
        html.Pre(id="selection-output"),
    ]
)


@app.callback(Output("selection-output", "children"), Input("selection", "selectedGeoJSON"))
def show_selection(selection):
    return str(selection or "Select a feature")


if __name__ == "__main__":
    app.run(debug=True)
```

## Components

- Maps, synchronized view state, custom Proj4 projections, and click events.
- OSM/XYZ, GeoJSON vector, WMS, WMTS, MVT vector-tile, and WFS GeoJSON layers.
- Draw, select, modify, snapping, per-feature topology validation, and undo/redo.
- GeoJSON/WKT input and GeoJSON/WKT/TopoJSON edit output.
- Point clustering, decluttering, and layer visibility/opacity/order controls.

WFS-T writes are not performed by `WFSLayer`; see the guarded example in
[`tests/demos/wfs_demo.py`](tests/demos/wfs_demo.py) for an application-owned
transaction callback.

## Documentation

- [Example gallery](examples/README.md)
- [Quickstart](docs/quickstart.md)
- [Usage guide](docs/usage.md)
- [API reference](docs/api.md)
- [Architecture](docs/architecture.md)
- [Testing](docs/testing.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and workflow.
