# Quickstart

Install the published package into the environment used to run your Dash app:

```bash
python -m pip install dash-openlayers
```

Create `app.py`:

```python
import dash
from dash import Input, Output, html
import dash_openlayers as dol

app = dash.Dash(__name__)
app.layout = html.Div(
    [
        dol.Map(
            id="map",
            center=[-0.1, 51.5],
            zoom=8,
            children=[
                dol.TileLayer(id="basemap", source="OSM"),
                dol.DrawInteraction(id="draw", geometryType="Polygon"),
            ],
            style={"height": "600px"},
        ),
        html.Pre(id="drawn-feature"),
    ]
)


@app.callback(Output("drawn-feature", "children"), Input("draw", "drawnGeoJSON"))
def show_drawn_feature(feature):
    return str(feature or "Draw a polygon on the map")


if __name__ == "__main__":
    app.run(debug=True)
```

Run it with `python app.py`. The browser needs network access to the tile
provider; third-party WMS/WMTS/WFS endpoints must permit CORS from the app's
origin.

## Development Build

For a source checkout, install the JavaScript and Python dependencies, then
build the bundles, Python wrappers, and API reference:

```bash
npm install
uv sync
npm run build
uv run pytest -q
```

The component metadata in `dash_openlayers/metadata.json` is the input for
Python wrapper generation. The full build also regenerates `docs/api.md` from
that metadata. Run `uv run python scripts/generate_components.py` or
`npm run docs:api` separately when only one generated surface needs updating.

Runnable component demos are under `tests/demos/`; complete end-to-end apps are
in the [deployed example gallery](examples.md), with their full source in the
[repository examples directory](https://github.com/rakrsh/dash-openlayers/tree/main/examples).
The MkDocs site can be previewed locally with `uv run mkdocs serve`.
