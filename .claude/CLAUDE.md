# CLAUDE.md — dash-openlayers Workspace Settings

This file configures Claude Code for the `dash-openlayers` repository. Full
invariant details live in [`.cursorrules`](../.cursorrules) — read that first.
This file adds Claude-specific workflow guidance.

## Project shape

- Python/Dash wrapper generated from React components (`src/lib/components`)
  via `@plotly/dash-component-boilerplate` tooling (`npm run build` →
  `react-docgen` + Rollup).
- Map instance lives in `OLContext` (`src/lib/context/OLContext.js`);
  children read it with `useMap()`.
- Never hand-edit `dash_openlayers/*.py`, `dash_openlayers/*.js`, or
  `dash_openlayers/metadata.json` — regenerate with `npm run build`.

## Non-negotiable invariants (see `.cursorrules` for full detail)

1. OpenLayers objects are created/disposed inside `useEffect` with cleanup.
2. Outward state changes go through `setProps({ ... })`, guarded by
   `if (setProps)`.
3. Every `propTypes` key has a JSDoc `/** ... */` block immediately above it
   (parsed by `react-docgen` into the Python docstring). No `//` comments.
4. Coordinates are `[lon, lat]` (`[x, y]`), never `[lat, lon]`. Use `ol/proj`
   helpers for all transforms.
5. Components go in `src/lib/components/`, are exported from `src/index.js`,
   Python wrappers build to `dash_openlayers/`, tests live in `tests/`.

## Build, test & verification pipeline

Run these in order after any code change, and report failures rather than
silently working around them:

```bash
npm install
npm run build           # regenerate JS bundle + Python wrapper/metadata
npm run lint
npm test                # if/when a JS test runner is configured; currently Python-only via pytest
uv sync
uv run pytest -q
uv run ruff check .
node scripts/check-ai-invariants.js   # JSDoc + cleanup-hook AST gate (same as CI)
```

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
