# CLAUDE.md — dash-openlayers Workspace Settings

This file configures Claude Code for the `dash-openlayers` repository. Full
invariant details live in [`.cursorrules`](../.cursorrules) — read that first.
This file adds Claude-specific workflow guidance.

## Project shape

- Python/Dash wrapper hand-authored alongside React components
  (`src/lib/components`). `npm run build` (Rollup) only produces the JS
  bundles (`dash_openlayers.esm.js`/`.umd.js`) — there is no react-docgen or
  Python-generation step wired in, despite the `react-docgen` devDependency.
- Map instance lives in `OLContext` (`src/lib/context/OLContext.js`);
  children read it with `useMap()`.
- Never hand-edit `dash_openlayers/*.js` — regenerate with `npm run build`.
  `dash_openlayers/metadata.json` and `dash_openlayers/*.py` (Python wrapper
  classes) ARE hand-maintained here; update them yourself whenever
  `propTypes` change.

## Non-negotiable invariants (see `.cursorrules` for full detail)

1. OpenLayers objects are created/disposed inside `useEffect` with cleanup.
2. Outward state changes go through `setProps({ ... })`, guarded by
   `if (setProps)`.
3. Every `propTypes` key has a JSDoc `/** ... */` block immediately above it,
   mirrored by hand into `metadata.json`'s `description` field and the
   Python class docstring. No `//` comments.
4. Coordinates are `[lon, lat]` (`[x, y]`), never `[lat, lon]`. Use `ol/proj`
   helpers for all transforms.
5. Components go in `src/lib/components/`, are exported from `src/index.js`,
   and require a matching hand-written entry in `dash_openlayers/metadata.json`
   and `dash_openlayers/<Component>.py`; tests live in `tests/`.
6. `dash_openlayers/__init__.py`'s `_js_dist` must list only the UMD bundle.
   Dash renders `relative_package_path` assets as plain `<script>` tags (no
   `type="module"`), so an ESM entry there throws `Unexpected token 'export'`
   in the browser. Keep `react`/`react-dom`/`prop-types` `external` in
   `rollup.config.js`'s UMD output too, or the bundle ships a duplicate React
   copy that breaks hooks (`useRef`) at runtime.

## Build, test & verification pipeline

Run these in order after any code change, and report failures rather than
silently working around them:

```bash
npm install
npm run build           # regenerate JS bundles only (ESM + UMD)
npm run lint
npm test                # if/when a JS test runner is configured; currently Python-only via pytest
uv sync
uv run pytest -q
uv run ruff check .
uv run coverage xml     # coverage CLI lives in the uv venv; always use `uv run`, never bare `coverage`
node scripts/check-ai-invariants.js   # JSDoc + cleanup-hook AST gate (same as CI)
```

After `npm run build`, manually update `dash_openlayers/metadata.json` and
the affected `dash_openlayers/<Component>.py` to match any `propTypes`
change — there is no generator step to do this for you.

Treat a non-zero exit from any of these as a blocking failure to fix before
declaring a task complete.

## Skills

Prefer the packaged skills under `.agent/skills/` over freehand generation:

- `scaffold-dash-ol-component` — new component + export + test + usage demo.
- `gis-projection-validator` — audit/generate proj4 definitions and coordinate
  order across GeoJSON sources, `View` init, and `fromLonLat`/`transform`
  calls.
- `dash-duo-test-generator` — Selenium (`dash[testing]`/`dash_duo`) end-to-end
  tests for click/draw/layer-state interactions.

## Context map

Read [.github/AI_CONTEXT.md](../.github/AI_CONTEXT.md) before adding new
components or interactions — it documents the Python → React → OpenLayers →
Canvas → event → `setProps` → Python round trip and the anti-pattern matrix.
