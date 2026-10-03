import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import MVT from 'ol/format/MVT';
import OpenLayersVectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import { useMap } from '../context/OLContext';

/** Render Mapbox Vector Tiles from an MVT endpoint with an OpenLayers flat style. */
const VectorTileLayer = ({ id, url, urls, projection, attributions, style }) => {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map || (!url && (!urls || urls.length === 0))) return undefined;

    const sourceOptions = {
      format: new MVT(),
      projection,
      attributions,
    };
    if (urls && urls.length > 0) {
      sourceOptions.urls = urls;
    } else {
      sourceOptions.url = url;
    }

    const source = new VectorTileSource(sourceOptions);
    const layer = new OpenLayersVectorTileLayer({ source });
    layer.set('dashId', id);
    layerRef.current = layer;
    map.addLayer(layer);

    return () => {
      map.removeLayer(layer);
      source.clear();
      layerRef.current = null;
    };
  }, [attributions, id, map, projection, url, urls]);

  useEffect(() => {
    if (layerRef.current) {
      layerRef.current.setStyle(style ?? undefined);
    }
  }, [style]);

  return null;
};

VectorTileLayer.defaultProps = {
  url: null,
  urls: null,
  projection: 'EPSG:3857',
  attributions: null,
  style: null,
};

VectorTileLayer.propTypes = {
  /** Component ID used to identify this layer in the Dash layout. */
  id: PropTypes.string,
  /** MVT URL template containing {z}, {x}, and {y} or {-y}; ignored when urls is provided. */
  url: PropTypes.string,
  /** Alternative MVT URL templates for load balancing; takes precedence over url. */
  urls: PropTypes.arrayOf(PropTypes.string),
  /** Projection of the vector tile grid; use the CRS served by the tile endpoint. */
  projection: PropTypes.string,
  /** Attribution text or a list of attribution strings for the tile provider. */
  attributions: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  /** OpenLayers flat-style object used to style MVT features. */
  style: PropTypes.object,
  /** Dash-supplied callback used to write component state back to the layout. */
  setProps: PropTypes.func,
};

export default VectorTileLayer;
