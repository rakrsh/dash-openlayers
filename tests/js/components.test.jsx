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
import { OLContext, useMap } from '../../src/lib/context/OLContext';
import Map from 'ol/Map';
import View from 'ol/View';
import { toLonLat } from 'ol/proj';
import { registerProjections } from '../../src/lib/utils/projection';
import Draw from 'ol/interaction/Draw';
import { unByKey } from 'ol/Observable';
import Tile from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON';
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
    this.getView = jest.fn(() => options.view);
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

jest.mock('ol/Observable', () => ({
  unByKey: jest.fn(),
}));

jest.mock('ol/layer/Vector', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockVectorLayer(options) {
    this.options = options;
    this.set = jest.fn();
  }),
}));

jest.mock('ol/source/Vector', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(function MockVectorSource() {
    this.clear = jest.fn();
    this.addFeatures = jest.fn();
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

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
  if (originalFetch === undefined) {
    delete global.fetch;
  } else {
    global.fetch = originalFetch;
  }
});

const originalFetch = global.fetch;

const makeMap = () => ({
  addLayer: jest.fn(),
  removeLayer: jest.fn(),
  addInteraction: jest.fn(),
  removeInteraction: jest.fn(),
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
    const { unmount } = render(
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
    const format = GeoJSON.mock.instances[0];
    expect(layer.set).toHaveBeenCalledWith('dashId', 'features');
    expect(map.addLayer).toHaveBeenCalledWith(layer);
    expect(format.readFeatures).toHaveBeenCalledWith(initialGeoJSON, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });
    expect(source.addFeatures).toHaveBeenCalledWith(format.features);

    rerender(
      <OLContext.Provider value={map}>
        <VectorLayer id="features" geojson={updatedGeoJSON} />
      </OLContext.Provider>,
    );
    expect(source.clear).toHaveBeenCalledTimes(2);
    expect(format.readFeatures).toHaveBeenLastCalledWith(updatedGeoJSON, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });

    unmount();
    expect(map.removeLayer).toHaveBeenCalledWith(layer);
    expect(source.clear).toHaveBeenCalledTimes(3);
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
    });

    unmount();
    expect(unByKey).toHaveBeenCalledWith(listenerKey);
    expect(map.removeInteraction).toHaveBeenCalledWith(draw);
    expect(map.removeLayer).toHaveBeenCalledWith(layer);
    expect(source.clear).toHaveBeenCalled();
  });
});
