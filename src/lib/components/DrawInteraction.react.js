import React from 'react';
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { booleanValid } from '@turf/boolean-valid';
import { kinks } from '@turf/kinks';
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
      const polygonGeometry = ['Polygon', 'MultiPolygon'].includes(geojson.geometry.type);
      const intersections = polygonGeometry
        ? kinks(geojson).features.map(({ geometry }) => ({
            code: 'self_intersection',
            coordinates: geometry.coordinates,
          }))
        : [];
      const structurallyValid = booleanValid(geojson);
      const errors = [...intersections];
      if (!structurallyValid) {
        errors.unshift({ code: 'invalid_geometry' });
      }

      const suggestions = [];
      if (intersections.length > 0) {
        suggestions.push('Move the reported vertices so polygon boundaries do not cross.');
      }
      if (!structurallyValid) {
        suggestions.push(
          'Close each ring, provide at least four positions, and keep holes inside the outer ring without overlap.',
        );
      }

      const valid = structurallyValid && intersections.length === 0;
      if (!valid) {
        source.removeFeature(evt.feature);
      }

      if (setProps) {
        setProps({
          drawnGeoJSON: valid ? geojson : null,
          geometryValidation: { valid, errors, suggestions },
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
  /** Read-only: GeoJSON Feature emitted only when geometry validation succeeds. */
  drawnGeoJSON: PropTypes.object,
  /** Read-only: validity, topology errors, and repair suggestions from the last draw. */
  geometryValidation: PropTypes.shape({
    valid: PropTypes.bool,
    errors: PropTypes.arrayOf(PropTypes.object),
    suggestions: PropTypes.arrayOf(PropTypes.string),
  }),
  /** Dash-supplied prop setter; internal, do not set from Python. */
  setProps: PropTypes.func,
};

export default DrawInteraction;
