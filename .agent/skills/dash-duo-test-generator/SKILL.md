---
name: dash-duo-test-generator
description: Generate Python Selenium end-to-end tests for dash-openlayers components using dash[testing]'s dash_duo fixture — drive map interactions and assert setProps updates, including vertex/edge snapping, Modify topology rollback, geometryValidation, and undo history. Use when asked to add browser tests for interactive map behavior.
---

# Skill: dash-duo-test-generator

Generates `dash_duo`-based integration tests that exercise the real browser
canvas, since map clicks/draws cannot be verified by Python unit tests alone.

## Prerequisites to confirm before generating

- `dash[testing]` and a WebDriver (Selenium `chromedriver`, headless Chrome)
  are available in the test environment — add them to the `test` dependency
  group in `pyproject.toml` if missing, and note this in the PR description
  rather than assuming they're already installed.
- The component under test already calls `setProps` with a stable prop name
  (check its `propTypes`/JSDoc) — the test asserts on that exact prop.

## Test file shape

`tests/test_<component_name>_e2e.py`:

```python
import json

import dash
from dash import Input, Output, html

import dash_openlayers as dol


def make_app():
    app = dash.Dash(__name__)
    app.layout = html.Div(
        [
            dol.Map(
                id="map",
                center=[0, 0],
                zoom=2,
                children=[dol.DrawInteraction(id="draw-tool", geometryType="Point")],
                style={"height": "400px", "width": "400px"},
            ),
            html.Pre(id="output"),
        ]
    )

    @app.callback(Output("output", "children"), Input("draw-tool", "drawnGeoJSON"))
    def _echo(geojson):
        return json.dumps(geojson) if geojson else ""

    return app


def test_draw_interaction_emits_geojson(dash_duo):
    app = make_app()
    dash_duo.start_server(app)

    # Map must finish mounting (ol/Map target attached) before interacting.
    dash_duo.wait_for_element("#map canvas")

    canvas = dash_duo.find_element("#map canvas")
    # A single click is enough to commit a Point draw; LineString/Polygon
    # need a click sequence plus a double-click/Enter to finish — see
    # ActionChains notes below.
    canvas.click()

    dash_duo.wait_for_text_to_equal("#output", "", timeout=1)  # placeholder guard
    dash_duo.wait_for_contains_text("#output", '"type": "Feature"', timeout=5)

    assert dash_duo.get_logs() == []
```

## Interaction recipes by geometry type

Use `selenium.webdriver.common.action_chains.ActionChains` for multi-step
geometries — a single `.click()` only completes a `Point` draw:

- **Point**: one `.click()` on the canvas.
- **LineString**: two or more `.click()`s at different offsets, then
  `.double_click()` (or click + `Escape`... actually OpenLayers finishes a
  line on double-click) on the final vertex.
- **Polygon**: three or more `.click()`s, then `.double_click()` to close the
  ring.
- Use `ActionChains(dash_duo.driver).move_to_element_with_offset(canvas, x, y).click().perform()`
  to target specific canvas pixel coordinates deterministically instead of
  relying on the element's center for every click.

## Snapping and topology edits

- Put a `VectorLayer` with known features before the interaction in the map's
  children. Snap candidates come from mounted vector sources on that map.
- Verify `snapToVertex`, `snapToEdge`, and `snapTolerance` prop serialization
  in unit tests. In a browser test, use separate nearby vertices/edges and
  assert the emitted coordinates land on the expected target.
- For a deterministic invalid-edit regression, disable snapping, start with a
  valid square Polygon, and drag one corner across a non-adjacent edge. Assert
  `geometryValidation.valid` is false, the emitted FeatureCollection contains
  the restored coordinates, and `canUndo` remains false.
- Add a valid edit case as well: it should set `geometryValidation.valid` to
  true and create one undoable operation. Keep topology checks in browser tests
  because unit mocks cannot prove the real Modify pointer sequence.

## Assertions to include

1. **Canvas rendered**: `dash_duo.wait_for_element("#<map-id> canvas")` before
   any interaction — OpenLayers renders into a `<canvas>` appended
   asynchronously after `ol/Map` construction.
2. **No console errors**: `assert dash_duo.get_logs() == []` (catches
   OpenLayers runtime warnings from bad projections/missing sources).
3. **Prop round-trip**: assert the Python-side `Output` element reflects the
   `setProps`-driven value (`wait_for_contains_text`/`wait_for_text_to_equal`),
   not just that the click happened — this is what proves the
   OpenLayers → `setProps` → Dash callback bridge works end-to-end.
4. For click-based props like `clickData`, assert the returned coordinate is
   `[x, y]` and (if `latLon` is present) that `latLon` is `[lat, lon]` only
   in that explicitly-named field — never assume order from position alone.

## Output

Generate the test file plus, if missing, add `dash_duo` fixture wiring notes
(`conftest.py` requirements are provided by `dash[testing]`'s pytest plugin —
no custom fixture needed beyond installing the dependency). Do not modify
`pyproject.toml` test dependencies without flagging the change to the user.
