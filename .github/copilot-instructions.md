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
   directly above it — no `//` comments. Keep the matching descriptions in
   `dash_openlayers/metadata.json`; `npm run build` generates the Python
   `Component` classes and API reference from that metadata.
4. **Coordinates**: OpenLayers coordinate order is `[lon, lat]` / `[x, y]`,
   never `[lat, lon]`. Use `ol/proj` helpers (`fromLonLat`, `toLonLat`,
   `transform`) for conversions.
5. **File locations**: components in `src/lib/components/*.react.js`, context
   in `src/lib/context/`, exports wired in `src/index.js`. Never hand-edit the
   generated JS bundles (`dash_openlayers/*.esm.js`/`*.umd.js`) — they're
   produced by `npm run build`. `dash_openlayers/metadata.json` is maintained;
   Python wrappers and `_imports_.py` are generated. Update `src/index.js` and
   metadata when a component is added or its props change, then run the build.
6. **Dash bundle loading**: `dash_openlayers/__init__.py`'s `_js_dist` must
   list only the UMD bundle — Dash serves `relative_package_path` assets as
   plain `<script>` tags (no `type="module"`), so an ESM bundle listed there
   throws `Unexpected token 'export'` in the browser. Also keep `react`,
   `react-dom`, `prop-types` marked `external` in `rollup.config.js`'s UMD
   output, or the bundle embeds a duplicate React copy that breaks hooks
   (`useRef`) once Dash's own React runtime loads.

## Command sequences

```bash
# Setup
npm install
uv sync
npm test              # Jest + React Testing Library; enforces 80% statements per core component

# After any component/propTypes change
npm run build          # bundles + Python wrappers/imports + docs/api.md
npm test               # frontend unit tests and per-component coverage thresholds
npm run lint
npm run format
uv run pytest -q
uv run ruff check .
uv run ruff format .
uv run coverage xml    # coverage CLI lives in the uv venv; always use `uv run`

# AI quality gate checks run locally (same as CI, see Task 5 below)
node scripts/check-ai-invariants.js
```

Always update `dash_openlayers/metadata.json` alongside `propTypes`, then run
`npm run build` and check the generated wrapper/API diffs before committing.

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
For writing or running tests across all layers (unit, integration, demos),
coverage commands, and debugging failed browser tests, use the
`dash-ol-test-runner` skill
([.agent/skills/dash-ol-test-runner/SKILL.md](../.agent/skills/dash-ol-test-runner/SKILL.md)).

## Architecture reference

See [.github/AI_CONTEXT.md](AI_CONTEXT.md) for the full data-flow diagram,
context hierarchy, and anti-pattern matrix before generating new components
or interactions.
