import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat, toLonLat, transformExtent } from 'ol/proj';
import { unByKey } from 'ol/Observable';
import { OLContext } from '../context/OLContext';
import { registerProjections } from '../utils/projection';
import { getEditHistory } from '../utils/editHistory';

const DEFAULT_CENTER = [0, 0];

const getFeatureInfoAtPixel = (map, pixel) => {
  let featureInfo = null;
  map.forEachFeatureAtPixel(pixel, (feature) => {
    const hitFeature = feature.get('features')?.[0] ?? feature;
    featureInfo = { ...hitFeature.getProperties() };
    delete featureInfo.geometry;
    return true;
  });
  return featureInfo;
};

const MapComponent = ({
  id,
  children,
  center = DEFAULT_CENTER,
  zoom = 2,
  bounds = null,
  debounce = 300,
  projection = 'EPSG:3857',
  proj4Defs,
  style,
  undo,
  redo,
  setProps,
}) => {
  const mapElement = useRef(null);
  const undoCommandRef = useRef(undo);
  const redoCommandRef = useRef(redo);
  const setPropsRef = useRef(setProps);
  const debounceRef = useRef(debounce);
  const initialViewOptionsRef = useRef({ center, zoom, projection });
  const moveTimerRef = useRef(null);
  const lastReportedCenterRef = useRef(null);
  const previousBoundsRef = useRef(undefined);
  const [map, setMap] = useState(null);

  useEffect(() => {
    setPropsRef.current = setProps;
    debounceRef.current = debounce;
  }, [debounce, setProps]);

  useEffect(() => {
    registerProjections(proj4Defs);
  }, [proj4Defs]);

  useEffect(() => {
    if (!mapElement.current) return;

    const initialView = initialViewOptionsRef.current;
    const olMap = new Map({
      target: mapElement.current,
      view: new View({
        projection: initialView.projection,
        center: fromLonLat(initialView.center, initialView.projection),
        zoom: initialView.zoom,
      }),
    });

    const listenerKeys = [
      olMap.on('singleclick', (evt) => {
        if (setPropsRef.current) {
          const lonLat = toLonLat(evt.coordinate, olMap.getView().getProjection());
          setPropsRef.current({
            clickData: {
              lat: lonLat[1],
              lon: lonLat[0],
              pixelCoordinate: evt.pixel,
              featureInfo: getFeatureInfoAtPixel(olMap, evt.pixel),
            },
          });
        }
      }),
      olMap.on('dblclick', (evt) => {
        if (setPropsRef.current) {
          const lonLat = toLonLat(evt.coordinate, olMap.getView().getProjection());
          setPropsRef.current({
            doubleClickData: {
              lat: lonLat[1],
              lon: lonLat[0],
              pixelCoordinate: evt.pixel,
              featureInfo: getFeatureInfoAtPixel(olMap, evt.pixel),
            },
          });
        }
      }),
      olMap.on('pointermove', (evt) => {
        if (evt.dragging || !setPropsRef.current) return;

        const lonLat = toLonLat(evt.coordinate, olMap.getView().getProjection());
        setPropsRef.current({
          hoverData: {
            lat: lonLat[1],
            lon: lonLat[0],
            pixelCoordinate: evt.pixel,
            featureInfo: getFeatureInfoAtPixel(olMap, evt.pixel),
          },
        });
      }),
      olMap.on('moveend', () => {
        if (moveTimerRef.current !== null) clearTimeout(moveTimerRef.current);
        moveTimerRef.current = setTimeout(
          () => {
            moveTimerRef.current = null;
            if (!setPropsRef.current) return;

            const view = olMap.getView();
            const projection = view.getProjection();
            const centerLonLat = toLonLat(view.getCenter(), projection);
            lastReportedCenterRef.current = centerLonLat;
            const extent = transformExtent(
              view.calculateExtent(olMap.getSize()),
              projection,
              'EPSG:4326',
            );
            setPropsRef.current({
              center: centerLonLat,
              zoom: view.getZoom(),
              bbox: extent,
            });
          },
          Math.max(0, debounceRef.current),
        );
      }),
    ];

    setMap(olMap);

    return () => {
      unByKey(listenerKeys);
      if (moveTimerRef.current !== null) {
        clearTimeout(moveTimerRef.current);
        moveTimerRef.current = null;
      }
      olMap.setTarget(null);
    };
  }, []);

  useEffect(() => {
    if (!map) return;

    const view = map.getView();
    const currentCenter = view.getCenter();
    const projectedCenter = fromLonLat(center, projection);
    const lastReportedCenter = lastReportedCenterRef.current;
    const isReportedCenter =
      lastReportedCenter &&
      center[0] === lastReportedCenter[0] &&
      center[1] === lastReportedCenter[1];
    const centerChanged =
      !isReportedCenter &&
      center &&
      (!currentCenter ||
        currentCenter[0] !== projectedCenter[0] ||
        currentCenter[1] !== projectedCenter[1]);
    const zoomChanged = zoom !== undefined && zoom !== view.getZoom();
    const boundsChanged =
      bounds &&
      (previousBoundsRef.current === undefined ||
        !previousBoundsRef.current ||
        bounds.some((coordinate, index) => coordinate !== previousBoundsRef.current[index]));

    if (boundsChanged) {
      view.fit(transformExtent(bounds, 'EPSG:4326', projection), {
        duration: 300,
        size: map.getSize(),
      });
      lastReportedCenterRef.current = null;
    } else if (centerChanged || zoomChanged) {
      const animation = { duration: 300 };
      if (centerChanged) animation.center = projectedCenter;
      if (zoomChanged) animation.zoom = zoom;
      view.animate(animation);
      lastReportedCenterRef.current = null;
    }
    previousBoundsRef.current = bounds;
  }, [bounds, center, map, projection, zoom]);

  useEffect(() => {
    if (!map) return;

    const history = getEditHistory(map);
    return history.subscribe(({ canUndo, canRedo }) => {
      if (setProps) {
        setProps({ canUndo, canRedo });
      }
    });
  }, [map, setProps]);

  useEffect(() => {
    if (!map) return;

    const history = getEditHistory(map);
    if (undo !== undoCommandRef.current) history.undo();
    if (redo !== redoCommandRef.current) history.redo();
    undoCommandRef.current = undo;
    redoCommandRef.current = redo;
  }, [map, redo, undo]);

  return (
    <OLContext.Provider value={map}>
      <div id={id} ref={mapElement} style={style || { width: '100%', height: '500px' }}>
        {map ? children : null}
      </div>
    </OLContext.Provider>
  );
};

MapComponent.defaultProps = {
  center: [0, 0],
  zoom: 2,
  bounds: null,
  debounce: 300,
  projection: 'EPSG:3857',
  proj4Defs: [],
  undo: 0,
  redo: 0,
};

MapComponent.propTypes = {
  /** The ID used to identify this component in Dash callbacks. */
  id: PropTypes.string,
  /** OpenLayers layer/interaction components (e.g. TileLayer, DrawInteraction) rendered inside this map. */
  children: PropTypes.node,
  /**
   * Map view center as [longitude, latitude] in EPSG:4326. Bidirectional:
   * updated after debounced viewport movement and animated when set from Python.
   */
  center: PropTypes.arrayOf(PropTypes.number),
  /** Map zoom level. Bidirectional: updated after debounced viewport movement and animated from Python. */
  zoom: PropTypes.number,
  /** View extent as [minLongitude, minLatitude, maxLongitude, maxLatitude] in EPSG:4326; animated when set. */
  bounds: PropTypes.arrayOf(PropTypes.number),
  /** Debounce delay for viewport callback updates, in milliseconds. */
  debounce: PropTypes.number,
  /** EPSG code the view is rendered in, e.g. 'EPSG:3857' or a custom code registered via `proj4Defs`. */
  projection: PropTypes.string,
  /** Custom proj4 projection definitions to register before the view is constructed, e.g. [{ code: 'EPSG:27700', def: '+proj=tmerc ...' }]. */
  proj4Defs: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      def: PropTypes.string.isRequired,
    }),
  ),
  /** Inline CSS style object applied to the map container div. */
  style: PropTypes.object,
  /** Read-only: { lat, lon, pixelCoordinate: [x, y], featureInfo } from the last single click; featureInfo is null on background or the hit feature's GeoJSON properties. */
  clickData: PropTypes.object,
  /** Read-only: { lat, lon, pixelCoordinate: [x, y], featureInfo } from the last double click; featureInfo is null on background or the hit feature's GeoJSON properties. */
  doubleClickData: PropTypes.object,
  /** Read-only: { lat, lon, pixelCoordinate: [x, y], featureInfo } under the pointer; featureInfo is null on background or the hit feature's GeoJSON properties. */
  hoverData: PropTypes.object,
  /** Read-only: current visible extent as [minLongitude, minLatitude, maxLongitude, maxLatitude] in EPSG:4326. */
  bbox: PropTypes.arrayOf(PropTypes.number),
  /** Increment to undo the latest draw or modify operation on this map. */
  undo: PropTypes.number,
  /** Increment to redo the latest undone draw or modify operation on this map. */
  redo: PropTypes.number,
  /** Read-only: whether this map's edit history has an operation to undo. */
  canUndo: PropTypes.bool,
  /** Read-only: whether this map's edit history has an operation to redo. */
  canRedo: PropTypes.bool,
  /** Dash-supplied prop setter; internal, do not set from Python. */
  setProps: PropTypes.func,
};

export default MapComponent;
