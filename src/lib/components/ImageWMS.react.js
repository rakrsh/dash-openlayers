import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ImageLayer from 'ol/layer/Image';
import ImageWMSSource from 'ol/source/ImageWMS';
import { useMap } from '../context/OLContext';

/** Render a single-image OGC Web Map Service layer. */
const ImageWMSLayer = ({ id, url, params, serverType }) => {
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

    const source = new ImageWMSSource({ url, params: paramsRef.current, serverType });
    const layer = new ImageLayer({ source });
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

ImageWMSLayer.defaultProps = {
  url: null,
  params: {},
  serverType: null,
};

ImageWMSLayer.propTypes = {
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

export default ImageWMSLayer;
