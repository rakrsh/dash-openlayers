---
name: scaffold-dash-ol-component
description: Generate a complete, production-ready dash-openlayers React component (with JSDoc-compliant propTypes, useMap()/context usage, and cleanup effects), wire it into src/index.js, and draft its Python test + usage demo. Use when the user asks to add/create a new dash-openlayers component (e.g. "add a VectorTileLayer component").
---

# Skill: scaffold-dash-ol-component

Auto-generate a new Dash OpenLayers component end-to-end, compliant with the
repository invariants in [`.cursorrules`](../../../.cursorrules).

## Inputs

Ask (or infer from the request) for:

- `name` — PascalCase component name, e.g. `VectorTileLayer`.
- `description` — one-sentence purpose, used as the top-level JSDoc/docgen
  description.
- `kind` — one of `layer`, `source`, `interaction`, `control` (determines
  whether it calls `map.addLayer`/`addInteraction`/`addControl`).
- `olClass` — the underlying `ol/*` class to wrap (e.g. `ol/layer/VectorTile`,
  `ol/interaction/Modify`).
- `props` — list of `{ name, jsType, description, bidirectional? }` the
  component should expose, beyond `id` and `setProps`.

## Deliverables (generate all four)

### 1. `src/lib/components/<name>.react.js`

Template shape:

```javascript
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import <OlClass> from '<ol-import-path>';
import { useMap } from '../context/OLContext';

/**
 * <description>
 */
const <name> = ({ id, /* ...props */, setProps }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return undefined;

    const instance = new <OlClass>({ /* map props -> ol options */ });
    map.add<Layer|Interaction|Control>(instance);

    // only for interactions/sources that emit events back to Dash:
    // instance.on('<event>', (evt) => {
    //   if (setProps) {
    //     setProps({ <resultProp>: /* derived value, e.g. GeoJSON */ });
    //   }
    // });

    return () => {
      map.remove<Layer|Interaction|Control>(instance);
    };
  }, [map /* , ...prop deps that require re-creating instance */]);

  return null;
};

<name>.defaultProps = {
  // sensible defaults, opt-in/experimental props default to false/null
};

<name>.propTypes = {
  /** Component ID, used for Dash callback matching. */
  id: PropTypes.string,
  // one JSDoc block per prop, mirroring `props` input — no `//` comments
  /** Dash-supplied prop-setter; internal, do not set from Python. */
  setProps: PropTypes.func,
};

export default <name>;
```

Rules to enforce while generating:
- Instantiate `<OlClass>` only inside `useEffect`; always return a cleanup
  that removes it from the map.
- Every `propTypes` key gets a `/** ... */` block immediately above it.
- If the component emits data back to Python, guard every `setProps` call
  with `if (setProps) { ... }`.
- Coordinate-bearing props must document units and order (`[lon, lat]`) in
  their JSDoc.

### 2. `src/index.js` update

Add the import and export for `<name>`, alphabetically grouped with existing
exports:

```javascript
import <name> from './lib/components/<name>.react';
// ...
export { Map, DrawInteraction, <name>, OLContext };
```

### 3. `tests/test_<name_snake_case>.py` (draft)

```python
import importlib


def test_<name_snake_case>_importable():
    mod = importlib.import_module("dash_openlayers")
    assert hasattr(mod, "<name>")
```

Note in a comment/TODO that a `dash_duo` interaction test should be added via
the `dash-duo-test-generator` skill once the component's event behavior is
finalized.

### 4. `usage_<name_snake_case>.py` (demo)

A minimal runnable Dash app (mirroring `usage.py`) that renders `dol.Map`
with the new component as a child and prints any `setProps`-driven output in
an `html.Pre`/callback, so the component can be manually verified with
`python usage_<name_snake_case>.py`.

## Post-generation checklist (report to the user)

1. `npm run build` — regenerate `dash_openlayers/*.py` + `metadata.json`;
   confirm the new component's docstring is non-empty (JSDoc was picked up).
2. `npm run lint` — must pass with zero errors.
3. `uv run pytest -q` — new import test passes.
4. Remind the user to run `node scripts/check-ai-invariants.js` (or let CI's
   `ai-quality-gate` workflow do it) before opening a PR.
