import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import GeoJSON from 'ol/format/GeoJSON';
import Modify from 'ol/interaction/Modify';
import VectorSource from 'ol/source/Vector';
import { unByKey } from 'ol/Observable';
import { useMap } from '../context/OLContext';
import { getEditHistory } from '../utils/editHistory';
import { getTopologyErrors } from '../utils/geometryValidation';
import { addSnapInteraction } from '../utils/snap';

/** Allow editing vertices in a VectorLayer and report the updated features. */
const ModifyInteraction = ({
  layerId,
  snapToVertex = true,
  snapToEdge = true,
  snapTolerance = 10,
  preserveTopology = true,
  setProps,
}) => {
  const map = useMap();
  const setPropsRef = useRef(setProps);

  useEffect(() => {
    setPropsRef.current = setProps;
  }, [setProps]);

  useEffect(() => {
    const layers = map.getLayers().getArray();
    const targetLayer = layers.find((layer) => {
      const source = layer.getSource?.();
      return source instanceof VectorSource && (!layerId || layer.get('dashId') === layerId);
    });
    const source = targetLayer?.getSource();
    if (!source) return;

    const format = new GeoJSON();
    const history = getEditHistory(map);
    const modify = new Modify({ source });
    map.addInteraction(modify);
    const publishModifiedGeoJSON = () => {
      if (setPropsRef.current) {
        setPropsRef.current({
          modifiedGeoJSON: format.writeFeaturesObject(source.getFeatures(), {
            featureProjection: map.getView().getProjection(),
            dataProjection: 'EPSG:4326',
          }),
        });
      }
    };

    let beforeGeometries = null;
    const startListenerKey = modify.on('modifystart', (event) => {
      beforeGeometries = event.features.getArray().map((feature) => ({
        feature,
        geometry: feature.getGeometry().clone(),
        topologyErrors: getTopologyErrors(
          format.writeFeatureObject(feature, {
            featureProjection: map.getView().getProjection(),
            dataProjection: 'EPSG:4326',
          }),
        ),
      }));
    });

    const endListenerKey = modify.on('modifyend', (event) => {
      const features = event.features.getArray();
      const afterGeometries = features.map((feature) => ({
        feature,
        geometry: feature.getGeometry().clone(),
      }));
      const previousGeometries = beforeGeometries;
      const topologyErrors = preserveTopology
        ? afterGeometries.flatMap(({ feature }) => {
            const previous = previousGeometries?.find((entry) => entry.feature === feature);
            if (!previous || previous.topologyErrors.length > 0) return [];
            return getTopologyErrors(
              format.writeFeatureObject(feature, {
                featureProjection: map.getView().getProjection(),
                dataProjection: 'EPSG:4326',
              }),
            );
          })
        : [];

      if (previousGeometries && topologyErrors.length > 0) {
        previousGeometries.forEach(({ feature, geometry }) =>
          feature.setGeometry(geometry.clone()),
        );
        if (setPropsRef.current) {
          setPropsRef.current({
            geometryValidation: {
              valid: false,
              errors: topologyErrors,
              suggestions: ['The edit was reverted because it would invalidate polygon topology.'],
            },
          });
        }
      } else if (previousGeometries) {
        history.record(
          {
            undo: () => {
              previousGeometries.forEach(({ feature, geometry }) =>
                feature.setGeometry(geometry.clone()),
              );
              publishModifiedGeoJSON();
            },
            redo: () => {
              afterGeometries.forEach(({ feature, geometry }) =>
                feature.setGeometry(geometry.clone()),
              );
              publishModifiedGeoJSON();
            },
          },
          source,
        );
        if (preserveTopology && setPropsRef.current) {
          setPropsRef.current({ geometryValidation: { valid: true, errors: [], suggestions: [] } });
        }
      }
      beforeGeometries = null;

      publishModifiedGeoJSON();
    });

    return () => {
      unByKey(startListenerKey);
      unByKey(endListenerKey);
      map.removeInteraction(modify);
    };
  }, [layerId, map, preserveTopology]);

  useEffect(
    () => addSnapInteraction(map, { snapToVertex, snapToEdge, snapTolerance }),
    [map, layerId, snapToVertex, snapToEdge, snapTolerance],
  );

  return null;
};

ModifyInteraction.defaultProps = {
  layerId: null,
  snapToVertex: true,
  snapToEdge: true,
  snapTolerance: 10,
  preserveTopology: true,
};

ModifyInteraction.propTypes = {
  /** The ID used to identify this component in Dash callbacks. */
  id: PropTypes.string,
  /** Dash ID of the VectorLayer to modify; defaults to the first vector layer on the map. */
  layerId: PropTypes.string,
  /** Whether editing snaps to vector vertices. */
  snapToVertex: PropTypes.bool,
  /** Whether editing snaps to vector edges. */
  snapToEdge: PropTypes.bool,
  /** Maximum snap distance in screen pixels. */
  snapTolerance: PropTypes.number,
  /** Revert polygon edits that introduce invalid topology. */
  preserveTopology: PropTypes.bool,
  /** Read-only: GeoJSON FeatureCollection of the target layer after a modify operation. */
  modifiedGeoJSON: PropTypes.object,
  /** Read-only: topology validation result from the last modification. */
  geometryValidation: PropTypes.shape({
    valid: PropTypes.bool,
    errors: PropTypes.arrayOf(PropTypes.object),
    suggestions: PropTypes.arrayOf(PropTypes.string),
  }),
  /** Dash-supplied callback used to write component state back to the layout. */
  setProps: PropTypes.func,
};

export default ModifyInteraction;
