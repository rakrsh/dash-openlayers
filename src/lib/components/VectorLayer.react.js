import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import { unByKey } from 'ol/Observable';
import Cluster from 'ol/source/Cluster';
import VectorSource from 'ol/source/Vector';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style, { toFunction } from 'ol/style/Style';
import Text from 'ol/style/Text';
import { useMap } from '../context/OLContext';
import { getEditHistory } from '../utils/editHistory';
import { readFeatures } from '../utils/featureFormats';
import { createVectorStyle } from '../utils/vectorStyle';

/** Render GeoJSON features in a canvas-backed OpenLayers vector layer. */
const VectorLayerComponent = ({
  id,
  data,
  geojson,
  wkt,
  url,
  format,
  dataProjection,
  style,
  hoverStyle,
  selectedStyle,
  clusterDistance = 0,
  clusterMinDistance = 0,
  declutter = false,
  setProps,
}) => {
  const map = useMap();
  const sourceRef = useRef(null);
  const layerRef = useRef(null);
  const clusterSourceRef = useRef(null);
  const setPropsRef = useRef(setProps);
  const hoveredFeatureRef = useRef(null);
  const selectedFeatureRef = useRef(null);

  useEffect(() => {
    setPropsRef.current = setProps;
  }, [setProps]);

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

    const getHitFeature = (pixel) => {
      let hitFeature = null;
      map.forEachFeatureAtPixel(
        pixel,
        (feature) => {
          hitFeature = feature.get('features')?.[0] ?? feature;
          return hitFeature;
        },
        { layerFilter: (candidate) => candidate === layer },
      );
      return hitFeature;
    };
    const serializeFeature = (feature) =>
      feature
        ? new GeoJSON().writeFeatureObject(feature, {
            featureProjection: map.getView().getProjection(),
            dataProjection: 'EPSG:4326',
          })
        : null;
    const clickKey = map.on('singleclick', (event) => {
      const feature = getHitFeature(event.pixel);
      selectedFeatureRef.current = feature;
      layer.changed();
      if (setPropsRef.current) {
        setPropsRef.current({ clickedFeature: serializeFeature(feature) });
      }
    });
    const pointerMoveKey = map.on('pointermove', (event) => {
      if (event.dragging) return;
      const feature = getHitFeature(event.pixel);
      if (feature === hoveredFeatureRef.current) return;
      hoveredFeatureRef.current = feature;
      layer.changed();
      if (setPropsRef.current) {
        setPropsRef.current({ hoveredFeature: serializeFeature(feature) });
      }
    });

    return () => {
      map.removeLayer(layer);
      unByKey([clickKey, pointerMoveKey]);
      hoveredFeatureRef.current = null;
      selectedFeatureRef.current = null;
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

    const baseStyle = createVectorStyle(style);
    const hover = createVectorStyle(hoverStyle);
    const selected = createVectorStyle(selectedStyle);
    layer.setStyle(baseStyle ?? undefined);
    if (hover || selected) {
      const baseStyleFunction = layer.getStyleFunction();
      const hoverStyleFunction =
        hover == null ? null : typeof hover === 'function' ? hover : toFunction(hover);
      const selectedStyleFunction =
        selected == null ? null : typeof selected === 'function' ? selected : toFunction(selected);
      const stateStyleFunction = (feature, resolution) => {
        const features = feature.get('features');
        const styledFeature = features?.length === 1 ? features[0] : feature;
        if (styledFeature === selectedFeatureRef.current && selectedStyleFunction) {
          return selectedStyleFunction(styledFeature, resolution);
        }
        if (styledFeature === hoveredFeatureRef.current && hoverStyleFunction) {
          return hoverStyleFunction(styledFeature, resolution);
        }
        return baseStyleFunction(styledFeature, resolution);
      };
      layer.setStyle(stateStyleFunction);
    }
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
  }, [clusterDistance, declutter, hoverStyle, id, map, selectedStyle, style]);

  useEffect(() => {
    const source = sourceRef.current;
    if (!source) return;

    source.clear();
    const useWKT = typeof wkt === 'string' && wkt.trim().length > 0;
    const featureData = useWKT ? wkt : (data ?? geojson);
    if (!featureData && !url) {
      if (setPropsRef.current) {
        setPropsRef.current({ featureCount: 0, loadError: null });
      }
      return undefined;
    }

    const readOptions = {
      featureProjection: map.getView().getProjection(),
    };
    if (dataProjection) {
      readOptions.dataProjection = dataProjection;
    } else if (useWKT) {
      readOptions.dataProjection = 'EPSG:4326';
    }

    const reportSuccess = (features) => {
      source.addFeatures(features);
      if (setPropsRef.current) {
        setPropsRef.current({ featureCount: features.length, loadError: null });
      }
    };
    const reportError = (error) => {
      source.clear();
      if (setPropsRef.current) {
        setPropsRef.current({
          featureCount: 0,
          loadError: error instanceof Error ? error.message : String(error),
        });
      }
    };

    if (featureData) {
      try {
        reportSuccess(
          readFeatures(featureData, {
            format: useWKT ? 'WKT' : format,
            ...readOptions,
          }),
        );
      } catch (error) {
        reportError(error);
      }
      return undefined;
    }

    const controller = new AbortController();
    const loadURL = async () => {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`Vector data request failed: ${response.status}`);
        const responseData = await response.text();
        if (controller.signal.aborted) return;
        reportSuccess(readFeatures(responseData, { format, ...readOptions }));
      } catch (error) {
        if (!controller.signal.aborted) reportError(error);
      }
    };
    loadURL();
    return () => controller.abort();
  }, [data, dataProjection, format, geojson, id, map, url, wkt]);

  return null;
};

VectorLayerComponent.defaultProps = {
  data: null,
  geojson: null,
  wkt: null,
  url: null,
  format: 'GeoJSON',
  dataProjection: null,
  style: null,
  hoverStyle: null,
  selectedStyle: null,
  clusterDistance: 0,
  clusterMinDistance: 0,
  declutter: false,
};

VectorLayerComponent.propTypes = {
  /** Dash component ID; also used by ModifyInteraction to target this vector layer. */
  id: PropTypes.string,
  /** GeoJSON Feature or FeatureCollection as an object or JSON string; embedded CRS metadata is honored, otherwise coordinates default to EPSG:4326. Takes precedence over `geojson`. */
  data: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  /** Backward-compatible GeoJSON Feature or FeatureCollection object alias for `data`. */
  geojson: PropTypes.object,
  /** WKT geometry string in [x, y] order; takes precedence over `data` and `geojson` when non-empty. */
  wkt: PropTypes.string,
  /** Remote URL for vector data; used when data, geojson, and wkt are not provided. */
  url: PropTypes.string,
  /** Data format for data or url: GeoJSON, TopoJSON, KML, or WKT. */
  format: PropTypes.oneOf(['GeoJSON', 'TopoJSON', 'KML', 'WKT']),
  /** Projection of input coordinates; defaults to EPSG:4326 unless GeoJSON embeds a CRS. */
  dataProjection: PropTypes.string,
  /** OpenLayers flat style or declarative dictionary with fillColor, strokeColor, strokeWidth, radius, opacity, marker, and property rules. */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Declarative style dictionary applied while a feature is under the pointer; supports the same fields as `style`. */
  hoverStyle: PropTypes.object,
  /** Declarative style dictionary applied to the feature most recently clicked; supports the same fields as `style`. */
  selectedStyle: PropTypes.object,
  /** Point clustering distance in screen pixels; set to 0 to disable clustering. */
  clusterDistance: PropTypes.number,
  /** Minimum distance in screen pixels between clusters; capped at clusterDistance. */
  clusterMinDistance: PropTypes.number,
  /** Enable label decluttering, or provide a shared group name to declutter with other layers. */
  declutter: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  /** Read-only: GeoJSON Feature under the pointer, with coordinates in EPSG:4326. */
  hoveredFeature: PropTypes.object,
  /** Read-only: GeoJSON Feature clicked on this layer, with coordinates in EPSG:4326. */
  clickedFeature: PropTypes.object,
  /** Read-only: number of features in the loaded source. */
  featureCount: PropTypes.number,
  /** Read-only: message from the last failed data load, or null after success. */
  loadError: PropTypes.string,
  /** Dash-supplied callback used to write component state back to the layout. */
  setProps: PropTypes.func,
};

export default VectorLayerComponent;
