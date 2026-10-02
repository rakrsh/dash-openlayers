import React from 'react';
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import Draw from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { unByKey } from 'ol/Observable';
import { useMap } from '../context/OLContext';

const DrawInteraction = ({ id, geometryType, setProps }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const source = new VectorSource();
    const vector = new VectorLayer({ source });
    map.addLayer(vector);

    const draw = new Draw({
      source: source,
      type: geometryType,
    });

    map.addInteraction(draw);

    const drawEndListener = draw.on('drawend', (evt) => {
      const writer = new GeoJSON();
      const geojson = writer.writeFeatureObject(evt.feature, {
        featureProjection: map.getView().getProjection(),
        dataProjection: 'EPSG:4326',
      });

      if (setProps) {
        setProps({
          drawnGeoJSON: geojson,
        });
      }
    });

    return () => {
      unByKey(drawEndListener);
      map.removeInteraction(draw);
      map.removeLayer(vector);
      source.clear();
    };
  }, [map, geometryType, setProps]);

  return <div style={{ display: 'none' }} />;
};

DrawInteraction.defaultProps = {
  geometryType: 'Polygon',
};

DrawInteraction.propTypes = {
  /** The ID used to identify this component in Dash callbacks. */
  id: PropTypes.string,
  /** Geometry type drawn by this interaction. */
  geometryType: PropTypes.oneOf(['Point', 'LineString', 'Polygon', 'Circle']),
  /** Read-only: GeoJSON Feature emitted on `drawend`, set via `setProps`. */
  drawnGeoJSON: PropTypes.object,
  /** Dash-supplied prop setter; internal, do not set from Python. */
  setProps: PropTypes.func,
};

export default DrawInteraction;
