import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Tile from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import { useMap } from '../context/OLContext';
import { applyLayerProperties, useLayerProperties } from '../utils/layerProperties';

const TileLayer = ({ id, source, url, visible = true, opacity = 1, zIndex }) => {
  const map = useMap();
  const layerRef = useRef(null);
  const layerPropertiesRef = useLayerProperties(layerRef, visible, opacity, zIndex);

  useEffect(() => {
    const tileSource = url ? new XYZ({ url }) : source === 'OSM' ? new OSM() : null;
    if (!tileSource) return;

    const tileLayer = new Tile({ source: tileSource });
    tileLayer.set('dashId', id);
    tileLayer.set('dashLayerControl', true);
    applyLayerProperties(tileLayer, layerPropertiesRef.current);
    layerRef.current = tileLayer;
    map.addLayer(tileLayer);

    return () => {
      map.removeLayer(tileLayer);
      layerRef.current = null;
    };
  }, [id, layerPropertiesRef, map, source, url]);

  return null;
};

TileLayer.defaultProps = {
  source: null,
  url: null,
  visible: true,
  opacity: 1,
};

TileLayer.propTypes = {
  /** The ID used to identify this component in Dash callbacks. */
  id: PropTypes.string,
  /** Built-in tile source identifier. Currently supports "OSM". */
  source: PropTypes.string,
  /** URL template for a custom XYZ tile source, e.g. "https://tiles.example.com/{z}/{x}/{y}.png". */
  url: PropTypes.string,
  /** Whether this layer is rendered; updates the OpenLayers layer immediately. */
  visible: PropTypes.bool,
  /** Layer opacity from 0 (transparent) to 1 (opaque); updates immediately. */
  opacity: PropTypes.number,
  /** Integer stacking order; omitted values preserve OpenLayers layer ordering. */
  zIndex: PropTypes.number,
  /** Dash-supplied callback used to write component state back to the layout. */
  setProps: PropTypes.func,
};

export default TileLayer;
