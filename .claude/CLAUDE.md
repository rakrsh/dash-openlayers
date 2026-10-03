# CLAUDE.md — dash-openlayers Workspace Settings

This file configures Claude Code for the `dash-openlayers` repository. Full
invariant details live in [`.cursorrules`](../.cursorrules) — read that first.
This file adds Claude-specific workflow guidance.

## Project shape

- React components live in `src/lib/components`; component metadata is
  maintained in `dash_openlayers/metadata.json`. `npm run build` produces the
  JS bundles, Python wrappers/imports, and API reference from that metadata.
- Map instance lives in `OLContext` (`src/lib/context/OLContext.js`);
  children read it with `useMap()`.
- Never hand-edit generated `dash_openlayers/*.js` bundles or Python wrapper
  classes. Update the matching metadata entry with React `propTypes` changes,
  then run `npm run build` to regenerate the artifacts.

## Non-negotiable invariants (see `.cursorrules` for full detail)

1. OpenLayers objects are created/disposed inside `useEffect` with cleanup.
2. Outward state changes go through `setProps({ ... })`, guarded by
   `if (setProps)`.
3. Every `propTypes` key has a JSDoc `/** ... */` block immediately above it,
   with a matching description in the metadata source. No `//` comments.
4. Coordinates are `[lon, lat]` (`[x, y]`), never `[lat, lon]`. Use `ol/proj`
   helpers for all transforms.
5. Components go in `src/lib/components/`, are exported from `src/index.js`,
   and require a matching metadata entry; wrappers are generated during build.
   Tests live in `tests/`.
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
npm run build           # regenerate JS bundles, Python wrappers, and API docs
npm run lint
npm test                # if/when a JS test runner is configured; currently Python-only via pytest
uv sync
uv run pytest -q
uv run ruff check .
uv run coverage xml     # coverage CLI lives in the uv venv; always use `uv run`, never bare `coverage`
node scripts/check-ai-invariants.js   # JSDoc + cleanup-hook AST gate (same as CI)
```

Update `dash_openlayers/metadata.json` with each `propTypes` change, then run
`npm run build`; Python wrappers and the API reference are generated from it.

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
