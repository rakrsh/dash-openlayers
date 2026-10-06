import GeoJSON from 'ol/format/GeoJSON';
import KML from 'ol/format/KML';
import TopoJSON from 'ol/format/TopoJSON';
import WKT from 'ol/format/WKT';
import { topology } from 'topojson-server';

const TOPOJSON_QUANTIZATION = 1e5;

export const readFeatures = (data, { format = 'GeoJSON', ...options } = {}) => {
  const formats = {
    GeoJSON,
    KML,
    TopoJSON,
    WKT,
  };
  const FeatureFormat = formats[format];
  if (FeatureFormat) return new FeatureFormat().readFeatures(data, options);
  throw new Error(`Unsupported feature format: ${format}`);
};

export const exportFeature = (feature, options = {}) => {
  const geojsonFormat = new GeoJSON();
  const wktFormat = new WKT();
  const geojson = geojsonFormat.writeFeatureObject(feature, options);
  const featureCollection = { type: 'FeatureCollection', features: [geojson] };
  return {
    geojson,
    wkt: wktFormat.writeFeature(feature, options),
    topojson: topology({ features: featureCollection }, TOPOJSON_QUANTIZATION),
  };
};

export const exportFeatures = (features, options = {}) => {
  const geojsonFormat = new GeoJSON();
  const wktFormat = new WKT();
  const geojson = geojsonFormat.writeFeaturesObject(features, options);
  return {
    geojson,
    wkt: wktFormat.writeFeatures(features, options),
    topojson: topology({ features: geojson }, TOPOJSON_QUANTIZATION),
  };
};
