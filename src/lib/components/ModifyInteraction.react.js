import { useEffect } from 'react';
import PropTypes from 'prop-types';
import GeoJSON from 'ol/format/GeoJSON';
import Modify from 'ol/interaction/Modify';
import VectorSource from 'ol/source/Vector';
import { unByKey } from 'ol/Observable';
import { useMap } from '../context/OLContext';

/** Allow editing vertices in a VectorLayer and report the updated features. */
const ModifyInteraction = ({ layerId, setProps }) => {
  const map = useMap();

  useEffect(() => {
    const layers = map.getLayers().getArray();
    const targetLayer = layers.find((layer) => {
      const source = layer.getSource?.();
      return source instanceof VectorSource && (!layerId || layer.get('dashId') === layerId);
    });
    const source = targetLayer?.getSource();
    if (!source) return;

    const format = new GeoJSON();
    const modify = new Modify({ source });
    map.addInteraction(modify);

    const listenerKey = modify.on('modifyend', () => {
      if (setProps) {
        setProps({
          modifiedGeoJSON: format.writeFeaturesObject(source.getFeatures(), {
            featureProjection: map.getView().getProjection(),
            dataProjection: 'EPSG:4326',
          }),
        });
      }
    });

    return () => {
      unByKey(listenerKey);
      map.removeInteraction(modify);
    };
  }, [layerId, map, setProps]);

  return null;
};

ModifyInteraction.defaultProps = {
  layerId: null,
};

ModifyInteraction.propTypes = {
  /** The ID used to identify this component in Dash callbacks. */
  id: PropTypes.string,
  /** Dash ID of the VectorLayer to modify; defaults to the first vector layer on the map. */
  layerId: PropTypes.string,
  /** Read-only: GeoJSON FeatureCollection of the target layer after a modify operation. */
  modifiedGeoJSON: PropTypes.object,
  /** Dash-supplied callback used to write component state back to the layout. */
  setProps: PropTypes.func,
};

export default ModifyInteraction;
