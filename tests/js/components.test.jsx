import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import MapComponent from '../../src/lib/components/Map.react';
import DrawControl from '../../src/lib/components/DrawControl.react';
import MeasureControl from '../../src/lib/components/MeasureControl.react';
import TileLayer from '../../src/lib/components/TileLayer.react';
import VectorLayer from '../../src/lib/components/VectorLayer.react';
import VectorTileLayer from '../../src/lib/components/VectorTileLayer.react';
import WebGLPointsLayerComponent from '../../src/lib/components/WebGLPointsLayer.react';
import WMTSLayer from '../../src/lib/components/WMTSLayer.react';
import TileWMSLayer from '../../src/lib/components/TileWMS.react';
import ImageWMSLayer from '../../src/lib/components/ImageWMS.react';
import DrawInteraction from '../../src/lib/components/DrawInteraction.react';
import ModifyInteraction from '../../src/lib/components/ModifyInteraction.react';
import Popup from '../../src/lib/components/Popup.react';
import SelectInteraction from '../../src/lib/components/SelectInteraction.react';
import WFSLayer from '../../src/lib/components/WFSLayer.react';
import { OLContext, useMap } from '../../src/lib/context/OLContext';
import { getEditHistory } from '../../src/lib/utils/editHistory';
import { exportFeature, exportFeatures, readFeatures } from '../../src/lib/utils/featureFormats';
import { applyLayerProperties } from '../../src/lib/utils/layerProperties';
import { createVectorStyle } from '../../src/lib/utils/vectorStyle';
import Snap from 'ol/interaction/Snap';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import View from 'ol/View';
import { fromLonLat, toLonLat, transformExtent } from 'ol/proj';
import { registerProjections } from '../../src/lib/utils/projection';
import Draw, { createBox } from 'ol/interaction/Draw';
import { fromCircle } from 'ol/geom/Polygon';
import { getArea, getLength } from 'ol/sphere';
import Modify from 'ol/interaction/Modify';
import Select from 'ol/interaction/Select';
import { unByKey } from 'ol/Observable';
import Tile from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON';
import KML from 'ol/format/KML';
import TopoJSON from 'ol/format/TopoJSON';
import WKT from 'ol/format/WKT';
import Cluster from 'ol/source/Cluster';
import OpenLayersVectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import MVT from 'ol/format/MVT';
import OpenLayersVectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import { stylefunction } from 'ol-mapbox-style';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS';
import ImageLayer from 'ol/layer/Image';
import TileWMSSource from 'ol/source/TileWMS';
import ImageWMSSource from 'ol/source/ImageWMS';
import OpenLayersWebGLPointsLayer from 'ol/layer/WebGLPoints';

jest.mock('ol/source/Cluster', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockCluster(options) {
    this.options = options;
    this.setSource = jest.fn();
    this.setDistance = jest.fn();
    this.setMinDistance = jest.fn();
  }),
}));

jest.mock('ol/Map', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockMap(options) {
    this.options = options;
    this.listeners = {};
    this.hitFeature = null;
    this.on = jest.fn((event, listener) => {
      this.listeners[event] = listener;
      return { event, listener };
    });
    this.forEachFeatureAtPixel = jest.fn(function forEachFeatureAtPixel(pixel, callback) {
      if (this.hitFeature) callback(this.hitFeature);
    });
    this.setTarget = jest.fn();
    this.addLayer = jest.fn();
    this.removeLayer = jest.fn();
    this.addOverlay = jest.fn();
    this.removeOverlay = jest.fn();
    this.addControl = jest.fn();
    this.removeControl = jest.fn();
    this.getView = jest.fn(() => options.view);
    this.getSize = jest.fn(() => [800, 600]);
  }),
}));

jest.mock('ol/control/Control', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockControl(options) {
    this.element = options.element;
  }),
}));

jest.mock('ol/Overlay', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockOverlay(options) {
    this.options = options;
    this.setOffset = jest.fn();
    this.setPosition = jest.fn();
    this.setPositioning = jest.fn();
  }),
}));

jest.mock('ol/View', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockView(options) {
    this.center = options.center;
    this.zoom = options.zoom;
    this.projection = options.projection;
    this.getCenter = jest.fn(() => this.center);
    this.getProjection = jest.fn(() => this.projection);
    this.setCenter = jest.fn((center) => {
      this.center = center;
    });
    this.getZoom = jest.fn(() => this.zoom);
    this.setZoom = jest.fn((zoom) => {
      this.zoom = zoom;
    });
    this.animate = jest.fn((options) => {
      if (options.center) this.center = options.center;
      if (options.zoom !== undefined) this.zoom = options.zoom;
    });
    this.fit = jest.fn();
    this.calculateExtent = jest.fn(() => [-10, -5, 10, 5]);
  }),
}));

jest.mock('ol/proj', () => ({
  fromLonLat: jest.fn((coordinate) => coordinate),
  toLonLat: jest.fn((coordinate) => [coordinate[0] + 1, coordinate[1] + 2]),
  transformExtent: jest.fn((extent) => extent),
}));

jest.mock('../../src/lib/utils/projection', () => ({
  registerProjections: jest.fn(),
}));

jest.mock('ol/layer/Tile', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockTile(options) {
    this.options = options;
    this.set = jest.fn();
    this.setVisible = jest.fn();
    this.setOpacity = jest.fn();
    this.setZIndex = jest.fn();
  }),
}));

jest.mock('ol/layer/Image', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockImageLayer(options) {
    this.options = options;
    this.set = jest.fn();
    this.setVisible = jest.fn();
    this.setOpacity = jest.fn();
    this.setZIndex = jest.fn();
  }),
}));

jest.mock('ol/source/TileWMS', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockTileWMSSource(options) {
    this.options = options;
    this.updateParams = jest.fn();
  }),
}));

jest.mock('ol/source/ImageWMS', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockImageWMSSource(options) {
    this.options = options;
    this.updateParams = jest.fn();
  }),
}));

jest.mock('ol/source/OSM', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockOSM() {}),
}));

jest.mock('ol/source/XYZ', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockXYZ(options) {
    this.options = options;
  }),
}));

jest.mock('ol/format/GeoJSON', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockGeoJSON() {
    this.features = [{ id: 'feature' }];
    this.readFeatures = jest.fn(() => this.features);
    this.writeFeatureObject = jest.fn(() => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [10, 45] },
      properties: {},
    }));
    this.writeFeaturesObject = jest.fn((features) => ({
      type: 'FeatureCollection',
      features: features.map((feature) => feature.geoJSON).filter(Boolean),
    }));
  }),
}));

jest.mock('ol/format/WKT', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockWKT() {
    this.readFeatures = jest.fn(() => [{ id: 'wkt-feature' }]);
    this.writeFeature = jest.fn(() => 'POINT (10 45)');
    this.writeFeatures = jest.fn(() => 'GEOMETRYCOLLECTION EMPTY');
  }),
}));

jest.mock('ol/format/TopoJSON', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockTopoJSON() {
    this.readFeatures = jest.fn(() => [{ id: 'topojson-feature' }]);
  }),
}));

jest.mock('ol/format/KML', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockKML() {
    this.readFeatures = jest.fn(() => [{ id: 'kml-feature' }]);
  }),
}));

jest.mock('ol/interaction/Draw', () => ({
  __esModule: true,
  createBox: jest.fn(() => jest.fn()),
  default: jest.fn().mockImplementation(function MockDraw(options) {
    this.options = options;
    this.listeners = {};
    this.on = jest.fn((event, listener) => {
      const listenerKey = { event, listener };
      this.listeners[event] = listener;
      return listenerKey;
    });
  }),
}));

jest.mock('ol/geom/Polygon', () => ({
  fromCircle: jest.fn(),
}));

jest.mock('ol/sphere', () => ({
  getArea: jest.fn(() => 25000),
  getLength: jest.fn(() => 1500),
}));

jest.mock('ol/interaction/Modify', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockModify(options) {
    this.options = options;
    this.listeners = {};
    this.on = jest.fn((event, listener) => {
      const listenerKey = { event, listener };
      this.listeners[event] = listener;
      return listenerKey;
    });
  }),
}));

jest.mock('ol/interaction/Select', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockSelect(options) {
    this.options = options;
    this.listeners = {};
    this.selectedFeatures = {
      items: [],
      getArray: jest.fn(() => this.selectedFeatures.items),
      clear: jest.fn(() => {
        this.selectedFeatures.items = [];
      }),
    };
    this.on = jest.fn((event, listener) => {
      const listenerKey = { event, listener };
      this.listeners[event] = listener;
      return listenerKey;
    });
    this.getFeatures = jest.fn(() => this.selectedFeatures);
  }),
}));

jest.mock('ol/interaction/Snap', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockSnap(options) {
    this.options = options;
  }),
}));

jest.mock('ol/Collection', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockCollection(items = []) {
    this.items = [...items];
    this.push = jest.fn((item) => this.items.push(item));
    this.remove = jest.fn((item) => {
      this.items = this.items.filter((existing) => existing !== item);
    });
    this.getArray = jest.fn(() => this.items);
  }),
}));

jest.mock('ol/Observable', () => ({
  unByKey: jest.fn(),
}));

jest.mock('ol/layer/Vector', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockVectorLayer(options) {
    this.options = options;
    this.properties = {};
    this.changed = jest.fn();
    this.set = jest.fn((key, value) => {
      this.properties[key] = value;
    });
    this.setVisible = jest.fn();
    this.setOpacity = jest.fn();
    this.setZIndex = jest.fn();
    this.get = jest.fn((key) => this.properties[key]);
    this.setSource = jest.fn();
    this.styleFunction = jest.fn(() => [{ name: 'base-style' }]);
    this.getStyleFunction = jest.fn(() => this.styleFunction);
    this.setStyle = jest.fn((style) => {
      if (typeof style === 'function') this.styleFunction = style;
    });
  }),
}));

jest.mock('ol/layer/WebGLPoints', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockWebGLPointsLayer(options) {
    this.options = options;
    this.set = jest.fn();
    this.setVisible = jest.fn();
    this.setOpacity = jest.fn();
    this.setZIndex = jest.fn();
    this.dispose = jest.fn();
  }),
}));

jest.mock('ol/style/Circle', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockCircleStyle(options) {
    this.options = options;
  }),
}));

jest.mock('ol/style/Icon', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockIcon(options) {
    this.options = options;
  }),
}));

jest.mock('ol/color', () => ({
  asArray: jest.fn((color) => {
    if (Array.isArray(color)) return color;
    const hex = color.match(/^#([0-9a-f]{6})$/i);
    if (hex) {
      return [
        parseInt(hex[1].slice(0, 2), 16),
        parseInt(hex[1].slice(2, 4), 16),
        parseInt(hex[1].slice(4, 6), 16),
        1,
      ];
    }
    return [0, 0, 0, 1];
  }),
}));

jest.mock('ol/style/Fill', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockFill(options) {
    this.options = options;
  }),
}));

jest.mock('ol/style/Stroke', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockStroke(options) {
    this.options = options;
  }),
}));

jest.mock('ol/style/Style', () => ({
  __esModule: true,
  toFunction: jest.fn((style) => (typeof style === 'function' ? style : () => [style])),
  default: jest.fn().mockImplementation(function MockStyle(options) {
    this.options = options;
  }),
}));

jest.mock('ol/style/Text', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockText(options) {
    this.options = options;
  }),
}));

jest.mock('ol/source/Vector', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockVectorSource() {
    this.features = [];
    this.clear = jest.fn();
    this.addFeatures = jest.fn();
    this.addFeature = jest.fn((feature) => this.features.push(feature));
    this.removeFeature = jest.fn(
      (feature) => (this.features = this.features.filter((candidate) => candidate !== feature)),
    );
    this.getFeatures = jest.fn(() => this.features);
    this.on = jest.fn((type, listener) => ({ type, listener }));
  }),
}));

jest.mock('ol/format/MVT', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockMVT(options) {
    this.options = options;
  }),
}));

jest.mock('ol/layer/VectorTile', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockVectorTileLayer(options) {
    this.options = options;
    this.set = jest.fn();
    this.setVisible = jest.fn();
    this.setOpacity = jest.fn();
    this.setZIndex = jest.fn();
    this.setStyle = jest.fn();
  }),
}));

jest.mock('ol-mapbox-style', () => ({
  stylefunction: jest.fn(),
}));

jest.mock('ol/source/VectorTile', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockVectorTileSource(options) {
    this.options = options;
    this.clear = jest.fn();
  }),
}));

jest.mock('ol/format/WMTSCapabilities', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockWMTSCapabilities() {
    this.read = jest.fn(() => ({ contents: true }));
  }),
}));

jest.mock('ol/source/WMTS', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockWMTS(options) {
    this.options = options;
    this.clear = jest.fn();
  }),
  optionsFromCapabilities: jest.fn(),
}));

const originalFetch = global.fetch;

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
  jest.useRealTimers();
  if (originalFetch === undefined) {
    delete global.fetch;
  } else {
    global.fetch = originalFetch;
  }
});

describe('feature format helpers', () => {
  it('imports WKT and exports feature and collection formats', () => {
    const feature = { id: 'feature' };
    const options = { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' };
    const exportedFeature = exportFeature(feature, options);

    expect(exportedFeature.geojson.type).toBe('Feature');
    expect(exportedFeature.wkt).toBe('POINT (10 45)');
    expect(exportedFeature.topojson.type).toBe('Topology');
    expect(WKT.mock.instances.at(-1).writeFeature).toHaveBeenCalledWith(feature, options);

    const features = [{ id: 'feature-a' }, { id: 'feature-b' }];
    const exportedFeatures = exportFeatures(features, options);
    expect(exportedFeatures.geojson.type).toBe('FeatureCollection');
    expect(exportedFeatures.wkt).toBe('GEOMETRYCOLLECTION EMPTY');
    expect(exportedFeatures.topojson.type).toBe('Topology');
    expect(WKT.mock.instances.at(-1).writeFeatures).toHaveBeenCalledWith(features, options);

    readFeatures('POINT (10 45)', { format: 'WKT', ...options });
    expect(WKT.mock.instances.at(-1).readFeatures).toHaveBeenCalledWith('POINT (10 45)', options);

    readFeatures('{"type":"Topology"}', { format: 'TopoJSON', ...options });
    expect(TopoJSON.mock.instances.at(-1).readFeatures).toHaveBeenCalledWith(
      '{"type":"Topology"}',
      options,
    );
    readFeatures('<kml />', { format: 'KML', ...options });
    expect(KML.mock.instances.at(-1).readFeatures).toHaveBeenCalledWith('<kml />', options);
  });

  it('rejects unsupported input formats', () => {
    expect(() => readFeatures('{}', { format: 'Shapefile' })).toThrow(
      'Unsupported feature format: Shapefile',
    );
  });
});

describe('layer property helpers', () => {
  it('rejects invalid opacity and non-integer z-index values', () => {
    const layer = {
      setVisible: jest.fn(),
      setOpacity: jest.fn(),
      setZIndex: jest.fn(),
    };

    expect(() => applyLayerProperties(layer, { visible: true, opacity: 1.1 })).toThrow(
      'Layer opacity must be a finite number between 0 and 1.',
    );
    expect(() => applyLayerProperties(layer, { visible: true, opacity: 0.5, zIndex: 1.5 })).toThrow(
      'Layer zIndex must be an integer.',
    );
    expect(layer.setVisible).toHaveBeenCalledWith(true);
    expect(layer.setOpacity).toHaveBeenCalledWith(0.5);
    expect(layer.setZIndex).not.toHaveBeenCalled();
  });
});

const makeMap = () => ({
  listeners: {},
  hitFeature: null,
  on: jest.fn(function on(event, listener) {
    this.listeners[event] = listener;
    return { event, listener };
  }),
  forEachFeatureAtPixel: jest.fn(function forEachFeatureAtPixel(pixel, callback) {
    if (this.hitFeature) callback(this.hitFeature);
  }),
  addLayer: jest.fn(),
  removeLayer: jest.fn(),
  addOverlay: jest.fn(),
  removeOverlay: jest.fn(),
  addControl: jest.fn(),
  removeControl: jest.fn(),
  addInteraction: jest.fn(),
  removeInteraction: jest.fn(),
  getLayers: jest.fn(() => ({ getArray: () => [] })),
  getView: jest.fn(() => ({ getProjection: () => 'EPSG:3857' })),
});

const MapConsumer = () => {
  const map = useMap();
  return <span>{map ? 'map available' : 'map missing'}</span>;
};

describe('Map', () => {
  it('creates a view and map, exposes the map to children, and clears its target on unmount', () => {
    const { unmount } = render(
      <MapComponent id="map" center={[1, 2]} zoom={3} projection="EPSG:4326">
        <MapConsumer />
      </MapComponent>,
    );

    expect(screen.getByText('map available')).toBeInTheDocument();
    expect(View).toHaveBeenCalledWith({ projection: 'EPSG:4326', center: [1, 2], zoom: 3 });
    expect(Map).toHaveBeenCalledWith(
      expect.objectContaining({ target: expect.any(HTMLDivElement), view: View.mock.instances[0] }),
    );
    expect(registerProjections).toHaveBeenCalledWith(undefined);

    const map = Map.mock.instances[0];
    unmount();
    expect(map.setTarget).toHaveBeenCalledWith(null);
  });

  it('animates center and zoom prop changes and reports debounced geographic viewport state', () => {
    jest.useFakeTimers();
    const setProps = jest.fn();
    const { rerender } = render(
      <MapComponent id="map" center={[0, 0]} zoom={2} debounce={300} setProps={setProps} />,
    );
    const map = Map.mock.instances[0];
    const view = View.mock.instances[0];
    setProps.mockClear();

    rerender(
      <MapComponent id="map" center={[10, 20]} zoom={4} debounce={300} setProps={setProps} />,
    );
    expect(view.animate).toHaveBeenCalledWith({ duration: 300, center: [10, 20], zoom: 4 });

    map.listeners.moveend();
    expect(setProps).not.toHaveBeenCalled();
    jest.advanceTimersByTime(299);
    expect(setProps).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(setProps).toHaveBeenCalledWith({
      center: [11, 22],
      zoom: 4,
      bbox: [-10, -5, 10, 5],
    });
    expect(transformExtent).toHaveBeenCalledWith([-10, -5, 10, 5], 'EPSG:3857', 'EPSG:4326');
  });

  it('debounces repeated viewport events and animates geographic bounds from Dash', () => {
    jest.useFakeTimers();
    const setProps = jest.fn();
    const { rerender } = render(
      <MapComponent id="map" center={[0, 0]} zoom={2} debounce={500} setProps={setProps} />,
    );
    const map = Map.mock.instances[0];
    const view = View.mock.instances[0];
    setProps.mockClear();

    map.listeners.moveend();
    jest.advanceTimersByTime(300);
    map.listeners.moveend();
    jest.advanceTimersByTime(300);
    expect(setProps).not.toHaveBeenCalledWith(expect.objectContaining({ bbox: expect.any(Array) }));
    jest.advanceTimersByTime(200);
    expect(setProps).toHaveBeenCalledTimes(1);

    const bounds = [-2, 48, 2, 52];
    rerender(
      <MapComponent
        id="map"
        center={[0, 0]}
        zoom={2}
        bounds={bounds}
        debounce={500}
        setProps={setProps}
      />,
    );
    expect(transformExtent).toHaveBeenCalledWith(bounds, 'EPSG:4326', 'EPSG:3857');
    expect(view.fit).toHaveBeenCalledWith(bounds, { duration: 300, size: [800, 600] });
  });

  it('emits geographic pointer data and distinguishes vector-feature hits from background', () => {
    const setProps = jest.fn();
    render(
      <MapComponent id="map" center={[0, 0]} zoom={2} projection="EPSG:4326" setProps={setProps} />,
    );

    const map = Map.mock.instances[0];
    const feature = {
      get: jest.fn(() => undefined),
      getProperties: jest.fn(() => ({
        name: 'Station A',
        geometry: { type: 'Point', coordinates: [3, 4] },
      })),
    };
    map.hitFeature = feature;
    const event = { coordinate: [3, 4], pixel: [30, 40] };

    map.listeners.singleclick(event);
    expect(toLonLat).toHaveBeenCalledWith([3, 4], 'EPSG:4326');
    expect(setProps).toHaveBeenCalledWith({
      clickData: {
        lat: 6,
        lon: 4,
        pixelCoordinate: [30, 40],
        featureInfo: { name: 'Station A' },
      },
    });

    map.listeners.dblclick(event);
    expect(setProps).toHaveBeenLastCalledWith({
      doubleClickData: {
        lat: 6,
        lon: 4,
        pixelCoordinate: [30, 40],
        featureInfo: { name: 'Station A' },
      },
    });

    map.listeners.pointermove(event);
    expect(setProps).toHaveBeenLastCalledWith({
      hoverData: {
        lat: 6,
        lon: 4,
        pixelCoordinate: [30, 40],
        featureInfo: { name: 'Station A' },
      },
    });
    const callbackCount = setProps.mock.calls.length;
    map.listeners.pointermove({ ...event, dragging: true });
    expect(setProps).toHaveBeenCalledTimes(callbackCount);

    map.hitFeature = null;
    map.listeners.singleclick(event);
    expect(setProps).toHaveBeenLastCalledWith({
      clickData: {
        lat: 6,
        lon: 4,
        pixelCoordinate: [30, 40],
        featureInfo: null,
      },
    });
  });

  it('executes shared history commands when undo and redo counters increment', () => {
    const setProps = jest.fn();
    const renderMap = (undo, redo) => (
      <MapComponent id="map" undo={undo} redo={redo} setProps={setProps} />
    );
    const { rerender } = render(renderMap(0, 0));
    const map = Map.mock.instances[0];
    const command = { undo: jest.fn(), redo: jest.fn() };
    getEditHistory(map).record(command);

    rerender(renderMap(1, 0));
    expect(command.undo).toHaveBeenCalledTimes(1);

    rerender(renderMap(1, 1));
    expect(command.redo).toHaveBeenCalledTimes(1);
  });
});

describe('Popup', () => {
  it('renders children in an overlay, updates its position, and removes it on unmount', () => {
    const map = makeMap();
    const { rerender, unmount } = render(
      <OLContext.Provider value={map}>
        <Popup
          id="place-popup"
          position={[10, 20]}
          positioning="bottom-center"
          offset={[0, -8]}
          autoPan
          className="place-popup"
          style={{ color: 'red' }}
        >
          <span>Place details</span>
        </Popup>
      </OLContext.Provider>,
    );
    const overlay = Overlay.mock.instances[0];

    expect(map.addOverlay).toHaveBeenCalledWith(overlay);
    expect(overlay.options).toMatchObject({
      element: expect.any(HTMLDivElement),
      autoPan: true,
    });
    expect(overlay.options.element).toHaveTextContent('Place details');
    expect(overlay.options.element.firstChild).toMatchObject({
      id: 'place-popup',
      className: 'place-popup',
    });
    expect(overlay.options.element.firstChild.style.color).toBe('red');
    expect(overlay.setOffset).toHaveBeenLastCalledWith([0, -8]);
    expect(overlay.setPositioning).toHaveBeenLastCalledWith('bottom-center');
    expect(overlay.setPosition).toHaveBeenLastCalledWith([10, 20]);

    rerender(
      <OLContext.Provider value={map}>
        <Popup
          position={[30, 40]}
          positioning="bottom-center"
          offset={[0, -8]}
          autoPan
          className="place-popup"
          style={{ color: 'red' }}
        >
          <span>Updated details</span>
        </Popup>
      </OLContext.Provider>,
    );

    expect(overlay.setPosition).toHaveBeenLastCalledWith([30, 40]);
    expect(overlay.options.element).toHaveTextContent('Updated details');

    unmount();
    expect(map.removeOverlay).toHaveBeenCalledWith(overlay);
  });
});

describe('ModifyInteraction history', () => {
  it('records before and after geometries as undoable edits', () => {
    const map = makeMap();
    const source = new VectorSource();
    let currentGeometry = makeTestGeometry('before');
    const feature = {
      getGeometry: jest.fn(() => currentGeometry),
      setGeometry: jest.fn((geometry) => {
        currentGeometry = geometry;
      }),
    };
    source.getFeatures.mockReturnValue([feature]);
    const layer = {
      get: jest.fn((key) =>
        key === 'dashId' ? 'editable' : key === 'dashVectorSource' ? source : undefined,
      ),
      getSource: jest.fn(() => ({ getSource: jest.fn(() => source) })),
    };
    map.getLayers.mockReturnValue({ getArray: () => [layer] });
    const setProps = jest.fn();

    render(
      <OLContext.Provider value={map}>
        <ModifyInteraction layerId="editable" setProps={setProps} />
      </OLContext.Provider>,
    );

    const modify = Modify.mock.instances[0];
    expect(modify.options.source).toBe(source);
    expect(Snap.mock.instances[0].options).toMatchObject({
      vertex: true,
      edge: true,
      pixelTolerance: 10,
    });
    expect(Snap.mock.instances[0].options.features.items).toContain(feature);
    const event = { features: { getArray: () => [feature] } };
    modify.listeners.modifystart(event);
    currentGeometry = makeTestGeometry('after');
    modify.listeners.modifyend(event);

    expect(setProps).toHaveBeenCalledWith(
      expect.objectContaining({
        modifiedGeoJSON: { type: 'FeatureCollection', features: [] },
        modifiedWKT: 'GEOMETRYCOLLECTION EMPTY',
        modifiedTopoJSON: expect.objectContaining({ type: 'Topology' }),
      }),
    );

    const history = getEditHistory(map);
    expect(history.getState()).toEqual({ canUndo: true, canRedo: false });
    history.undo();
    expect(feature.setGeometry).toHaveBeenLastCalledWith(
      expect.objectContaining({ label: 'before' }),
    );
    expect(setProps).toHaveBeenLastCalledWith(
      expect.objectContaining({
        modifiedGeoJSON: { type: 'FeatureCollection', features: [] },
        modifiedWKT: 'GEOMETRYCOLLECTION EMPTY',
        modifiedTopoJSON: expect.objectContaining({ type: 'Topology' }),
      }),
    );
    history.redo();
    expect(feature.setGeometry).toHaveBeenLastCalledWith(
      expect.objectContaining({ label: 'after' }),
    );
    expect(setProps).toHaveBeenLastCalledWith(
      expect.objectContaining({
        modifiedGeoJSON: { type: 'FeatureCollection', features: [] },
        modifiedWKT: 'GEOMETRYCOLLECTION EMPTY',
        modifiedTopoJSON: expect.objectContaining({ type: 'Topology' }),
      }),
    );
  });

  it('snaps with configured options and reverts topology-invalid polygon edits', () => {
    const map = makeMap();
    const source = new VectorSource();
    let currentGeometry = makeTestGeometry('before');
    const feature = {
      getGeometry: jest.fn(() => currentGeometry),
      setGeometry: jest.fn((geometry) => {
        currentGeometry = geometry;
      }),
    };
    source.getFeatures.mockReturnValue([feature]);
    const layer = {
      get: jest.fn((key) => (key === 'dashId' ? 'editable' : undefined)),
      getSource: jest.fn(() => source),
    };
    map.getLayers.mockReturnValue({ getArray: () => [layer] });
    const setProps = jest.fn();

    render(
      <OLContext.Provider value={map}>
        <ModifyInteraction
          layerId="editable"
          snapToVertex={false}
          snapToEdge
          snapTolerance={22}
          setProps={setProps}
        />
      </OLContext.Provider>,
    );

    const modify = Modify.mock.instances[0];
    expect(Snap.mock.instances[0].options).toMatchObject({
      vertex: false,
      edge: true,
      pixelTolerance: 22,
    });

    const event = { features: { getArray: () => [feature] } };
    modify.listeners.modifystart(event);
    GeoJSON.mock.instances[0].writeFeatureObject.mockReturnValue({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [2, 2],
            [0, 2],
            [2, 0],
            [0, 0],
          ],
        ],
      },
      properties: {},
    });
    currentGeometry = makeTestGeometry('invalid');
    modify.listeners.modifyend(event);

    expect(currentGeometry.label).toBe('before');
    expect(getEditHistory(map).getState()).toEqual({ canUndo: false, canRedo: false });
    expect(setProps).toHaveBeenCalledWith(
      expect.objectContaining({
        geometryValidation: expect.objectContaining({ valid: false }),
      }),
    );
  });
});

const makeTestGeometry = (label) => ({
  label,
  clone: jest.fn(() => makeTestGeometry(label)),
});

describe('OpenLayers context', () => {
  it('throws the documented error when a child uses useMap outside a provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() => render(<MapConsumer />)).toThrow(
        'dash-openlayers components must be wrapped within a <Map>',
      );
    } finally {
      consoleError.mockRestore();
    }
  });
});

describe('TileLayer', () => {
  it('adds and removes an OSM tile layer', () => {
    const map = makeMap();
    const { rerender, unmount } = render(
      <OLContext.Provider value={map}>
        <TileLayer source="OSM" />
      </OLContext.Provider>,
    );

    expect(OSM).toHaveBeenCalledTimes(1);
    expect(Tile).toHaveBeenCalledWith({ source: OSM.mock.instances[0] });
    const layer = Tile.mock.instances[0];
    expect(map.addLayer).toHaveBeenCalledWith(layer);
    expect(layer.setVisible).toHaveBeenCalledWith(true);
    expect(layer.setOpacity).toHaveBeenCalledWith(1);
    expect(layer.setZIndex).not.toHaveBeenCalled();

    unmount();
    expect(map.removeLayer).toHaveBeenCalledWith(layer);
  });

  it('updates visibility, opacity, and stacking order without replacing the layer', () => {
    const map = makeMap();
    const renderLayer = (visible, opacity, zIndex) => (
      <OLContext.Provider value={map}>
        <TileLayer
          source="OSM"
          visible={visible}
          opacity={opacity}
          zIndex={zIndex}
        />
      </OLContext.Provider>
    );
    const { rerender } = render(renderLayer(false, 0.4, 2));
    const layer = Tile.mock.instances[0];

    expect(layer.setVisible).toHaveBeenCalledWith(false);
    expect(layer.setOpacity).toHaveBeenCalledWith(0.4);
    expect(layer.setZIndex).toHaveBeenCalledWith(2);

    rerender(renderLayer(true, 0.8, 5));
    expect(Tile).toHaveBeenCalledTimes(1);
    expect(layer.setVisible).toHaveBeenLastCalledWith(true);
    expect(layer.setOpacity).toHaveBeenLastCalledWith(0.8);
    expect(layer.setZIndex).toHaveBeenLastCalledWith(5);
  });

  it('replaces its source when the URL prop changes', () => {
    const map = makeMap();
    const renderLayer = (url) => (
      <OLContext.Provider value={map}>
        <TileLayer source="OSM" url={url} />
      </OLContext.Provider>
    );
    const { rerender, unmount } = render(renderLayer(null));
    const osmLayer = Tile.mock.instances[0];

    rerender(renderLayer('https://tiles.example/{z}/{x}/{y}.png'));
    const xyzLayer = Tile.mock.instances[1];
    expect(map.removeLayer).toHaveBeenCalledWith(osmLayer);
    expect(XYZ).toHaveBeenCalledWith({ url: 'https://tiles.example/{z}/{x}/{y}.png' });
    expect(xyzLayer.options.source).toBe(XYZ.mock.instances[0]);

    unmount();
    expect(map.removeLayer).toHaveBeenLastCalledWith(xyzLayer);
  });

  it('does not add a layer when no supported source is provided', () => {
    const map = makeMap();
    render(
      <OLContext.Provider value={map}>
        <TileLayer />
      </OLContext.Provider>,
    );
    expect(map.addLayer).not.toHaveBeenCalled();
  });
});

describe('WebGLPointsLayer', () => {
  it('uses a default circle style when no WebGL style is provided', () => {
    const map = makeMap();
    render(
      <OLContext.Provider value={map}>
        <WebGLPointsLayerComponent />
      </OLContext.Provider>,
    );

    expect(OpenLayersWebGLPointsLayer.mock.instances[0].options.style).toEqual({
      'circle-radius': 5,
      'circle-fill-color': '#3399cc',
    });
  });

  it('updates visibility, opacity, and stacking order without recreating the WebGL layer', () => {
    const map = makeMap();
    const renderLayer = (visible, opacity, zIndex) => (
      <OLContext.Provider value={map}>
        <WebGLPointsLayerComponent visible={visible} opacity={opacity} zIndex={zIndex} />
      </OLContext.Provider>
    );
    const { rerender } = render(renderLayer(false, 0.5, 2));
    const layer = OpenLayersWebGLPointsLayer.mock.instances[0];

    expect(layer.setVisible).toHaveBeenCalledWith(false);
    expect(layer.setOpacity).toHaveBeenCalledWith(0.5);
    expect(layer.setZIndex).toHaveBeenCalledWith(2);

    rerender(renderLayer(true, 0.75, 8));
    expect(OpenLayersWebGLPointsLayer).toHaveBeenCalledTimes(1);
    expect(layer.setVisible).toHaveBeenLastCalledWith(true);
    expect(layer.setOpacity).toHaveBeenLastCalledWith(0.75);
    expect(layer.setZIndex).toHaveBeenLastCalledWith(8);
  });

  it('loads GeoJSON, updates its stable source, and disposes replaced and removed layers', () => {
    const map = makeMap();
    const initialData = { type: 'FeatureCollection', features: [] };
    const updatedData = JSON.stringify({ type: 'FeatureCollection', features: [] });
    const initialStyle = {
      'circle-radius': ['interpolate', ['linear'], ['get', 'magnitude'], 0, 3, 10, 12],
      'circle-fill-color': ['match', ['get', 'kind'], 'station', '#d66f41', '#1f6a5e'],
    };
    const updatedStyle = { 'shape-points': 5, 'shape-radius': 8, 'shape-fill-color': '#d66f41' };
    const { rerender, unmount } = render(
      <OLContext.Provider value={map}>
        <WebGLPointsLayerComponent
          id="large-points"
          data={initialData}
          style={initialStyle}
          disableHitDetection
        />
      </OLContext.Provider>,
    );

    const source = VectorSource.mock.instances[0];
    const firstLayer = OpenLayersWebGLPointsLayer.mock.instances[0];
    expect(firstLayer.options).toEqual({ source, style: initialStyle, disableHitDetection: true });
    expect(firstLayer.set).toHaveBeenCalledWith('dashId', 'large-points');
    expect(firstLayer.set).toHaveBeenCalledWith('dashLayerControl', true);
    expect(map.addLayer).toHaveBeenCalledWith(firstLayer);
    expect(GeoJSON.mock.instances.at(-1).readFeatures).toHaveBeenCalledWith(initialData, {
      featureProjection: 'EPSG:3857',
    });

    rerender(
      <OLContext.Provider value={map}>
        <WebGLPointsLayerComponent
          id="large-points"
          data={updatedData}
          style={initialStyle}
          disableHitDetection
        />
      </OLContext.Provider>,
    );
    expect(OpenLayersWebGLPointsLayer).toHaveBeenCalledTimes(1);
    expect(source.clear).toHaveBeenCalledTimes(2);
    expect(GeoJSON.mock.instances.at(-1).readFeatures).toHaveBeenCalledWith(updatedData, {
      featureProjection: 'EPSG:3857',
    });

    rerender(
      <OLContext.Provider value={map}>
        <WebGLPointsLayerComponent
          id="large-points"
          data={updatedData}
          style={updatedStyle}
          disableHitDetection
        />
      </OLContext.Provider>,
    );
    const replacementLayer = OpenLayersWebGLPointsLayer.mock.instances[1];
    expect(firstLayer.dispose).toHaveBeenCalledTimes(1);
    expect(map.removeLayer).toHaveBeenCalledWith(firstLayer);
    expect(replacementLayer.options).toEqual({
      source,
      style: updatedStyle,
      disableHitDetection: true,
    });

    unmount();
    expect(map.removeLayer).toHaveBeenLastCalledWith(replacementLayer);
    expect(replacementLayer.dispose).toHaveBeenCalledTimes(1);
    expect(source.clear).toHaveBeenCalledTimes(3);
  });
});

describe('VectorLayer', () => {
  it('updates visibility, opacity, and stacking order on the existing vector layer', () => {
    const map = makeMap();
    const renderLayer = (visible, opacity, zIndex) => (
      <OLContext.Provider value={map}>
        <VectorLayer visible={visible} opacity={opacity} zIndex={zIndex} />
      </OLContext.Provider>
    );
    const { rerender } = render(renderLayer(false, 0.35, 1));
    const layer = OpenLayersVectorLayer.mock.instances.at(-1);

    expect(layer.setVisible).toHaveBeenCalledWith(false);
    expect(layer.setOpacity).toHaveBeenCalledWith(0.35);
    expect(layer.setZIndex).toHaveBeenCalledWith(1);

    rerender(renderLayer(true, 0.9, 4));
    expect(OpenLayersVectorLayer).toHaveBeenCalledTimes(1);
    expect(layer.setVisible).toHaveBeenLastCalledWith(true);
    expect(layer.setOpacity).toHaveBeenLastCalledWith(0.9);
    expect(layer.setZIndex).toHaveBeenLastCalledWith(4);
  });

  it('loads GeoJSON into a projected vector layer and updates it when props change', () => {
    const map = makeMap();
    const initialGeoJSON = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [10, 45] },
          properties: {},
        },
      ],
    };
    const updatedGeoJSON = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [20, 10] },
          properties: {},
        },
      ],
    };
    const { rerender, unmount } = render(
      <OLContext.Provider value={map}>
        <VectorLayer id="features" geojson={initialGeoJSON} />
      </OLContext.Provider>,
    );

    const source = VectorSource.mock.instances[0];
    const layer = OpenLayersVectorLayer.mock.instances[0];
    const initialFormat = GeoJSON.mock.instances.at(-1);
    expect(layer.set).toHaveBeenCalledWith('dashId', 'features');
    expect(map.addLayer).toHaveBeenCalledWith(layer);
    expect(initialFormat.readFeatures).toHaveBeenCalledWith(initialGeoJSON, {
      featureProjection: 'EPSG:3857',
    });
    expect(source.addFeatures).toHaveBeenCalledWith(initialFormat.features);

    rerender(
      <OLContext.Provider value={map}>
        <VectorLayer id="features" geojson={updatedGeoJSON} />
      </OLContext.Provider>,
    );
    expect(source.clear).toHaveBeenCalledTimes(2);
    const updatedFormat = GeoJSON.mock.instances.at(-1);
    expect(updatedFormat.readFeatures).toHaveBeenCalledWith(updatedGeoJSON, {
      featureProjection: 'EPSG:3857',
    });

    unmount();
    expect(map.removeLayer).toHaveBeenCalledWith(layer);
    expect(source.clear).toHaveBeenCalledTimes(3);
  });

  it('accepts GeoJSON strings and objects through data and prefers data to geojson', () => {
    const map = makeMap();
    const data = {
      type: 'FeatureCollection',
      crs: { type: 'name', properties: { name: 'EPSG:3857' } },
      features: [],
    };
    const serializedData = JSON.stringify(data);
    const { rerender } = render(
      <OLContext.Provider value={map}>
        <VectorLayer data={serializedData} geojson={{ type: 'FeatureCollection', features: [] }} />
      </OLContext.Provider>,
    );

    expect(GeoJSON.mock.instances.at(-1).readFeatures).toHaveBeenCalledWith(serializedData, {
      featureProjection: 'EPSG:3857',
    });

    rerender(
      <OLContext.Provider value={map}>
        <VectorLayer data={data} />
      </OLContext.Provider>,
    );
    expect(GeoJSON.mock.instances.at(-1).readFeatures).toHaveBeenCalledWith(data, {
      featureProjection: 'EPSG:3857',
    });
  });

  it('loads WKT input in the map projection ahead of GeoJSON input', () => {
    const map = makeMap();
    const wkt = 'POINT (10 45)';
    render(
      <OLContext.Provider value={map}>
        <VectorLayer
          id="features"
          data={{ type: 'FeatureCollection', features: [] }}
          geojson={{ type: 'FeatureCollection', features: [] }}
          wkt={wkt}
        />
      </OLContext.Provider>,
    );

    const source = VectorSource.mock.instances[0];
    const format = WKT.mock.instances.at(-1);
    expect(format.readFeatures).toHaveBeenCalledWith(wkt, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });
    expect(source.addFeatures).toHaveBeenCalledWith([{ id: 'wkt-feature' }]);
  });

  it('loads remote formats into the existing source and reports failures', async () => {
    const map = makeMap();
    const setProps = jest.fn();
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue('<kml />'),
      })
      .mockResolvedValueOnce({ ok: false, status: 503 });
    const { rerender } = render(
      <OLContext.Provider value={map}>
        <VectorLayer
          id="remote-features"
          url="https://data.example/features.kml"
          format="KML"
          dataProjection="EPSG:27700"
          setProps={setProps}
        />
      </OLContext.Provider>,
    );

    const source = VectorSource.mock.instances.at(-1);
    const layer = OpenLayersVectorLayer.mock.instances.at(-1);
    const initialRequestSignal = global.fetch.mock.calls[0][1].signal;
    await waitFor(() =>
      expect(setProps).toHaveBeenCalledWith({ featureCount: 1, loadError: null }),
    );
    expect(KML.mock.instances.at(-1).readFeatures).toHaveBeenCalledWith('<kml />', {
      featureProjection: 'EPSG:3857',
      dataProjection: 'EPSG:27700',
    });
    expect(source.addFeatures).toHaveBeenCalledWith([{ id: 'kml-feature' }]);

    rerender(
      <OLContext.Provider value={map}>
        <VectorLayer
          id="remote-features"
          url="https://data.example/other.kml"
          format="KML"
          dataProjection="EPSG:27700"
          setProps={setProps}
        />
      </OLContext.Provider>,
    );
    await waitFor(() =>
      expect(setProps).toHaveBeenCalledWith({
        featureCount: 0,
        loadError: 'Vector data request failed: 503',
      }),
    );
    expect(initialRequestSignal.aborted).toBe(true);
    expect(VectorSource).toHaveBeenCalledTimes(1);
    expect(OpenLayersVectorLayer).toHaveBeenCalledTimes(1);
    expect(map.addLayer).toHaveBeenCalledWith(layer);
  });

  it('publishes clicked and hovered features as GeoJSON and removes map listeners', () => {
    const map = makeMap();
    const setProps = jest.fn();
    const feature = { get: jest.fn(() => undefined) };
    const { unmount } = render(
      <OLContext.Provider value={map}>
        <VectorLayer id="features" setProps={setProps} />
      </OLContext.Provider>,
    );
    map.hitFeature = feature;

    map.listeners.singleclick({ pixel: [10, 20] });
    expect(setProps).toHaveBeenCalledWith({
      clickedFeature: {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [10, 45] },
        properties: {},
      },
    });
    map.listeners.pointermove({ pixel: [10, 20], dragging: false });
    expect(setProps).toHaveBeenLastCalledWith({
      hoveredFeature: {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [10, 45] },
        properties: {},
      },
    });
    const setPropsCount = setProps.mock.calls.length;
    map.listeners.pointermove({ pixel: [10, 20], dragging: true });
    map.listeners.pointermove({ pixel: [10, 20], dragging: false });
    expect(setProps).toHaveBeenCalledTimes(setPropsCount);

    map.hitFeature = null;
    map.listeners.pointermove({ pixel: [10, 20], dragging: false });
    expect(setProps).toHaveBeenLastCalledWith({ hoveredFeature: null });
    map.hitFeature = null;
    map.listeners.singleclick({ pixel: [10, 20] });
    expect(setProps).toHaveBeenLastCalledWith({ clickedFeature: null });
    unmount();
    expect(unByKey).toHaveBeenCalledWith([
      expect.objectContaining({ event: 'singleclick' }),
      expect.objectContaining({ event: 'pointermove' }),
    ]);
  });

  it('applies hover and selected styles as map interactions change feature state', () => {
    const map = makeMap();
    const hoveredFeature = { get: jest.fn(() => undefined) };
    const selectedFeature = { get: jest.fn(() => undefined) };
    render(
      <OLContext.Provider value={map}>
        <VectorLayer
          hoverStyle={{ fillColor: '#ffaa00' }}
          selectedStyle={{ fillColor: '#00aa55' }}
        />
      </OLContext.Provider>,
    );

    const layer = OpenLayersVectorLayer.mock.instances.at(-1);
    const styleFunction = layer.styleFunction;
    map.hitFeature = hoveredFeature;
    map.listeners.pointermove({ pixel: [1, 2], dragging: false });
    expect(styleFunction(hoveredFeature, 1)[0].options.fill.options.color).toBe('#ffaa00');

    map.hitFeature = selectedFeature;
    map.listeners.singleclick({ pixel: [1, 2] });
    expect(styleFunction(selectedFeature, 1)[0].options.fill.options.color).toBe('#00aa55');
    expect(layer.changed).toHaveBeenCalledTimes(2);

    map.hitFeature = null;
    map.listeners.singleclick({ pixel: [1, 2] });
    expect(styleFunction(selectedFeature, 1)).toEqual([{ name: 'base-style' }]);
  });

  it('compiles declarative property rules, opacity, and custom markers', () => {
    const style = createVectorStyle({
      fillColor: '#336699',
      strokeColor: '#ffffff',
      strokeWidth: 2,
      radius: 8,
      opacity: 0.5,
      rules: [
        {
          property: 'rate',
          operator: '>=',
          value: 50,
          style: { fillColor: '#cc0000' },
        },
      ],
    });
    const fallbackStyle = style({ get: () => 20 }, 1);
    const matchingStyle = style({ get: () => 80 }, 1);
    const svgStyle = createVectorStyle({
      marker: { svg: '<svg xmlns="http://www.w3.org/2000/svg"></svg>' },
    });
    const urlStyle = createVectorStyle({ marker: 'https://example.com/marker.png' });

    expect(fallbackStyle[0].options.fill.options.color).toEqual([51, 102, 153, 0.5]);
    expect(fallbackStyle[0].options.stroke.options.width).toBe(2);
    expect(fallbackStyle[0].options.image.options.radius).toBe(8);
    expect(matchingStyle[0].options.fill.options.color).toBe('#cc0000');
    expect(svgStyle.options.image.options.src).toContain('data:image/svg+xml');
    expect(urlStyle.options.image.options.src).toBe('https://example.com/marker.png');
  });

  it('clears the source when GeoJSON is removed', () => {
    const map = makeMap();
    const initialGeoJSON = { type: 'FeatureCollection', features: [] };
    const { rerender } = render(
      <OLContext.Provider value={map}>
        <VectorLayer geojson={initialGeoJSON} />
      </OLContext.Provider>,
    );
    const source = VectorSource.mock.instances[0];
    source.addFeatures.mockClear();

    rerender(
      <OLContext.Provider value={map}>
        <VectorLayer geojson={null} />
      </OLContext.Provider>,
    );
    expect(source.clear).toHaveBeenCalledTimes(2);
    expect(source.addFeatures).not.toHaveBeenCalled();
  });

  it('clusters point data, styles counts, and updates cluster distance without replacing the source', () => {
    const map = makeMap();
    const geojson = { type: 'FeatureCollection', features: [] };
    const style = { 'circle-radius': 5, 'circle-fill-color': '#1d6a7a' };
    const { rerender, unmount } = render(
      <OLContext.Provider value={map}>
        <VectorLayer
          id="clustered"
          geojson={geojson}
          style={style}
          clusterDistance={40}
          clusterMinDistance={12}
          declutter="labels"
        />
      </OLContext.Provider>,
    );

    const source = VectorSource.mock.instances.at(-1);
    const cluster = Cluster.mock.instances.at(-1);
    const layer = OpenLayersVectorLayer.mock.instances.at(-1);
    expect(cluster.options).toEqual({ source, distance: 40, minDistance: 12 });
    expect(layer.options).toEqual({ source, declutter: 'labels' });
    expect(layer.get('dashVectorSource')).toBe(source);
    expect(layer.setSource).toHaveBeenCalledWith(cluster);

    const clusterStyle = layer.setStyle.mock.calls.at(-1)[0];
    const members = [{ id: 'one' }, { id: 'two' }, { id: 'three' }];
    const badge = clusterStyle({ get: () => members }, 1);
    expect(badge.options.text.options.text).toBe('3');
    expect(clusterStyle({ get: () => [members[0]] }, 2)).toEqual([{ name: 'base-style' }]);

    rerender(
      <OLContext.Provider value={map}>
        <VectorLayer
          id="clustered"
          geojson={geojson}
          style={style}
          clusterDistance={64}
          clusterMinDistance={6}
          declutter="labels"
        />
      </OLContext.Provider>,
    );
    expect(Cluster).toHaveBeenCalledTimes(2);
    expect(Cluster.mock.instances.at(-1).options).toEqual({
      source,
      distance: 64,
      minDistance: 6,
    });
    expect(cluster.setSource).toHaveBeenCalledWith(null);
    expect(VectorSource).toHaveBeenCalledTimes(1);

    rerender(
      <OLContext.Provider value={map}>
        <VectorLayer id="clustered" geojson={geojson} style={style} declutter="labels" />
      </OLContext.Provider>,
    );
    expect(layer.setSource).toHaveBeenLastCalledWith(source);
    expect(Cluster.mock.instances.at(-1).setSource).toHaveBeenCalledWith(null);
    unmount();
  });

  it('applies declarative style changes without recreating the vector source', () => {
    const map = makeMap();
    const geojson = { type: 'FeatureCollection', features: [] };
    const initialStyle = [
      {
        filter: ['<', ['resolution'], 2500],
        style: {
          'icon-src': 'https://example.com/marker.png',
          'stroke-color': '#1f6a5e',
          'fill-color': 'rgba(31, 106, 94, 0.24)',
        },
      },
      { else: true, style: { 'circle-radius': 5, 'circle-fill-color': '#d66f41' } },
    ];
    const { rerender } = render(
      <OLContext.Provider value={map}>
        <VectorLayer id="styled" geojson={geojson} style={initialStyle} />
      </OLContext.Provider>,
    );

    const layer = OpenLayersVectorLayer.mock.instances[0];
    const source = VectorSource.mock.instances[0];
    expect(layer.setStyle).toHaveBeenCalledWith(initialStyle);

    const updatedStyle = { 'stroke-color': '#b34a36', 'stroke-width': 3 };
    rerender(
      <OLContext.Provider value={map}>
        <VectorLayer id="styled" geojson={geojson} style={updatedStyle} />
      </OLContext.Provider>,
    );
    expect(layer.setStyle).toHaveBeenLastCalledWith(updatedStyle);
    expect(OpenLayersVectorLayer).toHaveBeenCalledTimes(1);
    expect(VectorSource).toHaveBeenCalledTimes(1);

    const replacementMap = makeMap();
    rerender(
      <OLContext.Provider value={replacementMap}>
        <VectorLayer id="styled" geojson={geojson} style={updatedStyle} />
      </OLContext.Provider>,
    );
    const replacementLayer = OpenLayersVectorLayer.mock.instances[1];
    expect(replacementMap.addLayer).toHaveBeenCalledWith(replacementLayer);
    expect(replacementLayer.setStyle).toHaveBeenCalledWith(updatedStyle);

    rerender(
      <OLContext.Provider value={replacementMap}>
        <VectorLayer id="styled" geojson={geojson} />
      </OLContext.Provider>,
    );
    expect(replacementLayer.setStyle).toHaveBeenLastCalledWith(undefined);
  });
});

describe('VectorTileLayer', () => {
  it('updates visibility, opacity, and stacking order without replacing the layer', () => {
    const map = makeMap();
    const renderLayer = (visible, opacity, zIndex) => (
      <OLContext.Provider value={map}>
        <VectorTileLayer
          url="https://tiles.example/{z}/{x}/{y}.pbf"
          visible={visible}
          opacity={opacity}
          zIndex={zIndex}
        />
      </OLContext.Provider>
    );
    const { rerender } = render(renderLayer(false, 0.45, 3));
    const layer = OpenLayersVectorTileLayer.mock.instances[0];

    expect(layer.setVisible).toHaveBeenCalledWith(false);
    expect(layer.setOpacity).toHaveBeenCalledWith(0.45);
    expect(layer.setZIndex).toHaveBeenCalledWith(3);

    rerender(renderLayer(true, 0.95, 7));
    expect(OpenLayersVectorTileLayer).toHaveBeenCalledTimes(1);
    expect(layer.setVisible).toHaveBeenLastCalledWith(true);
    expect(layer.setOpacity).toHaveBeenLastCalledWith(0.95);
    expect(layer.setZIndex).toHaveBeenLastCalledWith(7);
  });

  it('adds an MVT layer with source projection, attribution, and style, then clears it on unmount', () => {
    const map = makeMap();
    const style = { 'fill-color': '#6b9b83', 'stroke-width': 1 };
    const { rerender, unmount } = render(
      <OLContext.Provider value={map}>
        <VectorTileLayer
          id="vector-tiles"
          url="https://tiles.example/{z}/{x}/{y}.pbf"
          projection="EPSG:27700"
          attributions="Tile provider"
          style={style}
        />
      </OLContext.Provider>,
    );

    const format = MVT.mock.instances[0];
    const source = VectorTileSource.mock.instances[0];
    const layer = OpenLayersVectorTileLayer.mock.instances[0];
    expect(source.options).toEqual({
      format,
      projection: 'EPSG:27700',
      attributions: 'Tile provider',
      url: 'https://tiles.example/{z}/{x}/{y}.pbf',
    });
    expect(layer.options).toEqual({ source });
    expect(layer.set).toHaveBeenCalledWith('dashId', 'vector-tiles');
    expect(layer.setStyle).toHaveBeenCalledWith(style);
    expect(map.addLayer).toHaveBeenCalledWith(layer);

    const updatedStyle = { 'fill-color': '#d66f41' };
    rerender(
      <OLContext.Provider value={map}>
        <VectorTileLayer
          id="vector-tiles"
          url="https://tiles.example/{z}/{x}/{y}.pbf"
          projection="EPSG:27700"
          attributions="Tile provider"
          style={updatedStyle}
        />
      </OLContext.Provider>,
    );
    expect(layer.setStyle).toHaveBeenLastCalledWith(updatedStyle);
    expect(VectorTileSource).toHaveBeenCalledTimes(1);

    unmount();
    expect(map.removeLayer).toHaveBeenCalledWith(layer);
    expect(source.clear).toHaveBeenCalled();
  });

  it('supports URL arrays and skips layer creation without a URL', () => {
    const map = makeMap();
    const urls = ['https://a.example/{z}/{x}/{y}.pbf', 'https://b.example/{z}/{x}/{y}.pbf'];
    const { rerender } = render(
      <OLContext.Provider value={map}>
        <VectorTileLayer urls={urls} />
      </OLContext.Provider>,
    );

    expect(VectorTileSource.mock.instances[0].options.urls).toBe(urls);
    expect(map.addLayer).toHaveBeenCalledTimes(1);

    rerender(
      <OLContext.Provider value={map}>
        <VectorTileLayer />
      </OLContext.Provider>,
    );
    expect(map.addLayer).toHaveBeenCalledTimes(1);
  });

  it('applies a Mapbox GL style to its vector source', () => {
    const map = makeMap();
    const mapboxStyle = {
      version: 8,
      sources: { streets: { type: 'vector' } },
      layers: [],
    };
    render(
      <OLContext.Provider value={map}>
        <VectorTileLayer url="https://tiles.example/{z}/{x}/{y}.pbf" mapboxStyle={mapboxStyle} />
      </OLContext.Provider>,
    );

    expect(stylefunction).toHaveBeenCalledWith(
      OpenLayersVectorTileLayer.mock.instances[0],
      mapboxStyle,
      'streets',
    );
  });

  it('reports clicked and hovered vector-tile feature attributes to Dash', () => {
    const map = makeMap();
    const setProps = jest.fn();
    const feature = {
      getId: jest.fn(() => 'road-1'),
      getProperties: jest.fn(() => ({ name: 'Main Street', kind: 'road', geometry: {} })),
    };
    map.hitFeature = feature;
    render(
      <OLContext.Provider value={map}>
        <VectorTileLayer
          id="vector-tiles"
          url="https://tiles.example/{z}/{x}/{y}.pbf"
          setProps={setProps}
        />
      </OLContext.Provider>,
    );

    map.listeners.pointermove({ pixel: [10, 20], dragging: false });
    map.listeners.singleclick({ pixel: [10, 20] });

    expect(setProps).toHaveBeenNthCalledWith(1, {
      hoveredFeature: { id: 'road-1', properties: { name: 'Main Street', kind: 'road' } },
    });
    expect(setProps).toHaveBeenNthCalledWith(2, {
      clickedFeature: { id: 'road-1', properties: { name: 'Main Street', kind: 'road' } },
    });
  });
});

describe('WFSLayer', () => {
  it('loads WFS GeoJSON, reports the feature count, and aborts on unmount', async () => {
    const map = makeMap();
    const setProps = jest.fn();
    const featureCollection = { type: 'FeatureCollection', features: [{ id: 'road-1' }] };
    const params = { count: 10, CQL_FILTER: 'status=active' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(featureCollection),
    });
    const { rerender, unmount } = render(
      <OLContext.Provider value={map}>
        <WFSLayer
          id="roads"
          url="https://maps.example.com/wfs?token=abc"
          typeNames="workspace:roads"
          params={params}
          visible={false}
          opacity={0.55}
          zIndex={1}
          setProps={setProps}
        />
      </OLContext.Provider>,
    );

    const requestURL = new URL(global.fetch.mock.calls[0][0]);
    const requestOptions = global.fetch.mock.calls[0][1];
    const layer = OpenLayersVectorLayer.mock.instances.at(-1);
    const source = VectorSource.mock.instances.at(-1);
    expect(requestURL.searchParams.get('token')).toBe('abc');
    expect(requestURL.searchParams.get('service')).toBe('WFS');
    expect(requestURL.searchParams.get('version')).toBe('2.0.0');
    expect(requestURL.searchParams.get('request')).toBe('GetFeature');
    expect(requestURL.searchParams.get('typeNames')).toBe('workspace:roads');
    expect(requestURL.searchParams.get('count')).toBe('10');
    expect(requestURL.searchParams.get('CQL_FILTER')).toBe('status=active');
    expect(layer.set).toHaveBeenCalledWith('dashId', 'roads');
    expect(map.addLayer).toHaveBeenCalledWith(layer);
    expect(layer.setVisible).toHaveBeenCalledWith(false);
    expect(layer.setOpacity).toHaveBeenCalledWith(0.55);
    expect(layer.setZIndex).toHaveBeenCalledWith(1);

    await waitFor(() =>
      expect(setProps).toHaveBeenCalledWith({ featureCount: 1, loadError: null }),
    );
    rerender(
      <OLContext.Provider value={map}>
        <WFSLayer
          id="roads"
          url="https://maps.example.com/wfs?token=abc"
          typeNames="workspace:roads"
          params={params}
          visible
          opacity={0.85}
          zIndex={4}
          setProps={setProps}
        />
      </OLContext.Provider>,
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(layer.setVisible).toHaveBeenLastCalledWith(true);
    expect(layer.setOpacity).toHaveBeenLastCalledWith(0.85);
    expect(layer.setZIndex).toHaveBeenLastCalledWith(4);
    expect(source.addFeatures).toHaveBeenCalledWith([{ id: 'feature' }]);
    expect(GeoJSON.mock.instances.at(-1).readFeatures).toHaveBeenCalledWith(featureCollection, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });

    unmount();
    expect(requestOptions.signal.aborted).toBe(true);
    expect(map.removeLayer).toHaveBeenCalledWith(layer);
    expect(source.clear).toHaveBeenCalled();
  });
});

describe('WMTSLayer', () => {
  it('loads capabilities, derives source options, and removes the WMTS layer on unmount', async () => {
    const map = makeMap();
    const capabilities = { contents: true };
    const sourceOptions = {
      url: 'https://tiles.example/wmts',
      layer: 'roads',
      matrixSet: 'EPSG:3857',
      tileGrid: { matrixIds: ['0'] },
      dimensions: { TIME: '2025-01-01' },
    };
    const wmtsDimensions = { TIME: '2026-01-01' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue('<Capabilities />'),
    });
    optionsFromCapabilities.mockReturnValue(sourceOptions);

    const { rerender, unmount } = render(
      <OLContext.Provider value={map}>
        <WMTSLayer
          id="wmts"
          url="https://tiles.example/wmts?SERVICE=WMTS&REQUEST=GetCapabilities"
          layer="roads"
          matrixSet="EPSG:3857"
          projection="EPSG:3857"
          style="default"
          format="image/png"
          requestEncoding="KVP"
          dimensions={wmtsDimensions}
          attributions="Tile provider"
          visible={false}
          opacity={0.65}
          zIndex={2}
        />
      </OLContext.Provider>,
    );

    await waitFor(() => expect(map.addLayer).toHaveBeenCalledTimes(1));
    expect(global.fetch).toHaveBeenCalledWith(
      'https://tiles.example/wmts?SERVICE=WMTS&REQUEST=GetCapabilities',
    );
    expect(WMTSCapabilities.mock.instances[0].read).toHaveBeenCalledWith('<Capabilities />');
    expect(optionsFromCapabilities).toHaveBeenCalledWith(
      capabilities,
      expect.objectContaining({
        layer: 'roads',
        matrixSet: 'EPSG:3857',
        projection: 'EPSG:3857',
        style: 'default',
        format: 'image/png',
        requestEncoding: 'KVP',
      }),
    );

    const source = WMTS.mock.instances[0];
    const tileLayer = Tile.mock.instances[0];
    expect(source.options).toEqual({
      ...sourceOptions,
      dimensions: { TIME: '2026-01-01' },
      attributions: 'Tile provider',
    });
    expect(tileLayer.set).toHaveBeenCalledWith('dashId', 'wmts');
    expect(map.addLayer).toHaveBeenCalledWith(tileLayer);
    expect(tileLayer.setVisible).toHaveBeenCalledWith(false);
    expect(tileLayer.setOpacity).toHaveBeenCalledWith(0.65);
    expect(tileLayer.setZIndex).toHaveBeenCalledWith(2);

    rerender(
      <OLContext.Provider value={map}>
        <WMTSLayer
          id="wmts"
          url="https://tiles.example/wmts?SERVICE=WMTS&REQUEST=GetCapabilities"
          layer="roads"
          matrixSet="EPSG:3857"
          projection="EPSG:3857"
          style="default"
          format="image/png"
          requestEncoding="KVP"
          dimensions={wmtsDimensions}
          attributions="Tile provider"
          visible
          opacity={0.3}
          zIndex={9}
        />
      </OLContext.Provider>,
    );
    expect(tileLayer.setVisible).toHaveBeenLastCalledWith(true);
    expect(tileLayer.setOpacity).toHaveBeenLastCalledWith(0.3);
    expect(tileLayer.setZIndex).toHaveBeenLastCalledWith(9);

    unmount();
    expect(map.removeLayer).toHaveBeenCalledWith(tileLayer);
    expect(source.clear).toHaveBeenCalled();
  });

  it('does not add a layer when capabilities resolve after unmount', async () => {
    const map = makeMap();
    let resolveResponse;
    global.fetch = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveResponse = resolve;
        }),
    );
    const { unmount } = render(
      <OLContext.Provider value={map}>
        <WMTSLayer url="https://tiles.example/wmts" layer="roads" />
      </OLContext.Provider>,
    );

    unmount();
    resolveResponse({ ok: true, text: async () => '<Capabilities />' });
    await waitFor(() => expect(WMTSCapabilities).toHaveBeenCalled());
    expect(map.addLayer).not.toHaveBeenCalled();
  });
});

describe('WMS layers', () => {
  it('creates a tiled WMS layer and updates its request params without replacing the source', () => {
    const map = makeMap();
    const initialParams = { LAYERS: 'workspace:roads', STYLES: '' };
    const { rerender, unmount } = render(
      <OLContext.Provider value={map}>
        <TileWMSLayer
          id="tile-wms"
          url="https://maps.example.com/geoserver/wms"
          params={initialParams}
          serverType="geoserver"
          visible={false}
          opacity={0.6}
          zIndex={2}
        />
      </OLContext.Provider>,
    );

    const source = TileWMSSource.mock.instances[0];
    const layer = Tile.mock.instances[0];
    expect(source.options).toEqual({
      url: 'https://maps.example.com/geoserver/wms',
      params: initialParams,
      serverType: 'geoserver',
    });
    expect(layer.options).toEqual({ source });
    expect(layer.set).toHaveBeenCalledWith('dashId', 'tile-wms');
    expect(map.addLayer).toHaveBeenCalledWith(layer);
    expect(layer.setVisible).toHaveBeenCalledWith(false);
    expect(layer.setOpacity).toHaveBeenCalledWith(0.6);
    expect(layer.setZIndex).toHaveBeenCalledWith(2);

    const updatedParams = { LAYERS: 'workspace:parcels', STYLES: 'outline' };
    rerender(
      <OLContext.Provider value={map}>
        <TileWMSLayer
          id="tile-wms"
          url="https://maps.example.com/geoserver/wms"
          params={updatedParams}
          serverType="geoserver"
          visible
          opacity={0.25}
          zIndex={5}
        />
      </OLContext.Provider>,
    );
    expect(source.updateParams).toHaveBeenCalledWith(updatedParams);
    expect(TileWMSSource).toHaveBeenCalledTimes(1);
    expect(layer.setVisible).toHaveBeenLastCalledWith(true);
    expect(layer.setOpacity).toHaveBeenLastCalledWith(0.25);
    expect(layer.setZIndex).toHaveBeenLastCalledWith(5);

    unmount();
    expect(map.removeLayer).toHaveBeenCalledWith(layer);
  });

  it('creates an image WMS layer and refreshes it when params change', () => {
    const map = makeMap();
    const params = { LAYERS: 'workspace:boundaries' };
    const { rerender, unmount } = render(
      <OLContext.Provider value={map}>
        <ImageWMSLayer
          id="image-wms"
          url="https://maps.example.com/wms"
          params={params}
          serverType="qgis"
          visible={false}
          opacity={0.7}
          zIndex={3}
        />
      </OLContext.Provider>,
    );

    const source = ImageWMSSource.mock.instances[0];
    const layer = ImageLayer.mock.instances[0];
    expect(source.options).toEqual({
      url: 'https://maps.example.com/wms',
      params,
      serverType: 'qgis',
    });
    expect(layer.options).toEqual({ source });
    expect(map.addLayer).toHaveBeenCalledWith(layer);
    expect(layer.setVisible).toHaveBeenCalledWith(false);
    expect(layer.setOpacity).toHaveBeenCalledWith(0.7);
    expect(layer.setZIndex).toHaveBeenCalledWith(3);

    const updatedParams = { LAYERS: 'workspace:buildings' };
    rerender(
      <OLContext.Provider value={map}>
        <ImageWMSLayer
          id="image-wms"
          url="https://maps.example.com/wms"
          params={updatedParams}
          serverType="qgis"
          visible
          opacity={0.2}
          zIndex={6}
        />
      </OLContext.Provider>,
    );
    expect(source.updateParams).toHaveBeenCalledWith(updatedParams);
    expect(ImageWMSSource).toHaveBeenCalledTimes(1);
    expect(layer.setVisible).toHaveBeenLastCalledWith(true);
    expect(layer.setOpacity).toHaveBeenLastCalledWith(0.2);
    expect(layer.setZIndex).toHaveBeenLastCalledWith(6);

    unmount();
    expect(map.removeLayer).toHaveBeenCalledWith(layer);
  });
});

describe('SelectInteraction', () => {
  it('filters by layer, emits the selected FeatureCollection, and cleans up', () => {
    const map = makeMap();
    const setProps = jest.fn();
    const { unmount } = render(
      <OLContext.Provider value={map}>
        <SelectInteraction id="select" layerId="vectors" setProps={setProps} />
      </OLContext.Provider>,
    );

    const select = Select.mock.instances[0];
    const selectedGeoJSONFeature = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [10, 45] },
      properties: { name: 'Station A' },
    };
    const feature = { id: 'selected-feature', geoJSON: selectedGeoJSONFeature };
    select.selectedFeatures.items = [feature];
    expect(
      select.options.layers({ get: (key) => (key === 'dashId' ? 'vectors' : undefined) }),
    ).toBe(true);
    expect(select.options.layers({ get: () => 'other-layer' })).toBe(false);
    expect(map.addInteraction).toHaveBeenCalledWith(select);

    select.listeners.select();
    expect(GeoJSON.mock.instances.at(-1).writeFeaturesObject).toHaveBeenCalledWith([feature], {
      featureProjection: 'EPSG:3857',
      dataProjection: 'EPSG:4326',
    });
    expect(setProps).toHaveBeenCalledWith({
      selectedGeoJSON: { type: 'FeatureCollection', features: [selectedGeoJSONFeature] },
      selectedFeature: selectedGeoJSONFeature,
    });

    select.selectedFeatures.items = [];
    select.listeners.select();
    expect(setProps).toHaveBeenLastCalledWith({
      selectedGeoJSON: { type: 'FeatureCollection', features: [] },
      selectedFeature: null,
    });

    const listenerKey = { event: 'select', listener: select.listeners.select };
    unmount();
    expect(unByKey).toHaveBeenCalledWith(listenerKey);
    expect(map.removeInteraction).toHaveBeenCalledWith(select);
    expect(select.selectedFeatures.clear).toHaveBeenCalled();
  });
});

describe('DrawInteraction', () => {
  it('emits projected GeoJSON and removes its listener, interaction, layer, and source on unmount', () => {
    const map = makeMap();
    const setProps = jest.fn();
    const { unmount } = render(
      <OLContext.Provider value={map}>
        <DrawInteraction geometryType="LineString" setProps={setProps} />
      </OLContext.Provider>,
    );

    const draw = Draw.mock.instances[0];
    const layer = OpenLayersVectorLayer.mock.instances[0];
    const source = VectorSource.mock.instances[0];
    const listenerKey = { event: 'drawend', listener: draw.listeners.drawend };
    expect(draw.options.type).toBe('LineString');
    expect(map.addInteraction).toHaveBeenCalledWith(draw);
    expect(map.addLayer).toHaveBeenCalledWith(layer);

    const feature = {
      id: 'completed-feature',
      geoJSON: {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [10, 45] },
        properties: {},
      },
    };
    source.addFeature(feature);
    draw.listeners.drawend({ feature });
    expect(GeoJSON.mock.instances[0].writeFeatureObject).toHaveBeenCalledWith(feature, {
      featureProjection: 'EPSG:3857',
      dataProjection: 'EPSG:4326',
    });
    expect(setProps).toHaveBeenCalledWith({
      drawnGeoJSON: {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [10, 45] },
        properties: {},
      },
      drawnWKT: 'POINT (10 45)',
      drawnTopoJSON: expect.objectContaining({ type: 'Topology' }),
      drawnFeatures: {
        type: 'FeatureCollection',
        features: [feature.geoJSON],
      },
      geometryValidation: { valid: true, errors: [], suggestions: [] },
    });

    feature.geoJSON.geometry.coordinates = [11, 46];
    const changeFeatureListener = source.on.mock.calls.find(
      ([eventName]) => eventName === 'changefeature',
    )[1];
    changeFeatureListener({ feature });
    expect(setProps).toHaveBeenLastCalledWith({
      drawnFeatures: {
        type: 'FeatureCollection',
        features: [feature.geoJSON],
      },
    });

    const history = getEditHistory(map);
    expect(history.getState()).toEqual({ canUndo: true, canRedo: false });
    history.undo();
    expect(source.removeFeature).toHaveBeenCalledWith(feature);
    expect(setProps).toHaveBeenLastCalledWith({
      drawnGeoJSON: null,
      drawnWKT: null,
      drawnTopoJSON: null,
      drawnFeatures: { type: 'FeatureCollection', features: [] },
    });
    history.redo();
    expect(source.addFeature).toHaveBeenCalledWith(feature);
    expect(setProps).toHaveBeenLastCalledWith({
      drawnGeoJSON: {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [10, 45] },
        properties: {},
      },
      drawnWKT: 'POINT (10 45)',
      drawnTopoJSON: expect.objectContaining({ type: 'Topology' }),
      drawnFeatures: {
        type: 'FeatureCollection',
        features: [feature.geoJSON],
      },
    });

    unmount();
    expect(unByKey).toHaveBeenCalledWith(listenerKey);
    expect(map.removeInteraction).toHaveBeenCalledWith(draw);
    expect(map.removeLayer).toHaveBeenCalledWith(layer);
    expect(source.clear).toHaveBeenCalled();
  });

  it('selects, modifies, and deletes drawn features while publishing edited state', () => {
    const map = makeMap();
    const setProps = jest.fn();
    const createGeometry = (name) => ({
      name,
      getType: () => 'Polygon',
      clone: () => createGeometry(`${name}-clone`),
    });
    let currentGeometry = createGeometry('before');
    const feature = {
      geoJSON: {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [] },
        properties: {},
      },
      getGeometry: () => currentGeometry,
      setGeometry: jest.fn((geometry) => {
        currentGeometry = geometry;
      }),
    };

    const { rerender } = render(
      <OLContext.Provider value={map}>
        <DrawInteraction editMode deleteSelected={0} setProps={setProps} />
      </OLContext.Provider>,
    );

    const source = VectorSource.mock.instances[0];
    source.addFeature(feature);
    const select = Select.mock.instances[0];
    const modify = Modify.mock.instances[0];
    const selectedFeatures = select.getFeatures();
    selectedFeatures.items = [feature];
    select.listeners.select();
    expect(setProps).toHaveBeenLastCalledWith({
      editedFeature: {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [10, 45] },
        properties: {},
      },
    });

    modify.listeners.modifystart({ features: selectedFeatures });
    currentGeometry = createGeometry('after');
    const changeFeatureListener = source.on.mock.calls.find(
      ([eventName]) => eventName === 'changefeature',
    )[1];
    changeFeatureListener({ feature });
    expect(setProps).toHaveBeenLastCalledWith({
      drawnFeatures: {
        type: 'FeatureCollection',
        features: [feature.geoJSON],
      },
      editedFeature: {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [10, 45] },
        properties: {},
      },
    });
    modify.listeners.modifyend({ features: selectedFeatures });
    expect(setProps).toHaveBeenLastCalledWith({
      drawnFeatures: {
        type: 'FeatureCollection',
        features: [feature.geoJSON],
      },
      editedFeature: {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [10, 45] },
        properties: {},
      },
    });
    expect(getEditHistory(map).getState()).toEqual({ canUndo: true, canRedo: false });
    getEditHistory(map).undo();
    expect(feature.setGeometry).toHaveBeenCalled();

    rerender(
      <OLContext.Provider value={map}>
        <DrawInteraction editMode deleteSelected={1} setProps={setProps} />
      </OLContext.Provider>,
    );
    expect(source.removeFeature).toHaveBeenCalledWith(feature);
    expect(setProps).toHaveBeenLastCalledWith({
      drawnFeatures: { type: 'FeatureCollection', features: [] },
      editedFeature: null,
    });
    expect(map.addInteraction).toHaveBeenCalledWith(select);
    expect(map.addInteraction).toHaveBeenCalledWith(modify);
    expect(map.addInteraction).toHaveBeenCalledWith(Snap.mock.instances.at(-1));
  });

  it('blocks self-intersecting polygons and reports their crossing coordinates', () => {
    const map = makeMap();
    const setProps = jest.fn();
    render(
      <OLContext.Provider value={map}>
        <DrawInteraction geometryType="Polygon" setProps={setProps} />
      </OLContext.Provider>,
    );

    const feature = { id: 'invalid-polygon' };
    const source = VectorSource.mock.instances[0];
    source.addFeature(feature);
    GeoJSON.mockImplementationOnce(function MockGeoJSON() {
      this.writeFeatureObject = jest.fn(() => ({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [2, 2],
              [0, 2],
              [2, 0],
              [0, 0],
            ],
          ],
        },
      }));
    });

    Draw.mock.instances[0].listeners.drawend({ feature });

    expect(source.removeFeature).toHaveBeenCalledWith(feature);
    expect(setProps).toHaveBeenCalledWith({
      drawnGeoJSON: null,
      drawnWKT: null,
      drawnTopoJSON: null,
      drawnFeatures: { type: 'FeatureCollection', features: [] },
      geometryValidation: {
        valid: false,
        errors: [{ code: 'self_intersection', coordinates: [1, 1] }],
        suggestions: ['Move the reported vertices so polygon boundaries do not cross.'],
      },
    });
  });

  it('exports drawn circles as GeoJSON-compatible polygons', () => {
    const map = makeMap();
    const setProps = jest.fn();
    const circleGeometry = { getType: jest.fn(() => 'Circle') };
    const polygonGeometry = { getType: jest.fn(() => 'Polygon') };
    const exportableFeature = {
      geoJSON: {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [] },
        properties: {},
      },
      setGeometry: jest.fn(),
    };
    const feature = {
      getGeometry: jest.fn(() => circleGeometry),
      clone: jest.fn(() => exportableFeature),
    };
    fromCircle.mockReturnValue(polygonGeometry);

    render(
      <OLContext.Provider value={map}>
        <DrawInteraction geometryType="Circle" setProps={setProps} />
      </OLContext.Provider>,
    );

    const source = VectorSource.mock.instances[0];
    source.addFeature(feature);
    Draw.mock.instances[0].listeners.drawend({ feature });

    expect(fromCircle).toHaveBeenCalledWith(circleGeometry);
    expect(exportableFeature.setGeometry).toHaveBeenCalledWith(polygonGeometry);
    expect(GeoJSON.mock.instances[0].writeFeatureObject).toHaveBeenCalledWith(exportableFeature, {
      featureProjection: 'EPSG:3857',
      dataProjection: 'EPSG:4326',
    });
    expect(setProps).toHaveBeenCalledWith(
      expect.objectContaining({
        drawnFeatures: {
          type: 'FeatureCollection',
          features: [exportableFeature.geoJSON],
        },
      }),
    );
  });

  it('blocks open polygon rings and suggests closing the ring', () => {
    const map = makeMap();
    const setProps = jest.fn();
    render(
      <OLContext.Provider value={map}>
        <DrawInteraction geometryType="Polygon" setProps={setProps} />
      </OLContext.Provider>,
    );

    const feature = { id: 'open-ring' };
    const source = VectorSource.mock.instances[0];
    source.addFeature(feature);
    GeoJSON.mockImplementationOnce(function MockGeoJSON() {
      this.writeFeatureObject = jest.fn(() => ({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [2, 0],
              [2, 2],
              [0, 2],
            ],
          ],
        },
      }));
    });

    Draw.mock.instances[0].listeners.drawend({ feature });

    expect(source.removeFeature).toHaveBeenCalledWith(feature);
    expect(setProps).toHaveBeenCalledWith({
      drawnGeoJSON: null,
      drawnWKT: null,
      drawnTopoJSON: null,
      drawnFeatures: { type: 'FeatureCollection', features: [] },
      geometryValidation: {
        valid: false,
        errors: [{ code: 'invalid_geometry' }],
        suggestions: [
          'Close each ring, provide at least four positions, and keep holes inside the outer ring without overlap.',
        ],
      },
    });
  });
});

describe('DrawControl', () => {
  it('activates rectangle drawing, reports GeoJSON, and preserves features when deactivated', async () => {
    const map = makeMap();
    const setProps = jest.fn();
    const { unmount } = render(
      <OLContext.Provider value={map}>
        <DrawControl id="study-area" setProps={setProps} />
      </OLContext.Provider>,
    );

    expect(map.addControl).toHaveBeenCalledTimes(1);
    expect(Draw).not.toHaveBeenCalled();
    const controlElement = map.addControl.mock.calls[0][0].element;
    const rectangleButton = controlElement.querySelector('[data-geometry-type="Box"]');
    fireEvent.click(rectangleButton);

    const draw = Draw.mock.instances[0];
    const source = VectorSource.mock.instances.at(-1);
    const layer = OpenLayersVectorLayer.mock.instances.at(-1);
    expect(draw.options.type).toBe('Circle');
    expect(draw.options.geometryFunction).toEqual(expect.any(Function));
    expect(createBox).toHaveBeenCalledTimes(1);
    expect(map.addInteraction).toHaveBeenCalledWith(draw);

    const feature = {
      id: 'study-area',
      geoJSON: {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [10, 45] },
        properties: {},
      },
    };
    source.addFeature(feature);
    draw.listeners.drawend({ feature });
    expect(setProps).toHaveBeenCalledWith(
      expect.objectContaining({
        drawnGeoJSON: expect.objectContaining({ type: 'Feature' }),
        drawnFeatures: {
          type: 'FeatureCollection',
          features: [feature.geoJSON],
        },
      }),
    );

    fireEvent.click(rectangleButton);
    await waitFor(() => expect(rectangleButton).toHaveAttribute('aria-pressed', 'false'));
    await waitFor(() => expect(map.removeInteraction).toHaveBeenCalledWith(draw));
    expect(map.removeLayer).not.toHaveBeenCalledWith(layer);
    expect(source.clear).not.toHaveBeenCalled();

    unmount();
    expect(map.removeControl).toHaveBeenCalledTimes(1);
    expect(map.removeLayer).toHaveBeenCalledWith(layer);
    expect(source.clear).toHaveBeenCalled();
  });

  it('supports controlled draw modes and customizable toolbar and button styles', () => {
    const map = makeMap();
    const setProps = jest.fn();
    const geometryTypes = ['Circle', 'Point'];
    const style = { background: 'navy' };
    const buttonStyle = { borderRadius: '12px' };
    const { rerender } = render(
      <OLContext.Provider value={map}>
        <DrawControl
          geometryTypes={geometryTypes}
          activeDrawMode="Circle"
          position="bottom-right"
          style={style}
          buttonStyle={buttonStyle}
          setProps={setProps}
        />
      </OLContext.Provider>,
    );

    const controlElement = map.addControl.mock.calls[0][0].element;
    const circleButton = controlElement.querySelector('[data-geometry-type="Circle"]');
    const pointButton = controlElement.querySelector('[data-geometry-type="Point"]');
    expect(circleButton).toHaveAttribute('aria-pressed', 'true');
    expect(controlElement.style.background).toBe('navy');
    expect(circleButton.style.borderRadius).toBe('12px');
    expect(controlElement.style.bottom).toBe('0.5em');
    expect(controlElement.style.right).toBe('0.5em');
    expect(Draw.mock.instances[0].options.type).toBe('Circle');

    fireEvent.click(circleButton);
    expect(setProps).toHaveBeenCalledWith({ activeDrawMode: null });
    rerender(
      <OLContext.Provider value={map}>
        <DrawControl
          geometryTypes={geometryTypes}
          activeDrawMode={null}
          position="bottom-right"
          style={style}
          buttonStyle={buttonStyle}
          setProps={setProps}
        />
      </OLContext.Provider>,
    );
    expect(controlElement.querySelector('[data-geometry-type="Circle"]')).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    fireEvent.click(controlElement.querySelector('[data-geometry-type="Point"]'));
    expect(setProps).toHaveBeenLastCalledWith({ activeDrawMode: 'Point' });
  });

  it('selects and deletes drawn features from the edit toolbar', async () => {
    const map = makeMap();
    const setProps = jest.fn();
    render(
      <OLContext.Provider value={map}>
        <DrawControl id="editable-drawings" setProps={setProps} />
      </OLContext.Provider>,
    );

    const control = map.addControl.mock.calls[0][0];
    const editButton = control.element.querySelector('[data-edit-mode]');
    const deleteButton = control.element.querySelector('[data-delete-selected]');
    fireEvent.click(editButton);

    const source = VectorSource.mock.instances[0];
    const select = Select.mock.instances[0];
    const modify = Modify.mock.instances[0];
    const feature = {
      geoJSON: {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [] },
        properties: {},
      },
    };
    source.addFeature(feature);
    select.selectedFeatures.items = [feature];
    select.listeners.select();
    expect(deleteButton.disabled).toBe(false);
    expect(setProps).toHaveBeenLastCalledWith({
      editedFeature: {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [10, 45] },
        properties: {},
      },
    });

    fireEvent.click(deleteButton);
    await waitFor(() => expect(source.removeFeature).toHaveBeenCalledWith(feature));
    expect(setProps).toHaveBeenLastCalledWith({
      drawnFeatures: { type: 'FeatureCollection', features: [] },
      editedFeature: null,
    });
    expect(select.options.layers).toContain(OpenLayersVectorLayer.mock.instances[0]);
    expect(modify.options.features).toBe(select.selectedFeatures);
  });
});

describe('MeasureControl', () => {
  it('updates live geodesic distance in selected units and clears from its toolbar', () => {
    const map = makeMap();
    const { unmount, rerender } = render(
      <OLContext.Provider value={map}>
        <MeasureControl id="measure" units="metric" clearMeasurements={0} />
      </OLContext.Provider>,
    );

    const control = map.addControl.mock.calls[0][0];
    const distanceButton = control.element.querySelector('[data-measure-type="LineString"]');
    fireEvent.click(distanceButton);

    const draw = Draw.mock.instances[0];
    const source = VectorSource.mock.instances[0];
    const geometry = {
      listeners: {},
      getCoordinates: () => [
        [0, 0],
        [1, 1],
      ],
      on: jest.fn((event, listener) => {
        geometry.listeners[event] = listener;
        return { event, listener };
      }),
    };
    draw.listeners.drawstart({ feature: { getGeometry: () => geometry } });

    const overlay = Overlay.mock.instances[0];
    const projection = 'EPSG:3857';
    expect(draw.options).toMatchObject({ type: 'LineString' });
    expect(getLength).toHaveBeenCalledWith(geometry, { projection });
    expect(overlay.options.element.textContent).toBe('1.50 km');
    expect(overlay.setPosition).toHaveBeenCalledWith([1, 1]);

    getLength.mockReturnValue(2500);
    geometry.listeners.change();
    expect(overlay.options.element.textContent).toBe('2.50 km');

    rerender(
      <OLContext.Provider value={map}>
        <MeasureControl id="measure" units="imperial" clearMeasurements={0} />
      </OLContext.Provider>,
    );
    expect(overlay.options.element.textContent).toBe('1.55 mi');

    draw.listeners.drawend();
    expect(overlay.options.element.className).toContain('static');
    fireEvent.click(control.element.querySelector('[data-clear-measurements="true"]'));
    expect(map.removeOverlay).toHaveBeenCalledWith(overlay);
    expect(source.clear).toHaveBeenCalled();
    expect(map.removeInteraction).toHaveBeenCalledWith(draw);

    unmount();
    expect(map.removeLayer).toHaveBeenCalledWith(OpenLayersVectorLayer.mock.instances[0]);
    expect(map.removeControl).toHaveBeenCalledWith(control);
  });

  it('measures polygon area and clears completed measurements when the prop changes', () => {
    const map = makeMap();
    const { rerender } = render(
      <OLContext.Provider value={map}>
        <MeasureControl units="metric" clearMeasurements={0} />
      </OLContext.Provider>,
    );

    const control = map.addControl.mock.calls[0][0];
    fireEvent.click(control.element.querySelector('[data-measure-type="Polygon"]'));
    const draw = Draw.mock.instances[0];
    const geometry = {
      getCoordinates: () => [
        [
          [0, 0],
          [0, 1],
          [1, 1],
        ],
      ],
      on: jest.fn((event, listener) => ({ event, listener })),
    };
    draw.listeners.drawstart({ feature: { getGeometry: () => geometry } });

    const overlay = Overlay.mock.instances[0];
    expect(draw.options).toMatchObject({ type: 'Polygon' });
    expect(getArea).toHaveBeenCalledWith(geometry, { projection: 'EPSG:3857' });
    expect(overlay.options.element.textContent).toBe('2.50 ha');

    rerender(
      <OLContext.Provider value={map}>
        <MeasureControl units="imperial" clearMeasurements={0} />
      </OLContext.Provider>,
    );
    expect(overlay.options.element.textContent).toBe('6.18 acres');
    draw.listeners.drawend();

    rerender(
      <OLContext.Provider value={map}>
        <MeasureControl units="imperial" clearMeasurements={1} />
      </OLContext.Provider>,
    );
    expect(map.removeOverlay).toHaveBeenCalledWith(overlay);
    expect(VectorSource.mock.instances[0].clear).toHaveBeenCalled();
    expect(map.removeInteraction).toHaveBeenCalledWith(draw);
  });
});
