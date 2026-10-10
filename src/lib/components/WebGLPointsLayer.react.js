import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import WebGLPointsLayer from 'ol/layer/WebGLPoints';
import VectorSource from 'ol/source/Vector';
import { useMap } from '../context/OLContext';
import { readFeatures } from '../utils/featureFormats';
import { applyLayerProperties, useLayerProperties } from '../utils/layerProperties';

const DEFAULT_STYLE = {
  'circle-radius': 5,
  'circle-fill-color': '#3399cc',
};

/** Render large GeoJSON point datasets with the OpenLayers WebGL renderer. */
const WebGLPointsLayerComponent = ({
  id,
  data,
  style,
  disableHitDetection = false,
  visible = true,
  opacity = 1,
  zIndex,
}) => {
  const map = useMap();
  const sourceRef = useRef(null);
  const layerRef = useRef(null);
  const layerPropertiesRef = useLayerProperties(layerRef, visible, opacity, zIndex);

  useEffect(() => {
    if (!map) return undefined;

    const source = new VectorSource();
    sourceRef.current = source;

    return () => {
      source.clear();
      if (sourceRef.current === source) sourceRef.current = null;
    };
  }, [id, map]);

  useEffect(() => {
    const source = sourceRef.current;
    if (!map || !source) return undefined;

    const layer = new WebGLPointsLayer({
      source,
      style: style ?? DEFAULT_STYLE,
      disableHitDetection,
    });
    layer.set('dashId', id);
    layer.set('dashLayerControl', true);
    applyLayerProperties(layer, layerPropertiesRef.current);
    layerRef.current = layer;
    map.addLayer(layer);

    return () => {
      map.removeLayer(layer);
      layer.dispose();
      layerRef.current = null;
    };
  }, [disableHitDetection, id, layerPropertiesRef, map, style]);

  useEffect(() => {
    const source = sourceRef.current;
    if (!map || !source) return;

    source.clear();
    if (!data) return;

    const features = readFeatures(data, {
      featureProjection: map.getView().getProjection(),
    });
    source.addFeatures(features);
  }, [data, id, map]);

  return null;
};

WebGLPointsLayerComponent.defaultProps = {
  data: null,
  style: null,
  disableHitDetection: false,
  visible: true,
  opacity: 1,
};

WebGLPointsLayerComponent.propTypes = {
  /** Component ID used to identify this layer in the Dash layout. */
  id: PropTypes.string,
  /** GeoJSON Point or MultiPoint FeatureCollection as an object or JSON string; embedded CRS metadata is honored, otherwise coordinates default to EPSG:4326. */
  data: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  /** OpenLayers WebGL style object; expressions such as get, match, and interpolate style feature properties. Changing the style recreates the layer; the default style is blue circles. */
  style: PropTypes.object,
  /** Disable WebGL feature hit detection for a small rendering performance gain. */
  disableHitDetection: PropTypes.bool,
  /** Whether this layer is rendered; updates the OpenLayers layer immediately. */
  visible: PropTypes.bool,
  /** Layer opacity from 0 (transparent) to 1 (opaque); updates immediately. */
  opacity: PropTypes.number,
  /** Integer stacking order; omitted values preserve OpenLayers layer ordering. */
  zIndex: PropTypes.number,
  /** Dash-supplied callback used to write component state back to the layout. */
  setProps: PropTypes.func,
};

export default WebGLPointsLayerComponent;
