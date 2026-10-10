import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import Tile from 'ol/layer/Tile';
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS';
import { useMap } from '../context/OLContext';
import { applyLayerProperties, useLayerProperties } from '../utils/layerProperties';

/** Render a WMTS layer using its service capabilities to configure the tile grid. */
const WMTSLayer = ({
  id,
  url,
  layer,
  matrixSet,
  projection,
  style,
  format,
  requestEncoding,
  dimensions,
  attributions,
  visible = true,
  opacity = 1,
  zIndex,
}) => {
  const map = useMap();
  const layerRef = useRef(null);
  const layerPropertiesRef = useLayerProperties(layerRef, visible, opacity, zIndex);

  useEffect(() => {
    if (!map || !url || !layer) return undefined;

    let disposed = false;
    let source = null;
    let tileLayer = null;
    const config = { layer };
    if (matrixSet) config.matrixSet = matrixSet;
    if (projection) config.projection = projection;
    if (style) config.style = style;
    if (format) config.format = format;
    if (requestEncoding) config.requestEncoding = requestEncoding;

    const loadLayer = async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`WMTS capabilities request failed: ${response.status}`);
      }
      const capabilities = new WMTSCapabilities().read(await response.text());
      const sourceOptions = optionsFromCapabilities(capabilities, config);
      if (!sourceOptions) {
        throw new Error(`WMTS layer "${layer}" was not found in capabilities`);
      }
      if (disposed) return;

      const mergedDimensions = dimensions
        ? { ...sourceOptions.dimensions, ...dimensions }
        : sourceOptions.dimensions;
      source = new WMTS({
        ...sourceOptions,
        dimensions: mergedDimensions,
        attributions: attributions ?? sourceOptions.attributions,
      });
      tileLayer = new Tile({ source });
      tileLayer.set('dashId', id);
      tileLayer.set('dashLayerControl', true);
      applyLayerProperties(tileLayer, layerPropertiesRef.current);
      layerRef.current = tileLayer;
      map.addLayer(tileLayer);
    };

    loadLayer().catch((error) => {
      if (!disposed) console.error('Failed to load WMTS layer', error);
    });

    return () => {
      disposed = true;
      if (tileLayer) map.removeLayer(tileLayer);
      if (source) source.clear();
      layerRef.current = null;
    };
  }, [
    attributions,
    dimensions,
    format,
    id,
    layerPropertiesRef,
    layer,
    map,
    matrixSet,
    projection,
    requestEncoding,
    style,
    url,
  ]);

  return null;
};

WMTSLayer.defaultProps = {
  url: null,
  layer: null,
  matrixSet: null,
  projection: null,
  style: null,
  format: null,
  requestEncoding: null,
  dimensions: null,
  attributions: null,
  visible: true,
  opacity: 1,
};

WMTSLayer.propTypes = {
  /** Component ID used to identify this layer in the Dash layout. */
  id: PropTypes.string,
  /** URL of the WMTS GetCapabilities document; the server must allow browser CORS access. */
  url: PropTypes.string,
  /** Layer identifier advertised by the WMTS capabilities. */
  layer: PropTypes.string,
  /** Tile matrix set identifier; inferred when the capabilities advertise a single set. */
  matrixSet: PropTypes.string,
  /** Projection code to select a compatible matrix set, such as EPSG:3857. */
  projection: PropTypes.string,
  /** Advertised WMTS style identifier. */
  style: PropTypes.string,
  /** Tile image format, such as image/png; defaults to the first advertised format. */
  format: PropTypes.string,
  /** WMTS request encoding, either KVP or REST. */
  requestEncoding: PropTypes.oneOf(['KVP', 'REST']),
  /** Values for advertised WMTS dimensions, such as TIME or ELEVATION. */
  dimensions: PropTypes.object,
  /** Attribution text or a list of attribution strings for the tile provider. */
  attributions: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  /** Whether this layer is rendered; updates the OpenLayers layer immediately. */
  visible: PropTypes.bool,
  /** Layer opacity from 0 (transparent) to 1 (opaque); updates immediately. */
  opacity: PropTypes.number,
  /** Integer stacking order; omitted values preserve OpenLayers layer ordering. */
  zIndex: PropTypes.number,
  /** Dash-supplied callback used to write component state back to the layout. */
  setProps: PropTypes.func,
};

export default WMTSLayer;
