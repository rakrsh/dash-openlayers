import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import VectorLayer from 'ol/layer/Vector';
import Cluster from 'ol/source/Cluster';
import VectorSource from 'ol/source/Vector';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import Text from 'ol/style/Text';
import { useMap } from '../context/OLContext';
import { getEditHistory } from '../utils/editHistory';
import { readFeatures } from '../utils/featureFormats';

/** Render GeoJSON features in a canvas-backed OpenLayers vector layer. */
const VectorLayerComponent = ({
  id,
  geojson,
  wkt,
  style,
  clusterDistance = 0,
  clusterMinDistance = 0,
  declutter = false,
}) => {
  const map = useMap();
  const sourceRef = useRef(null);
  const layerRef = useRef(null);
  const clusterSourceRef = useRef(null);

  useEffect(() => {
    const source = new VectorSource();
    sourceRef.current = source;

    return () => {
      getEditHistory(map).removeSource(source);
      source.clear();
      sourceRef.current = null;
    };
  }, [id, map]);

  useEffect(() => {
    const source = sourceRef.current;
    if (!source) return undefined;

    const layer = new VectorLayer({ source, declutter });
    layer.set('dashId', id);
    layer.set('dashLayerControl', true);
    layer.set('dashVectorSource', source);
    layerRef.current = layer;
    map.addLayer(layer);

    return () => {
      map.removeLayer(layer);
      layerRef.current = null;
      if (clusterSourceRef.current) {
        clusterSourceRef.current.setSource(null);
        clusterSourceRef.current = null;
      }
    };
  }, [declutter, id, map]);

  useEffect(() => {
    const source = sourceRef.current;
    const layer = layerRef.current;
    if (!source || !layer) return () => {};

    if (clusterDistance <= 0) {
      return () => {};
    }

    const clusterSource = new Cluster({
      source,
      distance: clusterDistance,
      minDistance: Math.max(0, clusterMinDistance),
    });
    clusterSourceRef.current = clusterSource;
    layer.setSource(clusterSource);

    return () => {
      layer.setSource(source);
      clusterSource.setSource(null);
      if (clusterSourceRef.current === clusterSource) clusterSourceRef.current = null;
    };
  }, [clusterDistance, clusterMinDistance, declutter, id, map]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return () => {};

    layer.setStyle(style ?? undefined);
    if (clusterDistance > 0) {
      const baseStyleFunction = layer.getStyleFunction();
      const clusterStyles = new Map();
      layer.setStyle((clusterFeature, resolution) => {
        const features = clusterFeature.get('features');
        if (!features) return baseStyleFunction(clusterFeature, resolution);
        if (features.length === 1) return baseStyleFunction(features[0], resolution);

        const count = features.length;
        if (!clusterStyles.has(count)) {
          clusterStyles.set(
            count,
            new Style({
              image: new CircleStyle({
                radius: 10 + Math.min(10, Math.log2(count)),
                fill: new Fill({ color: '#1d6a7a' }),
                stroke: new Stroke({ color: '#ffffff', width: 2 }),
              }),
              text: new Text({
                text: String(count),
                fill: new Fill({ color: '#ffffff' }),
              }),
            }),
          );
        }
        return clusterStyles.get(count);
      });
    }

    return () => layer.setStyle(style ?? undefined);
  }, [clusterDistance, declutter, id, map, style]);

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
  clusterDistance: 0,
  clusterMinDistance: 0,
  declutter: false,
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
  /** Point clustering distance in screen pixels; set to 0 to disable clustering. */
  clusterDistance: PropTypes.number,
  /** Minimum distance in screen pixels between clusters; capped at clusterDistance. */
  clusterMinDistance: PropTypes.number,
  /** Enable label decluttering, or provide a shared group name to declutter with other layers. */
  declutter: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  /** Dash-supplied callback used to write component state back to the layout. */
  setProps: PropTypes.func,
};

export default VectorLayerComponent;
