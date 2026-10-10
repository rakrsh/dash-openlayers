import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import MVT from 'ol/format/MVT';
import OpenLayersVectorTileLayer from 'ol/layer/VectorTile';
import { unByKey } from 'ol/Observable';
import VectorTileSource from 'ol/source/VectorTile';
import { stylefunction } from 'ol-mapbox-style';
import { useMap } from '../context/OLContext';
import { applyLayerProperties, useLayerProperties } from '../utils/layerProperties';

/** Render Mapbox Vector Tiles with OpenLayers flat styles or Mapbox GL styles. */
const VectorTileLayer = ({
  id,
  url,
  urls,
  projection,
  attributions,
  style,
  mapboxStyle,
  mapboxSource,
  visible = true,
  opacity = 1,
  zIndex,
  setProps,
}) => {
  const map = useMap();
  const layerRef = useRef(null);
  const layerPropertiesRef = useLayerProperties(layerRef, visible, opacity, zIndex);
  const setPropsRef = useRef(setProps);
  const hoveredFeatureRef = useRef(null);

  useEffect(() => {
    setPropsRef.current = setProps;
  }, [setProps]);

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
    layer.set('dashLayerControl', true);
    applyLayerProperties(layer, layerPropertiesRef.current);
    layerRef.current = layer;
    map.addLayer(layer);

    const getHitFeature = (pixel) => {
      let hitFeature = null;
      map.forEachFeatureAtPixel(
        pixel,
        (feature) => {
          hitFeature = feature;
          return true;
        },
        { layerFilter: (candidate) => candidate === layer },
      );
      return hitFeature;
    };
    const serializeFeature = (feature) => {
      if (!feature) return null;
      const properties = { ...feature.getProperties() };
      delete properties.geometry;
      const featureId = feature.getId();
      return featureId === undefined ? { properties } : { id: featureId, properties };
    };
    const clickKey = map.on('singleclick', (event) => {
      const feature = getHitFeature(event.pixel);
      if (setPropsRef.current) {
        setPropsRef.current({ clickedFeature: serializeFeature(feature) });
      }
    });
    const pointerMoveKey = map.on('pointermove', (event) => {
      if (event.dragging) return;
      const feature = getHitFeature(event.pixel);
      if (feature === hoveredFeatureRef.current) return;
      hoveredFeatureRef.current = feature;
      if (setPropsRef.current) {
        setPropsRef.current({ hoveredFeature: serializeFeature(feature) });
      }
    });

    return () => {
      map.removeLayer(layer);
      unByKey([clickKey, pointerMoveKey]);
      source.clear();
      hoveredFeatureRef.current = null;
      layerRef.current = null;
    };
  }, [attributions, id, layerPropertiesRef, map, projection, url, urls]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    if (mapboxStyle) {
      const sources = mapboxStyle.sources ?? {};
      const vectorSourceNames = Object.keys(sources).filter(
        (sourceName) => sources[sourceName]?.type === 'vector',
      );
      const sourceName =
        mapboxSource ?? (vectorSourceNames.length === 1 ? vectorSourceNames[0] : null);
      if (!sourceName || sources[sourceName]?.type !== 'vector') {
        throw new Error(
          'VectorTileLayer mapboxSource must name a vector source in mapboxStyle when the style does not contain exactly one vector source.',
        );
      }
      stylefunction(layer, mapboxStyle, sourceName);
    } else {
      layer.setStyle(style ?? undefined);
    }
  }, [attributions, id, map, mapboxSource, mapboxStyle, projection, style, url, urls]);

  return null;
};

VectorTileLayer.defaultProps = {
  url: null,
  urls: null,
  projection: 'EPSG:3857',
  attributions: null,
  style: null,
  mapboxStyle: null,
  mapboxSource: null,
  visible: true,
  opacity: 1,
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
  /** OpenLayers flat-style object used to style MVT features; ignored when mapboxStyle is provided. */
  style: PropTypes.object,
  /** Mapbox GL Style document used to style this layer's vector source. */
  mapboxStyle: PropTypes.object,
  /** Vector source key within mapboxStyle; inferred when that document contains one vector source. */
  mapboxSource: PropTypes.string,
  /** Whether this layer is rendered; updates the OpenLayers layer immediately. */
  visible: PropTypes.bool,
  /** Layer opacity from 0 (transparent) to 1 (opaque); updates immediately. */
  opacity: PropTypes.number,
  /** Integer stacking order; omitted values preserve OpenLayers layer ordering. */
  zIndex: PropTypes.number,
  /** Read-only: attributes of the vector-tile feature clicked on this layer, or null. */
  clickedFeature: PropTypes.object,
  /** Read-only: attributes of the vector-tile feature currently under the pointer, or null. */
  hoveredFeature: PropTypes.object,
  /** Dash-supplied callback used to write component state back to the layout. */
  setProps: PropTypes.func,
};

export default VectorTileLayer;
