---
name: gis-projection-validator
description: Audit or scaffold spatial-projection/coordinate-transform code in dash-openlayers — generate valid proj4 definitions, verify coordinate axis order ([x, y] / [lon, lat] vs [lat, lon]), and ensure ol/proj transforms are used correctly across GeoJSON sources and View initialization. Use when adding/reviewing custom EPSG codes, WMS/WFS layers, or any code touching coordinates.
---

# Skill: gis-projection-validator

Prevents the two highest-frequency GIS mistakes in this codebase: swapped
coordinate axis order and missing/incorrect proj4 registration.

## When to run this skill

- Before/after adding a `View`, layer `source`, or geometry that takes raw
  coordinates.
- Before/after adding a custom EPSG projection (`proj4Defs` usage).
- When reviewing a diff that touches `fromLonLat`, `toLonLat`, `transform`,
  `proj4.defs`, `register(proj4)`, or literal coordinate arrays.

## Axis-order check

OpenLayers coordinates are always `[x, y]`:

- In `EPSG:4326` (lon/lat): `[longitude, latitude]`.
- In `EPSG:3857` (web mercator) or any projected CRS: `[easting, northing]`.

Flag any of these as bugs:

```javascript
// WRONG — [lat, lon] passed where OpenLayers expects [lon, lat]
fromLonLat([latitude, longitude]);
new View({ center: [latitude, longitude] });

// WRONG — GeoJSON coordinates must be [lon, lat] per RFC 7946, not [lat, lon]
{ "type": "Point", "coordinates": [latitude, longitude] }
```

```javascript
// RIGHT
fromLonLat([longitude, latitude]);
new View({ center: fromLonLat([longitude, latitude]) });
{ "type": "Point", "coordinates": [longitude, latitude] }
```

When a value's semantic order is ambiguous from variable names alone
(e.g. `coords[0]`, `coords[1]`), prefer destructuring with explicit names
(`const [lon, lat] = coords;`) so axis order is self-documenting.

## proj4 registration check

Custom EPSG codes (anything other than `EPSG:4326`/`EPSG:3857`, which
OpenLayers knows natively) must be registered **before** any `View` or
geometry using that projection is constructed:

```javascript
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 ' +
  '+x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs');
register(proj4);

// only now is it safe to do:
new View({ projection: 'EPSG:27700', center: [530000, 180000] });
```

Validate:
1. `proj4.defs(code, def)` is called for every non-built-in `code` used by a
   `View`/layer `projection` prop.
2. `register(proj4)` runs after all `proj4.defs` calls and before the `View`
   is constructed (see the ordering already enforced in
   `Map.react.js`'s two `useEffect`s — registration effect has no
   dependency on the map).
3. The proj4 `def` string is a valid PROJ string (starts with `+proj=`,
   balanced `+key=value` tokens) — flag anything else as suspect and ask the
   user to confirm it against [epsg.io](https://epsg.io) rather than
   guessing values.
4. `proj4Defs` values passed from Python land in `propTypes` as
   `PropTypes.arrayOf(PropTypes.shape({ code, def }))` — do not change this
   shape without updating both `Map.react.js` and any usage demos.

## Generating a new custom-projection example

When asked to add support for a specific EPSG code:

1. Look up (or ask the user to confirm) the official PROJ definition for the
   code — do not fabricate projection parameters.
2. Add a `proj4Defs` entry `{ code: 'EPSG:xxxx', def: '<proj string>' }` to
   the relevant `usage*.py` demo.
3. Confirm `center`/example coordinates supplied alongside it are in that
   projection's native units and `[x, y]` order (state the unit, e.g.
   meters for `EPSG:27700`).

## Output format when auditing existing code

Report findings as a table: `file:line | issue | fix`. Do not silently
rewrite files during an audit-only request — only apply fixes when the user
asks for the fix to be made (or when invoked as part of
`scaffold-dash-ol-component`).
