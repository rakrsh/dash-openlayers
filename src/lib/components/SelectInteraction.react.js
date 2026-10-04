import { useEffect } from 'react';
import PropTypes from 'prop-types';
import GeoJSON from 'ol/format/GeoJSON';
import Select from 'ol/interaction/Select';
import { unByKey } from 'ol/Observable';
import { useMap } from '../context/OLContext';

/** Select vector features and report the current selection to Dash. */
const SelectInteraction = ({ id, layerId, setProps }) => {
  const map = useMap();

  useEffect(() => {
    const select = new Select({
      layers: layerId ? (layer) => layer.get('dashId') === layerId : undefined,
    });
    const listenerKey = select.on('select', () => {
      if (setProps) {
        const selectedGeoJSON = new GeoJSON().writeFeaturesObject(select.getFeatures().getArray(), {
          featureProjection: map.getView().getProjection(),
          dataProjection: 'EPSG:4326',
        });
        setProps({
          selectedGeoJSON,
          selectedFeature: selectedGeoJSON.features[0] ?? null,
        });
      }
    });
    map.addInteraction(select);

    return () => {
      unByKey(listenerKey);
      map.removeInteraction(select);
      select.getFeatures().clear();
    };
  }, [id, layerId, map, setProps]);

  return null;
};

SelectInteraction.defaultProps = {
  layerId: null,
};

SelectInteraction.propTypes = {
  /** The ID used to identify this component in Dash callbacks. */
  id: PropTypes.string,
  /** Dash ID of the vector layer to select from; omit to allow all selectable layers. */
  layerId: PropTypes.string,
  /** Read-only: current selection as a GeoJSON FeatureCollection in EPSG:4326. */
  selectedGeoJSON: PropTypes.object,
  /** Read-only: first selected GeoJSON Feature in EPSG:4326, or null when nothing is selected. */
  selectedFeature: PropTypes.object,
  /** Dash-supplied prop setter; internal, do not set from Python. */
  setProps: PropTypes.func,
};

export default SelectInteraction;
