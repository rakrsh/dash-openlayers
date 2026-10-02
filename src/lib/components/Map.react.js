import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { toLonLat } from 'ol/proj';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { OLContext } from '../context/OLContext';

const MapComponent = ({ id, children, center, zoom, projection, proj4Defs, style, setProps }) => {
  const mapElement = useRef(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (proj4Defs && proj4Defs.length > 0) {
      proj4Defs.forEach(({ code, def }) => {
        proj4.defs(code, def);
      });
      register(proj4);
    }
  }, [proj4Defs]);

  useEffect(() => {
    if (!mapElement.current) return;

    const olMap = new Map({
      target: mapElement.current,
      view: new View({
        projection: projection,
        center: center,
        zoom: zoom,
      }),
    });

    olMap.on('singleclick', (evt) => {
      if (setProps) {
        const lonLat = toLonLat(evt.coordinate, projection);
        setProps({
          clickData: {
            coordinate: evt.coordinate,
            latLon: [lonLat[1], lonLat[0]],
          },
        });
      }
    });

    olMap.on('moveend', () => {
      if (setProps) {
        const view = olMap.getView();
        setProps({
          center: view.getCenter(),
          zoom: view.getZoom(),
        });
      }
    });

    setMap(olMap);

    return () => olMap.setTarget(null);
  }, []);

  useEffect(() => {
    if (!map) return;

    const view = map.getView();
    const currentCenter = view.getCenter();
    if (
      center &&
      (!currentCenter || currentCenter[0] !== center[0] || currentCenter[1] !== center[1])
    ) {
      view.setCenter(center);
    }

    if (zoom !== undefined && zoom !== view.getZoom()) {
      view.setZoom(zoom);
    }
  }, [center, map, zoom]);

  return (
    <OLContext.Provider value={map}>
      <div id={id} ref={mapElement} style={style || { width: '100%', height: '500px' }}>
        {map ? children : null}
      </div>
    </OLContext.Provider>
  );
};

MapComponent.defaultProps = {
  center: [0, 0],
  zoom: 2,
  projection: 'EPSG:3857',
  proj4Defs: [],
};

MapComponent.propTypes = {
  /** The ID used to identify this component in Dash callbacks. */
  id: PropTypes.string,
  /** OpenLayers layer/interaction components (e.g. TileLayer, DrawInteraction) rendered inside this map. */
  children: PropTypes.node,
  /**
   * Map view center as [x, y] in `projection`'s units (e.g. [lon, lat] for
   * EPSG:4326, [x, y] in meters for EPSG:3857/projected CRSs). Bidirectional:
   * updates on `moveend` and can be set from Python.
   */
  center: PropTypes.arrayOf(PropTypes.number),
  /** Map zoom level. Bidirectional: updates on `moveend` and can be set from Python. */
  zoom: PropTypes.number,
  /** EPSG code the view is rendered in, e.g. 'EPSG:3857' or a custom code registered via `proj4Defs`. */
  projection: PropTypes.string,
  /** Custom proj4 projection definitions to register before the view is constructed, e.g. [{ code: 'EPSG:27700', def: '+proj=tmerc ...' }]. */
  proj4Defs: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      def: PropTypes.string.isRequired,
    }),
  ),
  /** Inline CSS style object applied to the map container div. */
  style: PropTypes.object,
  /** Read-only: set on `singleclick` with `{ coordinate: [x, y], latLon: [lat, lon] }`. */
  clickData: PropTypes.object,
  /** Dash-supplied prop setter; internal, do not set from Python. */
  setProps: PropTypes.func,
};

export default MapComponent;
