import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Control from 'ol/control/Control';
import Draw from 'ol/interaction/Draw';
import Overlay from 'ol/Overlay';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import { getArea, getLength } from 'ol/sphere';
import { unByKey } from 'ol/Observable';
import { useMap } from '../context/OLContext';

const formatNumber = (value) => value.toFixed(2);

const formatLength = (meters, units) => {
  if (units === 'imperial') {
    const feet = meters / 0.3048;
    return feet >= 5280 ? `${formatNumber(feet / 5280)} mi` : `${formatNumber(feet)} ft`;
  }
  return meters >= 1000 ? `${formatNumber(meters / 1000)} km` : `${formatNumber(meters)} m`;
};

const formatArea = (squareMeters, units) => {
  if (units === 'imperial') {
    return `${formatNumber(squareMeters / 4046.8564224)} acres`;
  }
  if (squareMeters >= 1_000_000) {
    return `${formatNumber(squareMeters / 1_000_000)} km²`;
  }
  if (squareMeters >= 10_000) {
    return `${formatNumber(squareMeters / 10_000)} ha`;
  }
  return `${formatNumber(squareMeters)} m²`;
};

const getLastCoordinate = (geometry, type) => {
  const coordinates = geometry.getCoordinates();
  return type === 'LineString'
    ? coordinates[coordinates.length - 1]
    : coordinates[0]?.[coordinates[0].length - 1];
};

/** Draw lines and polygons with live geodesic length and area measurements. */
const MeasureControl = ({
  id,
  units = 'metric',
  clearMeasurements = 0,
  position = 'top-left',
  title = 'Measure',
  style,
}) => {
  const map = useMap();
  const unitsRef = useRef(units);
  const clearMeasurementsRef = useRef(() => {});
  const refreshMeasurementsRef = useRef(() => {});
  const updateButtonsRef = useRef(() => {});
  const activateModeRef = useRef(() => {});
  const activeModeRef = useRef(null);
  const previousClearMeasurementsRef = useRef(clearMeasurements);

  useEffect(() => {
    unitsRef.current = units;
    refreshMeasurementsRef.current();
  }, [units]);

  useEffect(() => {
    if (previousClearMeasurementsRef.current !== clearMeasurements) {
      previousClearMeasurementsRef.current = clearMeasurements;
      clearMeasurementsRef.current();
    }
  }, [clearMeasurements]);

  useEffect(() => {
    const source = new VectorSource();
    const layer = new VectorLayer({
      source,
      style: new Style({
        fill: new Fill({ color: 'rgba(31, 106, 94, 0.15)' }),
        stroke: new Stroke({ color: '#1f6a5e', width: 2, lineDash: [8, 4] }),
      }),
    });
    map.addLayer(layer);

    const measurements = [];
    let draw = null;
    let drawListenerKeys = [];
    let geometryListenerKey = null;
    let activeMeasurement = null;

    const updateMeasurement = (measurement) => {
      const projection = map.getView().getProjection();
      const value =
        measurement.type === 'LineString'
          ? formatLength(getLength(measurement.geometry, { projection }), unitsRef.current)
          : formatArea(getArea(measurement.geometry, { projection }), unitsRef.current);
      measurement.element.textContent = value;

      const coordinate = getLastCoordinate(measurement.geometry, measurement.type);
      if (coordinate?.length) measurement.overlay.setPosition(coordinate);
    };

    const updateAllMeasurements = () => {
      measurements.forEach(updateMeasurement);
      if (activeMeasurement) updateMeasurement(activeMeasurement);
    };

    const stopDrawing = () => {
      if (geometryListenerKey) {
        unByKey(geometryListenerKey);
        geometryListenerKey = null;
      }
      if (activeMeasurement) {
        map.removeOverlay(activeMeasurement.overlay);
        activeMeasurement = null;
      }
      if (draw) {
        unByKey(drawListenerKeys);
        drawListenerKeys = [];
        map.removeInteraction(draw);
        draw = null;
      }
    };

    const clearAllMeasurements = () => {
      stopDrawing();
      activeModeRef.current = null;
      updateButtonsRef.current(null);
      measurements.forEach(({ overlay }) => map.removeOverlay(overlay));
      measurements.length = 0;
      source.clear();
    };

    const startDrawing = (type) => {
      draw = new Draw({ source, type });
      drawListenerKeys = [
        draw.on('drawstart', ({ feature }) => {
          const geometry = feature.getGeometry();
          const element = document.createElement('div');
          element.className = 'ol-measure-tooltip ol-measure-tooltip-active';
          element.setAttribute('role', 'status');
          Object.assign(element.style, {
            padding: '3px 6px',
            color: '#182522',
            background: 'rgba(255, 255, 255, 0.96)',
            border: '1px solid #1f6a5e',
            borderRadius: '3px',
            boxShadow: '0 1px 4px rgba(20, 35, 31, 0.2)',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          });
          const overlay = new Overlay({
            element,
            offset: [0, -12],
            positioning: 'bottom-center',
            stopEvent: false,
          });
          activeMeasurement = { type, geometry, element, overlay };
          map.addOverlay(overlay);
          geometryListenerKey = geometry.on('change', () => updateMeasurement(activeMeasurement));
          updateMeasurement(activeMeasurement);
        }),
        draw.on('drawend', () => {
          if (!activeMeasurement) return;
          if (geometryListenerKey) {
            unByKey(geometryListenerKey);
            geometryListenerKey = null;
          }
          updateMeasurement(activeMeasurement);
          activeMeasurement.element.className = 'ol-measure-tooltip ol-measure-tooltip-static';
          measurements.push(activeMeasurement);
          activeMeasurement = null;
        }),
      ];
      map.addInteraction(draw);
    };

    const activateMode = (type) => {
      if (activeModeRef.current === type) {
        stopDrawing();
        activeModeRef.current = null;
      } else {
        stopDrawing();
        activeModeRef.current = type;
        startDrawing(type);
      }
      updateButtonsRef.current(activeModeRef.current);
    };

    activateModeRef.current = activateMode;
    clearMeasurementsRef.current = clearAllMeasurements;
    refreshMeasurementsRef.current = updateAllMeasurements;

    return () => {
      clearAllMeasurements();
      activateModeRef.current = () => {};
      clearMeasurementsRef.current = () => {};
      refreshMeasurementsRef.current = () => {};
      map.removeLayer(layer);
      source.clear();
    };
  }, [map]);

  useEffect(() => {
    const element = document.createElement('div');
    element.className = 'ol-control ol-unselectable';
    if (id) element.id = id;
    Object.assign(
      element.style,
      Object.fromEntries(position.split('-').map((side) => [side, '0.5em'])),
      {
        maxWidth: 'min(320px, calc(100% - 1em))',
        padding: '6px',
        color: '#182522',
        background: 'rgba(255, 255, 255, 0.96)',
        border: '1px solid #778581',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(20, 35, 31, 0.18)',
        ...style,
      },
    );

    const toolbar = document.createElement('div');
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', title);
    Object.assign(toolbar.style, { display: 'flex', gap: '4px', alignItems: 'center' });
    if (title) {
      const heading = document.createElement('span');
      heading.textContent = title;
      Object.assign(heading.style, { margin: '0 4px', fontSize: '13px', fontWeight: '600' });
      toolbar.appendChild(heading);
    }

    const modeButtons = [];
    const updateButtons = (activeMode) => {
      modeButtons.forEach(([button, mode]) => {
        const isActive = mode === activeMode;
        button.setAttribute('aria-pressed', String(isActive));
        button.style.color = isActive ? '#ffffff' : '#182522';
        button.style.background = isActive ? '#1f6a5e' : '#ffffff';
      });
    };
    updateButtonsRef.current = updateButtons;

    const listeners = [];
    const createButton = (label, accessibleName, handler) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.title = accessibleName;
      button.setAttribute('aria-label', accessibleName);
      Object.assign(button.style, {
        minHeight: '32px',
        padding: '4px 8px',
        color: '#182522',
        background: '#ffffff',
        border: '1px solid #778581',
        borderRadius: '3px',
        cursor: 'pointer',
      });
      button.addEventListener('click', handler);
      listeners.push([button, handler]);
      return button;
    };

    [
      ['LineString', 'Distance'],
      ['Polygon', 'Area'],
    ].forEach(([type, label]) => {
      const button = createButton(label, `Measure ${label.toLowerCase()}`, () =>
        activateModeRef.current(type),
      );
      button.dataset.measureType = type;
      modeButtons.push([button, type]);
      toolbar.appendChild(button);
    });
    const clearButton = createButton('Clear', 'Clear measurements', () =>
      clearMeasurementsRef.current(),
    );
    clearButton.dataset.clearMeasurements = 'true';
    toolbar.appendChild(clearButton);
    element.appendChild(toolbar);

    const control = new Control({ element });
    map.addControl(control);
    updateButtons(activeModeRef.current);

    return () => {
      listeners.forEach(([button, listener]) => button.removeEventListener('click', listener));
      map.removeControl(control);
      updateButtonsRef.current = () => {};
    };
  }, [map, id, position, title, style]);

  return null;
};

MeasureControl.defaultProps = {
  units: 'metric',
  clearMeasurements: 0,
  position: 'top-left',
  title: 'Measure',
};

MeasureControl.propTypes = {
  /** Component ID used to identify this measurement control in Dash. */
  id: PropTypes.string,
  /** Measurement units: metric uses meters, kilometers, and hectares; imperial uses feet, miles, and acres. */
  units: PropTypes.oneOf(['metric', 'imperial']),
  /** Increment to clear all completed and in-progress measurements. */
  clearMeasurements: PropTypes.number,
  /** Corner of the map where the measurement toolbar is displayed. */
  position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right']),
  /** Accessible toolbar label and visible heading. */
  title: PropTypes.string,
  /** Inline styles applied to the toolbar control container. */
  style: PropTypes.object,
};

export default MeasureControl;
