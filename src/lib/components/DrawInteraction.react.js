import React from 'react';
import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Draw from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { unByKey } from 'ol/Observable';
import { useMap } from '../context/OLContext';
import { getEditHistory } from '../utils/editHistory';
import { getTopologyErrors } from '../utils/geometryValidation';
import { addSnapInteraction } from '../utils/snap';
import { exportFeature } from '../utils/featureFormats';

const DrawInteraction = ({
  id,
  geometryType,
  snapToVertex = true,
  snapToEdge = true,
  snapTolerance = 10,
  setProps,
}) => {
  const map = useMap();
  const setPropsRef = useRef(setProps);

  useEffect(() => {
    setPropsRef.current = setProps;
  }, [setProps]);

  useEffect(() => {
    if (!map) return;

    const source = new VectorSource();
    const vector = new VectorLayer({ source });
    const history = getEditHistory(map);
    vector.set('dashId', id);
    map.addLayer(vector);

    const draw = new Draw({
      source: source,
      type: geometryType,
    });

    map.addInteraction(draw);

    const drawEndListener = draw.on('drawend', (evt) => {
      const formatOptions = {
        featureProjection: map.getView().getProjection(),
        dataProjection: 'EPSG:4326',
      };
      const writer = new GeoJSON();
      const geojson = writer.writeFeatureObject(evt.feature, formatOptions);
      const errors = getTopologyErrors(geojson);
      const structurallyValid = !errors.some((error) => error.code === 'invalid_geometry');
      const intersections = errors.filter((error) => error.code === 'self_intersection');

      const suggestions = [];
      if (intersections.length > 0) {
        suggestions.push('Move the reported vertices so polygon boundaries do not cross.');
      }
      if (!structurallyValid) {
        suggestions.push(
          'Close each ring, provide at least four positions, and keep holes inside the outer ring without overlap.',
        );
      }

      const valid = errors.length === 0;
      const outputFormats = valid ? exportFeature(evt.feature, formatOptions) : null;
      if (!valid) {
        source.removeFeature(evt.feature);
      } else {
        history.record(
          {
            undo: () => {
              source.removeFeature(evt.feature);
              if (setPropsRef.current) {
                setPropsRef.current({
                  drawnGeoJSON: null,
                  drawnWKT: null,
                  drawnTopoJSON: null,
                });
              }
            },
            redo: () => {
              source.addFeature(evt.feature);
              if (setPropsRef.current) {
                setPropsRef.current({
                  drawnGeoJSON: outputFormats.geojson,
                  drawnWKT: outputFormats.wkt,
                  drawnTopoJSON: outputFormats.topojson,
                });
              }
            },
          },
          source,
        );
      }

      if (setPropsRef.current) {
        setPropsRef.current({
          drawnGeoJSON: valid ? outputFormats.geojson : null,
          drawnWKT: valid ? outputFormats.wkt : null,
          drawnTopoJSON: valid ? outputFormats.topojson : null,
          geometryValidation: { valid, errors, suggestions },
        });
      }
    });

    return () => {
      unByKey(drawEndListener);
      history.removeSource(source);
      map.removeInteraction(draw);
      map.removeLayer(vector);
      source.clear();
    };
  }, [map, geometryType, id]);

  useEffect(
    () => addSnapInteraction(map, { snapToVertex, snapToEdge, snapTolerance }),
    [map, id, geometryType, snapToVertex, snapToEdge, snapTolerance],
  );

  return <div style={{ display: 'none' }} />;
};

DrawInteraction.defaultProps = {
  geometryType: 'Polygon',
  snapToVertex: true,
  snapToEdge: true,
  snapTolerance: 10,
};

DrawInteraction.propTypes = {
  /** The ID used to identify this component in Dash callbacks. */
  id: PropTypes.string,
  /** Geometry type drawn by this interaction. */
  geometryType: PropTypes.oneOf(['Point', 'LineString', 'Polygon', 'Circle']),
  /** Whether drawing snaps to existing vector vertices. */
  snapToVertex: PropTypes.bool,
  /** Whether drawing snaps to existing vector edges. */
  snapToEdge: PropTypes.bool,
  /** Maximum snap distance in screen pixels. */
  snapTolerance: PropTypes.number,
  /** Read-only: GeoJSON Feature emitted only when geometry validation succeeds. */
  drawnGeoJSON: PropTypes.object,
  /** Read-only: WKT geometry emitted only when geometry validation succeeds. */
  drawnWKT: PropTypes.string,
  /** Read-only: TopoJSON topology emitted only when geometry validation succeeds. */
  drawnTopoJSON: PropTypes.object,
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
