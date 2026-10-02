import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { useMap } from '../context/OLContext';

/** Render GeoJSON features in a canvas-backed OpenLayers vector layer. */
const VectorLayerComponent = ({ id, geojson }) => {
  const map = useMap();
  const sourceRef = useRef(null);
  const formatRef = useRef(null);

  useEffect(() => {
    const source = new VectorSource();
    const layer = new VectorLayer({ source });
    const format = new GeoJSON();
    layer.set('dashId', id);
    sourceRef.current = source;
    formatRef.current = format;
    map.addLayer(layer);

    return () => {
      map.removeLayer(layer);
      source.clear();
      sourceRef.current = null;
      formatRef.current = null;
    };
  }, [id, map]);

  useEffect(() => {
    const source = sourceRef.current;
    const format = formatRef.current;
    if (!source || !format) return;

    source.clear();
    if (!geojson) return;

    const features = format.readFeatures(geojson, {
      dataProjection: 'EPSG:4326',
      featureProjection: map.getView().getProjection(),
    });
    source.addFeatures(features);
  }, [geojson, id, map]);

  return null;
};

VectorLayerComponent.defaultProps = {
  geojson: null,
};

VectorLayerComponent.propTypes = {
  /** Dash component ID; also used by ModifyInteraction to target this vector layer. */
  id: PropTypes.string,
  /** GeoJSON Feature or FeatureCollection with coordinates in [longitude, latitude] order; updates are rendered in the map projection. */
  geojson: PropTypes.object,
  /** Dash-supplied callback used to write component state back to the layout. */
  setProps: PropTypes.func,
};

export default VectorLayerComponent;
