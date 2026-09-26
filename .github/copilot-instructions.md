# GitHub Copilot Instructions — dash-openlayers

These instructions apply to the whole repository. Full invariant details
live in [`.cursorrules`](../.cursorrules) (kept in sync with
[`.windsurfrules`](../.windsurfrules)) — read that file for the complete
lifecycle, docstring, and projection rules. This file summarizes the
must-follow rules and the exact commands to use when verifying work.

## Non-negotiable invariants

1. **Lifecycle**: All `ol/*` object creation happens inside
   `useEffect`/`useLayoutEffect` with a matching cleanup (`removeLayer`,
   `removeInteraction`, `setTarget(null)`, `source.clear()`, `unByKey`).
2. **Dash bridge**: Outward state only via `setProps({ ... })`, always guarded
   with `if (setProps) { ... }`.
3. **Docstrings**: Every `propTypes` key has a `/** ... */` JSDoc block
   directly above it — no `//` comments. `react-docgen` (via `npm run build`)
   turns these into the Python wrapper's docstrings; missing JSDoc ships a
   blank Python docstring.
4. **Coordinates**: OpenLayers coordinate order is `[lon, lat]` / `[x, y]`,
   never `[lat, lon]`. Use `ol/proj` helpers (`fromLonLat`, `toLonLat`,
   `transform`) for conversions.
5. **File locations**: components in `src/lib/components/*.react.js`, context
   in `src/lib/context/`, exports wired in `src/index.js`. Never hand-edit
   generated output in `dash_openlayers/` — it's produced by `npm run build`.

## Command sequences

```bash
# Setup
npm install
uv sync

# After any component/propTypes change
npm run build          # regenerates dash_openlayers/*.py + metadata.json
npm run lint
npm run format
uv run pytest -q
uv run ruff check .
uv run ruff format .

# AI quality gate checks run locally (same as CI, see Task 5 below)
node scripts/check-ai-invariants.js
```

Always run `npm run build` after touching `propTypes` and check that the
diff under `dash_openlayers/` reflects only the intended prop changes —
uncommitted generator drift fails the `package` CI job.

## Adding a new component

Use the `scaffold-dash-ol-component` skill
([.agent/skills/scaffold-dash-ol-component/SKILL.md](../.agent/skills/scaffold-dash-ol-component/SKILL.md))
rather than hand-writing boilerplate — it produces the React component, the
`src/index.js` export, a `tests/test_<component>.py` draft, and a
`usage_<component>.py` demo in one pass, with JSDoc and cleanup effects
already compliant with the invariants above.

For projection/coordinate work, use the `gis-projection-validator` skill.
For Selenium-based Dash integration tests, use the `dash-duo-test-generator`
skill.

## Architecture reference

See [.github/AI_CONTEXT.md](AI_CONTEXT.md) for the full data-flow diagram,
context hierarchy, and anti-pattern matrix before generating new components
or interactions.
