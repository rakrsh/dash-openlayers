import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Tile from 'ol/layer/Tile';
import TileWMSSource from 'ol/source/TileWMS';
import { useMap } from '../context/OLContext';

/** Render a tiled OGC Web Map Service layer. */
const TileWMSLayer = ({ id, url, params, serverType }) => {
  const map = useMap();
  const sourceRef = useRef(null);
  const paramsRef = useRef(params);

  useEffect(() => {
    paramsRef.current = params;
    if (sourceRef.current) {
      sourceRef.current.updateParams(params);
    }
  }, [params]);

  useEffect(() => {
    if (!map || !url) return undefined;

    const source = new TileWMSSource({ url, params: paramsRef.current, serverType });
    const layer = new Tile({ source });
    layer.set('dashId', id);
    sourceRef.current = source;
    map.addLayer(layer);

    return () => {
      map.removeLayer(layer);
      sourceRef.current = null;
    };
  }, [id, map, serverType, url]);

  return null;
};

TileWMSLayer.defaultProps = {
  url: null,
  params: {},
  serverType: null,
};

TileWMSLayer.propTypes = {
  /** Component ID used to identify this layer in the Dash layout. */
  id: PropTypes.string,
  /** OGC WMS endpoint URL. */
  url: PropTypes.string,
  /** WMS request parameters, including LAYERS; changes refresh the source. */
  params: PropTypes.object,
  /** WMS server type used for vendor-specific HiDPI request parameters. */
  serverType: PropTypes.oneOf(['carmentaserver', 'geoserver', 'mapserver', 'qgis']),
  /** Dash-supplied callback used to write component state back to the layout. */
  setProps: PropTypes.func,
};

export default TileWMSLayer;
