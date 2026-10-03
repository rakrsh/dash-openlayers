# AI Context Map — dash-openlayers

High-density architecture reference for AI coding agents. Read this before
generating or modifying components/interactions. For enforceable rules, see
[`.cursorrules`](../.cursorrules); this file is descriptive context, not a
rulebook.

## 1. End-to-end data-flow sequence

```
Python (Dash)                React                          OpenLayers/Canvas
--------------                -----                          ------------------
app.layout / callback
  dol.Map(center=..., ...)
        │  props (JSON over Dash renderer)
        ▼
                         <MapComponent props>
                           useEffect(() => {
                             new Map({ view: new View(...) })
                           })
                                 │  imperative API calls
                                 ▼
                                                        ol/Map renders to
                                                        <canvas> (WebGL/2D)
                                                                │ user interacts
                                                                │ (click, draw, drag)
                                 ▲  map.on('singleclick'|'drawend'|'moveend', ...)
                                 │
                           if (setProps) setProps({ clickData / drawnGeoJSON / center })
        ▲  prop update dispatched back through Dash renderer
        │
Output(...) in a Dash callback receives the new prop value
```

Key point: **Python never talks to OpenLayers directly.** Every round trip
goes Python prop → React prop → imperative OpenLayers call, and back via a
DOM/map event handler → `setProps` → Dash renderer → Python callback `Input`.

## 2. Component context hierarchy

```
<dol.Map>                                   OLContext.Provider value={mapInstance}
 │  creates ol/Map + ol/View in useEffect,
 │  registers proj4 defs, wires
 │  singleclick/moveend -> setProps
 │
 ├── <dol.TileLayer>        \
 ├── <dol.VectorLayer>       }-- useMap() from OLContext, addLayer/addInteraction
 └── <dol.DrawInteraction>  /    in their own useEffect, removeLayer/removeInteraction
                                 in the matching cleanup
```

- `OLContext` (`src/lib/context/OLContext.js`) holds the live `ol/Map`
  instance (or `null` before mount). `useMap()` throws if a component using
  it isn't rendered under `<Map>` — this is intentional; do not catch/hide
  that error, fix the tree instead.
- `<Map>` only provides context *after* the map is constructed
  (`{map ? children : null}`), so children's effects never run against a
  `null` map — don't add defensive `if (!map) return null` re-implementations
  in every child; rely on this mount ordering.
- Children never talk to each other directly; shared state (e.g. a vector
  source another interaction should draw into) is passed through props from
  the Dash layout, or looked up via the map's own layer collection.

## 3. Common pitfalls & anti-pattern matrix

| # | Anti-pattern (DO NOT) | Correct pattern (DO INSTEAD) |
| --- | --- | --- |
| 1 | Creating `new Map(...)` / `new VectorLayer(...)` in the component body or in `useMemo` | Create inside `useEffect`, store in `useRef`/`useState`, dispose in cleanup |
| 2 | Omitting the cleanup return from a `useEffect` that adds a layer/interaction/listener | Always `return () => { map.removeLayer(x); map.removeInteraction(y); unByKey(key); }` |
| 3 | Passing `[lat, lon]` to `fromLonLat`, `View({center})`, or a geometry | Always `[lon, lat]` — OpenLayers is `[x, y]` order |
| 4 | Calling `setProps(...)` without checking it exists | `if (setProps) { setProps({...}); }` — `setProps` is undefined outside a live Dash renderer |
| 5 | `propTypes` entries with a `//` comment or no comment | `/** JSDoc */` immediately above every `propTypes` key |
| 6 | Re-creating a `VectorSource`/`GeoJSON` reader inside a `useEffect` with a dependency that changes every render (e.g. an inline object/array literal prop), causing an add/remove/re-render loop | Memoize the input (stable prop reference from Python, or `useMemo`) and only rebuild the source when the actual GeoJSON data changes, not on every render |
| 7 | Adding a new component but forgetting to export it from `src/index.js` | Every new component is exported from `src/index.js` so it reaches the client bundle on build |
| 8 | Treating generated Python wrappers or API docs as hand-maintained | Update component metadata and run `npm run build`; it generates wrappers/imports and `docs/api.md` — see `.cursorrules` §8 |
| 9 | Re-importing `ol/ol.css` from every component | Import once, at the `Map` component boundary |
| 10 | Holding derived/duplicate state for a Dash-owned prop in local `useState` and drifting from the prop | Treat the incoming prop as source of truth; call the OpenLayers setter directly in an effect keyed on that prop |
| 11 | Listing the ESM bundle (`dash_openlayers.esm.js`) in `dash_openlayers/__init__.py`'s `_js_dist` | Dash serves `relative_package_path` assets as plain `<script>` tags (no `type="module"`) — list only the UMD bundle there; the ESM build is for npm/bundler consumers via `package-info.json`'s `module` field |
| 12 | Letting the UMD Rollup output bundle its own copy of `react`/`react-dom` | Mark them `external` (with `output.globals`) in `rollup.config.js`, or hooks like `useRef` break once Dash's own React instance loads alongside the duplicate |

## 4. File reference

| Path | Role |
| --- | --- |
| `src/lib/components/Map.react.js` | Root component: creates `ol/Map`/`ol/View`, proj4 registration, click/moveend → `setProps` |
| `src/lib/components/DrawInteraction.react.js` | Adds `ol/interaction/Draw` + scratch `VectorLayer`, `drawend` → `setProps({ drawnGeoJSON })` |
| `src/lib/context/OLContext.js` | `React.createContext` + `useMap()` hook |
| `src/index.js` | Public export surface consumed by the Python wrapper generator |
| `dash_openlayers/*.esm.js`, `*.umd.js` | **Generated** by `npm run build` (Rollup) — never hand-edit |
| `dash_openlayers/metadata.json` | Maintained component metadata source, aligned with React `propTypes` and JSDoc |
| `dash_openlayers/<Component>.py`, `_imports_.py`, `docs/api.md` | Generated from metadata by `npm run build` |
| `tests/test_*.py` | pytest suite (import + `dash_duo` integration tests) |
| `usage*.py` | Manual/demo Dash apps for local verification |
| `.agent/skills/` | Executable skill recipes for scaffolding components, validating projections, generating tests |
