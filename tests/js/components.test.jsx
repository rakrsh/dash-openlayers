import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import MapComponent from '../../src/lib/components/Map.react';
import TileLayer from '../../src/lib/components/TileLayer.react';
import VectorLayer from '../../src/lib/components/VectorLayer.react';
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

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

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
