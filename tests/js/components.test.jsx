import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import MapComponent from '../../src/lib/components/Map.react';
import TileLayer from '../../src/lib/components/TileLayer.react';
import VectorLayer from '../../src/lib/components/VectorLayer.react';
import VectorTileLayer from '../../src/lib/components/VectorTileLayer.react';
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
import Snap from 'ol/interaction/Snap';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import View from 'ol/View';
import { toLonLat } from 'ol/proj';
import { registerProjections } from '../../src/lib/utils/projection';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import Select from 'ol/interaction/Select';
import { unByKey } from 'ol/Observable';
import Tile from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON';
import WKT from 'ol/format/WKT';
import Cluster from 'ol/source/Cluster';
import OpenLayersVectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import MVT from 'ol/format/MVT';
import OpenLayersVectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import WMTS, { optionsFromCapabilities } from 'ol/source/WMTS';
import ImageLayer from 'ol/layer/Image';
import TileWMSSource from 'ol/source/TileWMS';
import ImageWMSSource from 'ol/source/ImageWMS';

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
    this.on = jest.fn((event, listener) => {
      this.listeners[event] = listener;
    });
    this.setTarget = jest.fn();
    this.addLayer = jest.fn();
    this.removeLayer = jest.fn();
    this.addOverlay = jest.fn();
    this.removeOverlay = jest.fn();
    this.getView = jest.fn(() => options.view);
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
    this.getCenter = jest.fn(() => this.center);
    this.setCenter = jest.fn((center) => {
      this.center = center;
    });
    this.getZoom = jest.fn(() => this.zoom);
    this.setZoom = jest.fn((zoom) => {
      this.zoom = zoom;
    });
  }),
}));

jest.mock('ol/proj', () => ({
  toLonLat: jest.fn((coordinate) => [coordinate[0] + 1, coordinate[1] + 2]),
}));

jest.mock('../../src/lib/utils/projection', () => ({
  registerProjections: jest.fn(),
}));

jest.mock('ol/layer/Tile', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockTile(options) {
    this.options = options;
    this.set = jest.fn();
  }),
}));

jest.mock('ol/layer/Image', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockImageLayer(options) {
    this.options = options;
    this.set = jest.fn();
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
    this.writeFeaturesObject = jest.fn(() => ({ type: 'FeatureCollection', features: [] }));
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

jest.mock('ol/interaction/Draw', () => ({
  __esModule: true,
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
    this.set = jest.fn((key, value) => {
      this.properties[key] = value;
    });
    this.get = jest.fn((key) => this.properties[key]);
    this.setSource = jest.fn();
    this.styleFunction = jest.fn(() => [{ name: 'base-style' }]);
    this.getStyleFunction = jest.fn(() => this.styleFunction);
    this.setStyle = jest.fn((style) => {
      if (typeof style === 'function') this.styleFunction = style;
    });
  }),
}));

jest.mock('ol/style/Circle', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockCircleStyle(options) {
    this.options = options;
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
    this.clear = jest.fn();
    this.addFeatures = jest.fn();
    this.addFeature = jest.fn();
    this.removeFeature = jest.fn();
    this.getFeatures = jest.fn(() => []);
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
    this.setStyle = jest.fn();
  }),
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
  });

  it('rejects unsupported input formats', () => {
    expect(() => readFeatures('{}', { format: 'TopoJSON' })).toThrow(
      'Unsupported feature format: TopoJSON',
    );
  });
});

const makeMap = () => ({
  addLayer: jest.fn(),
  removeLayer: jest.fn(),
  addOverlay: jest.fn(),
  removeOverlay: jest.fn(),
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

  it('applies center and zoom prop changes and reports moveend state', () => {
    const setProps = jest.fn();
    const { rerender } = render(
      <MapComponent id="map" center={[0, 0]} zoom={2} setProps={setProps} />,
    );
    const map = Map.mock.instances[0];
    const view = View.mock.instances[0];

    rerender(<MapComponent id="map" center={[10, 20]} zoom={4} setProps={setProps} />);
    expect(view.setCenter).toHaveBeenCalledWith([10, 20]);
    expect(view.setZoom).toHaveBeenCalledWith(4);

    map.listeners.moveend();
    expect(setProps).toHaveBeenCalledWith({ center: [10, 20], zoom: 4 });
  });

  it('transforms click coordinates and emits clickData', () => {
    const setProps = jest.fn();
    render(
      <MapComponent id="map" center={[0, 0]} zoom={2} projection="EPSG:4326" setProps={setProps} />,
    );

    Map.mock.instances[0].listeners.singleclick({ coordinate: [3, 4] });
    expect(toLonLat).toHaveBeenCalledWith([3, 4], 'EPSG:4326');
    expect(setProps).toHaveBeenCalledWith({
      clickData: { coordinate: [3, 4], latLon: [6, 4] },
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

    unmount();
    expect(map.removeLayer).toHaveBeenCalledWith(layer);
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

describe('VectorLayer', () => {
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
      dataProjection: 'EPSG:4326',
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
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });

    unmount();
    expect(map.removeLayer).toHaveBeenCalledWith(layer);
    expect(source.clear).toHaveBeenCalledTimes(3);
  });

  it('loads WKT input in the map projection ahead of GeoJSON input', () => {
    const map = makeMap();
    const wkt = 'POINT (10 45)';
    render(
      <OLContext.Provider value={map}>
        <VectorLayer
          id="features"
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
          setProps={setProps}
        />
      </OLContext.Provider>,
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
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
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue('<Capabilities />'),
    });
    optionsFromCapabilities.mockReturnValue(sourceOptions);

    const { unmount } = render(
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
          dimensions={{ TIME: '2026-01-01' }}
          attributions="Tile provider"
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

    const updatedParams = { LAYERS: 'workspace:parcels', STYLES: 'outline' };
    rerender(
      <OLContext.Provider value={map}>
        <TileWMSLayer
          id="tile-wms"
          url="https://maps.example.com/geoserver/wms"
          params={updatedParams}
          serverType="geoserver"
        />
      </OLContext.Provider>,
    );
    expect(source.updateParams).toHaveBeenCalledWith(updatedParams);
    expect(TileWMSSource).toHaveBeenCalledTimes(1);

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

    const updatedParams = { LAYERS: 'workspace:buildings' };
    rerender(
      <OLContext.Provider value={map}>
        <ImageWMSLayer
          id="image-wms"
          url="https://maps.example.com/wms"
          params={updatedParams}
          serverType="qgis"
        />
      </OLContext.Provider>,
    );
    expect(source.updateParams).toHaveBeenCalledWith(updatedParams);
    expect(ImageWMSSource).toHaveBeenCalledTimes(1);

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
    const feature = { id: 'selected-feature' };
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
      selectedGeoJSON: { type: 'FeatureCollection', features: [] },
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

    const feature = { id: 'completed-feature' };
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
      geometryValidation: { valid: true, errors: [], suggestions: [] },
    });

    const history = getEditHistory(map);
    expect(history.getState()).toEqual({ canUndo: true, canRedo: false });
    history.undo();
    expect(source.removeFeature).toHaveBeenCalledWith(feature);
    expect(setProps).toHaveBeenLastCalledWith({
      drawnGeoJSON: null,
      drawnWKT: null,
      drawnTopoJSON: null,
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
    });

    unmount();
    expect(unByKey).toHaveBeenCalledWith(listenerKey);
    expect(map.removeInteraction).toHaveBeenCalledWith(draw);
    expect(map.removeLayer).toHaveBeenCalledWith(layer);
    expect(source.clear).toHaveBeenCalled();
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
      geometryValidation: {
        valid: false,
        errors: [{ code: 'self_intersection', coordinates: [1, 1] }],
        suggestions: ['Move the reported vertices so polygon boundaries do not cross.'],
      },
    });
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
