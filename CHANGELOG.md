# Changelog

Notable changes for each release are recorded here.

## 0.1.0 - 2026-10-10

### Added

- Vector layers can load GeoJSON, TopoJSON, KML, and WKT data.
- Vector-tile layers support MVT/PBF sources and attribute-based styling.
- Map callbacks expose geographic pointer events, viewport bounds, and feature information.
- Drawing workflows include an interactive toolbar, geometry modification, and spatial measurements.
- Layer controls support visibility, opacity, ordering, and Dash-driven layer property updates.

### Improved

- Expanded component APIs, examples, generated documentation, and integration coverage.

## 0.0.2

### Added

- GeoJSON data input for vector layers, including CRS-aware parsing.
- WebGL point rendering for large datasets, with data-driven styling.
- Map click and hover event data for Dash callbacks.
- Interactive point, line, polygon, circle, and rectangle drawing with GeoJSON, WKT, and TopoJSON outputs.
- End-to-end application examples for tile maps, GeoPandas choropleths, and callback-driven spatial filtering.

### Improved

- Nested declarative map children and two-way map view synchronization.
- Component API descriptions, generated Python docstrings, and the deployed documentation gallery.
