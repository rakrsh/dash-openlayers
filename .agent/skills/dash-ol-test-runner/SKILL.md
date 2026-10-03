---
name: dash-ol-test-runner
description: >
  Write and execute tests for dash-openlayers across all three layers: import/unit
  tests (tests/unit/), browser integration tests (tests/integration/ via dash_duo),
  and runnable demo apps (tests/demos/). Covers exact pytest commands, coverage
    collection, CI alignment, and debugging failed browser tests, including native
    snapping and topology-preserving Modify behavior. Use whenever asked to add,
    run, or fix tests or demos for a component or feature.
---

# Skill: dash-ol-test-runner

Covers the full testing lifecycle in this repo: where tests live, how to write
each kind, which commands to run, and how to debug failures.

---

## 1. Test directory layout

```
tests/
├── conftest.py              # installs chromedriver; registers "integration" marker
├── test_import.py           # top-level smoke: package importable + core attrs
├── unit/
│   └── test_components.py   # fast, no browser: importlib assertions per component
├── integration/
│   └── test_<name>_integration.py   # dash_duo browser tests
└── demos/
    └── <name>.py            # runnable Dash apps (python tests/demos/<name>.py)
```

**Rule:** never put `dash_duo` tests inside `tests/unit/` — they require a
running browser and will fail in environments without one (e.g. headless CI
without xvfb).

---

## 2. Unit / import tests (`tests/unit/`)

These are pure Python — no browser, no Dash server. They verify the Python
package surface and any synchronous logic.

### Template

```python
# tests/unit/test_<component_snake>.py
import importlib


def test_<component_snake>_importable():
    mod = importlib.import_module("dash_openlayers")
    assert hasattr(mod, "<ComponentName>")


def test_<component_snake>_default_props():
    import dash_openlayers as dol

    comp = dol.<ComponentName>(id="test")
    # Assert known default prop values set in the Python wrapper class
    assert comp.id == "test"
    # Add more prop assertions as the component's defaultProps grow
```

### Running

```bash
uv run pytest -q tests/unit
uv run pytest -q tests/unit --cov=dash_openlayers --cov-report=term
```

---

## 3. Browser integration tests (`tests/integration/`)

Use `dash_duo` (from `dash[testing]`) to drive a real headless Chrome browser.
These tests verify that the JavaScript <-> Python `setProps` bridge actually
works end-to-end — something unit tests cannot cover.

### Prerequisites

- `dash[testing]`, `chromedriver-autoinstaller` are in the `test` dependency
  group (`pyproject.toml`) — already present. Sync with `uv sync`.
- `conftest.py` calls `chromedriver_autoinstaller.install()` at import time,
  so no manual chromedriver management is needed locally.
- On Linux CI the runner must wrap the command with `xvfb-run` (already done
  in `.github/workflows/test-suite.yml`).

### Template

```python
# tests/integration/test_<component_snake>_integration.py
import time

import dash
import dash_openlayers as dol


def test_<component_snake>_renders(dash_duo):
    app = dash.Dash(__name__)
    app.layout = dash.html.Div(
        [
            dol.Map(
                id="map",
                center=[0, 0],   # [lon, lat] — OpenLayers [x, y] order
                zoom=2,
                children=[
                    dol.TileLayer(source="OSM"),
                    dol.<ComponentName>(id="<component-id>", <props>),
                ],
                style={"height": "300px"},
            ),
            dash.html.Pre(id="output"),
        ]
    )

    dash_duo.start_server(app)

    # 1. Wait for the OL viewport div — created asynchronously after ol/Map mounts.
    #    Use "div.ol-viewport" not "#map canvas" — the viewport div appears first.
    try:
        el = dash_duo.wait_for_element("div.ol-viewport", timeout=15)
    except Exception:
        # Dump debug info before re-raising so CI logs show the root cause.
        print(dash_duo.driver.page_source[:10000])
        try:
            print(dash_duo.driver.get_log("browser"))
        except Exception:
            pass
        raise

    assert el is not None
    time.sleep(1)  # allow OL render pipeline to settle

    # 2. Interact (click, draw, etc.) — see §4 for interaction recipes.

    # 3. Assert setProps round-trip (only if the component emits data).
    # dash_duo.wait_for_contains_text("#output", '"type": "Feature"', timeout=5)

    # 4. Always assert no browser console errors last.
    assert dash_duo.get_logs() == []
```

### Running

```bash
# All integration tests (local — Chrome must be installed)
uv run pytest -q tests/integration

# Single file
uv run pytest -q tests/integration/test_simple_map_integration.py

# Linux headless (same as CI)
xvfb-run -s "-screen 0 1280x1024x24" uv run pytest -q tests/integration
```

---

## 4. Interaction recipes for canvas-based tests

Map interactions happen on the `<canvas>` inside `div.ol-viewport`. Use
`selenium.webdriver.common.action_chains.ActionChains` for targeted clicks.

```python
from selenium.webdriver.common.action_chains import ActionChains

canvas = dash_duo.find_element("#map canvas")

# Point — single click at canvas centre
canvas.click()

# Point at specific pixel offset
ActionChains(dash_duo.driver).move_to_element_with_offset(canvas, 100, 150).click().perform()

# LineString — two clicks then double-click to finish
ActionChains(dash_duo.driver).move_to_element_with_offset(
    canvas, 80, 80
).click().move_to_element_with_offset(canvas, 160, 160).click().move_to_element_with_offset(
    canvas, 160, 160
).double_click().perform()

# Polygon — three clicks then double-click to close the ring
ActionChains(dash_duo.driver).move_to_element_with_offset(
    canvas, 80, 80
).click().move_to_element_with_offset(canvas, 160, 80).click().move_to_element_with_offset(
    canvas, 120, 160
).click().move_to_element_with_offset(canvas, 120, 160).double_click().perform()
```

### Snapping and topology-preserving Modify

- Assert `snapToVertex`, `snapToEdge`, and `snapTolerance` serialization in
    `tests/unit/test_components.py`; cover Snap interaction options and source
    cleanup in Jest.
- Add a `dash_duo` regression using a valid square Polygon. Disable snapping for
    the geometry-invalidity gesture, drag a corner across a non-adjacent edge,
    then assert rollback, `geometryValidation.valid == false`, and no new undo
    entry. For the accepted path, verify the geometry changes and history gains
    one undo entry.
- Keep Draw and Modify browser tests separate from unit tests. The browser
    needs the actual VectorLayer source mounted before the interaction so the
    Snap collection has real features.

---

## 5. Demo apps (`tests/demos/`)

Demo apps are **not** pytest files — they are runnable Dash apps for manual
visual verification and are not executed by CI.

```python
# tests/demos/<component_snake>.py
import dash
from dash import html
import dash_openlayers as dol

app = dash.Dash(__name__)
app.layout = html.Div(
    [
        dol.Map(
            id="map",
            center=[0, 0],
            zoom=2,
            children=[
                dol.TileLayer(source="OSM"),
                dol.<ComponentName>(id="<id>"),
            ],
            style={"height": "500px"},
        ),
        html.Pre(id="output"),
    ]
)

if __name__ == "__main__":
    app.run_server(debug=True)
```

Run manually:

```bash
uv run python tests/demos/<component_snake>.py
```

For snap and topology workflows, use `tests/demos/draw_demo.py` to inspect
vertex/edge targets and rollback feedback, or `tests/demos/wfs_demo.py` to try
snapping while editing a fetched WFS feature.

---

## 6. Coverage commands

Always use `uv run` — the `coverage` CLI lives inside the uv venv and is
**not** available as a bare `coverage` command (breaks in CI without `uv run`).

```bash
# Unit only
uv run pytest -q tests/unit --cov=dash_openlayers --cov-report=term

# Integration only (appends to existing .coverage)
uv run pytest -q tests/integration --cov=dash_openlayers --cov-append --cov-report=term

# Combined reports (after running both above)
uv run coverage xml -o coverage.xml
uv run coverage html -d coverage/html
```

---

## 7. Full local pre-commit sequence

Run this before opening a PR to match CI exactly:

```bash
npm run build          # JS bundles only — does NOT update metadata.json or .py wrappers
npm run lint           # ESLint
npm run format         # Prettier
uv run ruff check .    # Python lint
uv run ruff format .   # Python format
uv run pytest -q tests/unit --cov=dash_openlayers --cov-report=term
uv run pytest -q tests/integration --cov=dash_openlayers --cov-append --cov-report=term
uv run coverage xml
node scripts/check-ai-invariants.js
```

---

## 8. CI alignment

| CI job | Runs | Coverage flags |
|---|---|---|
| `test` (matrix: ubuntu + windows, Python 3.10–3.14) | `tests/unit` then `tests/integration` | `--cov` then `--cov-append` |
| Linux integration | wrapped in `xvfb-run -s "-screen 0 1280x1024x24"` | same |
| Windows integration | plain `pwsh` | same |

Locally on Windows, run integration tests without `xvfb-run` (Chrome opens a
visible window unless configured for headless mode via Selenium options).

---

## 9. Debugging a failing browser test

1. **No viewport found** (`TimeoutException` on `div.ol-viewport`):
   - Dump `dash_duo.driver.page_source[:10000]` and `dash_duo.driver.get_log("browser")`.
   - Common causes: JS bundle not rebuilt after a component change (`npm run build`
     was skipped), or a mismatched UMD/ESM bundle listed in `_js_dist`.

2. **`setProps` round-trip assertion fails** (prop never reaches `#output`):
   - Check the component's `setProps` call is guarded with `if (setProps) { ... }`.
   - Confirm the prop name in the `Output(...)` callback matches the `propTypes` key.
   - Add `time.sleep(2)` before the assertion to rule out a race, then switch to
     `dash_duo.wait_for_contains_text(..., timeout=5)`.

3. **Console errors** (`assert dash_duo.get_logs() == []` fails):
   - Print the log list: `print(dash_duo.get_logs())`.
   - `Unexpected token 'export'` → ESM bundle listed in `_js_dist` instead of UMD.
   - `Cannot read properties of null (reading 'useRef')` → duplicate React copy;
     check `rollup.config.js` externals.
   - Projection errors → run the `gis-projection-validator` skill.

4. **`chromedriver` version mismatch** locally:
   - `chromedriver_autoinstaller.install()` in `conftest.py` handles this
     automatically. If it still fails, update Chrome to the latest stable release.
