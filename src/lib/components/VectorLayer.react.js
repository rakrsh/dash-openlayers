import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { useMap } from '../context/OLContext';
import { getEditHistory } from '../utils/editHistory';
import { readFeatures } from '../utils/featureFormats';

/** Render GeoJSON features in a canvas-backed OpenLayers vector layer. */
const VectorLayerComponent = ({ id, geojson, wkt, style }) => {
  const map = useMap();
  const sourceRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    const source = new VectorSource();
    const layer = new VectorLayer({ source });
    layer.set('dashId', id);
    layer.set('dashLayerControl', true);
    layerRef.current = layer;
    sourceRef.current = source;
    map.addLayer(layer);

    return () => {
      map.removeLayer(layer);
      getEditHistory(map).removeSource(source);
      source.clear();
      layerRef.current = null;
      sourceRef.current = null;
    };
  }, [id, map]);

  useEffect(() => {
    const layer = layerRef.current;
    if (layer) {
      layer.setStyle(style ?? undefined);
    }
  }, [id, map, style]);

  useEffect(() => {
    const source = sourceRef.current;
    if (!source) return;

    source.clear();
    const useWKT = typeof wkt === 'string' && wkt.trim().length > 0;
    const data = useWKT ? wkt : geojson;
    if (!data) return;

    const features = readFeatures(data, {
      format: useWKT ? 'WKT' : 'GeoJSON',
      dataProjection: 'EPSG:4326',
      featureProjection: map.getView().getProjection(),
    });
    source.addFeatures(features);
  }, [geojson, id, map, wkt]);

  return null;
};

VectorLayerComponent.defaultProps = {
  geojson: null,
  wkt: null,
  style: null,
};

VectorLayerComponent.propTypes = {
  /** Dash component ID; also used by ModifyInteraction to target this vector layer. */
  id: PropTypes.string,
  /** GeoJSON Feature or FeatureCollection with coordinates in [longitude, latitude] order; updates are rendered in the map projection. */
  geojson: PropTypes.object,
  /** WKT geometry string in [x, y] order; takes precedence over `geojson` when non-empty. */
  wkt: PropTypes.string,
  /** OpenLayers flat style object or rule array; supports icon, fill, stroke, feature filters, and resolution expressions. */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Dash-supplied callback used to write component state back to the layout. */
  setProps: PropTypes.func,
};

export default VectorLayerComponent;
