# Testing

## Requirements

Install the development dependencies with `uv sync`. Browser tests require a
Chrome-compatible browser; `tests/conftest.py` installs the matching ChromeDriver.
On Linux, run browser tests under Xvfb when no display is available.

## Run tests

Run the fast Python wrapper tests with the required coverage threshold:

```bash
uv run pytest -q tests/unit --cov=dash_openlayers --cov-report=term --cov-fail-under=80
```

Run the Selenium integration and end-to-end tests:

```bash
# Linux headless
xvfb-run -s "-screen 0 1280x1024x24" uv run pytest -q tests/integration

# Windows or a machine with a display
uv run pytest -q tests/integration
```

Generate a combined coverage report after running both test groups:

```bash
uv run pytest -q tests/unit --cov=dash_openlayers --cov-report=term --cov-fail-under=80
uv run pytest -q tests/integration --cov=dash_openlayers --cov-append --cov-report=term
uv run coverage xml -o coverage.xml
uv run coverage html -d coverage/html
```

Coverage measures the Python Dash wrapper package. The browser tests exercise
the bundled React/OpenLayers behavior through Dash callbacks; JavaScript source
coverage is not currently collected.

## Manual demo apps

Run an app from the repository root to inspect component behavior in a browser:

```bash
uv run python tests/demos/simple_map.py
uv run python tests/demos/draw_demo.py
uv run python tests/demos/projection_demo.py
```

The simple map reports click coordinates, the draw demo displays emitted
GeoJSON, and the projection demo opens a British National Grid view.
