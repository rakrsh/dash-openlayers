# Architecture

This diagram shows the high-level component architecture and runtime interactions between the React components (OpenLayers), the Dash Python layer, and projection registration.

```mermaid
graph TD
  A[dol.Map<br/>OLContext Provider] --> B[ol/Map instance]
  A --> C[dol.TileLayer]
  A --> D[dol.VectorLayer]
  A --> E[dol.DrawInteraction]
  B --> F[ol/View]
  C --> G[ol/layer/Tile]
  D --> H[ol/layer/Vector]
  E --> I[ol/interaction/Draw]
  I --> J[GeoJSON writer]
  B --> K[Events: click, moveend]
  K --> L[Dash Python setProps]
  A --> M[proj4js registration]
  M --> B
  subgraph Python
    L
    N[usage.py / Dash app]
    N --> L
  end
```

Notes:
- `dol.Map` creates the OpenLayers `ol/Map` and exposes it via `OLContext` so children attach directly to the map.
- Interactions (draw/modify) write GeoJSON which is propagated back to Dash via `setProps`.
- `proj4js` definitions are registered at map initialization and used by `ol/View` when a non-standard projection is selected.
