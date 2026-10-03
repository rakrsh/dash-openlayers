import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { useMap } from '../context/OLContext';

const EMPTY_PARAMS = {};

/** Load WFS GeoJSON features into an editable vector layer. */
const WFSLayer = ({
  id,
  url = null,
  typeNames = null,
  version = '2.0.0',
  srsName = 'EPSG:4326',
  outputFormat = 'application/json',
  params = EMPTY_PARAMS,
  setProps,
}) => {
  const map = useMap();
  const setPropsRef = useRef(setProps);

  useEffect(() => {
    setPropsRef.current = setProps;
  }, [setProps]);

  useEffect(() => {
    if (!url || !typeNames) return undefined;

    const source = new VectorSource();
    const layer = new VectorLayer({ source });
    layer.set('dashId', id);
    layer.set('dashLayerControl', true);
    layer.set('dashVectorSource', source);
    map.addLayer(layer);

    const controller = new AbortController();
    const requestURL = new URL(url, document.baseURI);
    Object.entries(params ?? {}).forEach(([name, value]) => {
      if (value === null || value === undefined) return;
      if (Array.isArray(value)) {
        value.forEach((entry) => requestURL.searchParams.append(name, String(entry)));
      } else {
        requestURL.searchParams.set(name, String(value));
      }
    });

    requestURL.searchParams.set('service', 'WFS');
    requestURL.searchParams.set('version', version);
    requestURL.searchParams.set('request', 'GetFeature');
    requestURL.searchParams.set(version.startsWith('2.') ? 'typeNames' : 'typeName', typeNames);
    requestURL.searchParams.set('outputFormat', outputFormat);
    requestURL.searchParams.set('srsName', srsName);

    fetch(requestURL.toString(), {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`WFS GetFeature failed: ${response.status}`);
        return response.json();
      })
      .then((featureCollection) => {
        if (controller.signal.aborted) return;
        const features = new GeoJSON().readFeatures(featureCollection, {
          dataProjection: srsName,
          featureProjection: map.getView().getProjection(),
        });
        source.addFeatures(features);
        if (setPropsRef.current) {
          setPropsRef.current({ featureCount: features.length, loadError: null });
        }
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        if (setPropsRef.current) {
          setPropsRef.current({ featureCount: 0, loadError: error.message });
        }
      });

    return () => {
      controller.abort();
      map.removeLayer(layer);
      source.clear();
    };
  }, [id, map, outputFormat, params, srsName, typeNames, url, version]);

  return null;
};

WFSLayer.defaultProps = {
  url: null,
  typeNames: null,
  version: '2.0.0',
  srsName: 'EPSG:4326',
  outputFormat: 'application/json',
  params: {},
};

WFSLayer.propTypes = {
  /** The ID used to identify this component and layer in Dash callbacks. */
  id: PropTypes.string,
  /** WFS endpoint URL; the service must allow browser CORS access. */
  url: PropTypes.string,
  /** WFS feature type name (sent as typeNames for 2.x, typeName for 1.x). */
  typeNames: PropTypes.string,
  /** WFS protocol version. */
  version: PropTypes.string,
  /** Coordinate reference system requested from the service and used to parse response coordinates. */
  srsName: PropTypes.string,
  /** WFS response format; the component currently parses GeoJSON responses. */
  outputFormat: PropTypes.string,
  /** Additional GetFeature query parameters, such as count, bbox, or CQL_FILTER. */
  params: PropTypes.object,
  /** Read-only: number of features loaded by the last successful request. */
  featureCount: PropTypes.number,
  /** Read-only: message from the last failed request, or null after success. */
  loadError: PropTypes.string,
  /** Dash-supplied prop setter; internal, do not set from Python. */
  setProps: PropTypes.func,
};

export default WFSLayer;
