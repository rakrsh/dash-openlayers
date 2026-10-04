import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Control from 'ol/control/Control';
import { useMap } from '../context/OLContext';
import DrawInteraction from './DrawInteraction.react';

const TOOL_LABELS = {
  Point: 'Point',
  LineString: 'Line',
  Polygon: 'Polygon',
  Box: 'Rectangle',
};
const DEFAULT_GEOMETRY_TYPES = ['Point', 'LineString', 'Polygon', 'Box'];

/** Add map controls for drawing and serializing spatial study areas. */
const DrawControl = ({
  id,
  geometryTypes = DEFAULT_GEOMETRY_TYPES,
  position = 'top-left',
  title = 'Draw',
  snapToVertex = true,
  snapToEdge = true,
  snapTolerance = 10,
  setProps,
}) => {
  const map = useMap();
  const controlElementRef = React.useRef(null);
  const [activeGeometryType, setActiveGeometryType] = useState(null);

  useEffect(() => {
    if (!map) return undefined;

    const element = document.createElement('div');
    const toolbar = document.createElement('div');
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', title);
    Object.assign(toolbar.style, {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px',
      alignItems: 'center',
    });
    element.className = 'ol-control ol-unselectable';
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
      },
    );

    if (title) {
      const heading = document.createElement('span');
      heading.textContent = title;
      Object.assign(heading.style, { margin: '0 4px', fontSize: '13px', fontWeight: '600' });
      toolbar.appendChild(heading);
    }

    const buttonListeners = [];
    geometryTypes.forEach((geometryType) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.geometryType = geometryType;
      button.setAttribute('aria-label', `Draw ${TOOL_LABELS[geometryType]}`);
      button.setAttribute('aria-pressed', 'false');
      button.title = `Draw ${TOOL_LABELS[geometryType]}`;
      button.textContent = TOOL_LABELS[geometryType];
      Object.assign(button.style, {
        minHeight: '32px',
        padding: '4px 8px',
        color: '#182522',
        background: '#ffffff',
        border: '1px solid #778581',
        borderRadius: '3px',
        cursor: 'pointer',
      });
      const listener = () => {
        setActiveGeometryType((current) => (current === geometryType ? null : geometryType));
      };
      button.addEventListener('click', listener);
      buttonListeners.push([button, listener]);
      toolbar.appendChild(button);
    });
    element.appendChild(toolbar);

    const control = new Control({ element });
    map.addControl(control);
    controlElementRef.current = element;

    return () => {
      map.removeControl(control);
      buttonListeners.forEach(([button, listener]) =>
        button.removeEventListener('click', listener),
      );
      controlElementRef.current = null;
    };
  }, [map, position, title, geometryTypes]);

  useEffect(() => {
    const buttons = controlElementRef.current?.querySelectorAll('button[data-geometry-type]') ?? [];
    buttons.forEach((button) => {
      const isActive = button.dataset.geometryType === activeGeometryType;
      button.setAttribute('aria-pressed', String(isActive));
      button.style.color = isActive ? '#ffffff' : '#182522';
      button.style.background = isActive ? '#1f6a5e' : '#ffffff';
    });
  }, [activeGeometryType]);

  return (
    <>
      <DrawInteraction
        id={id ? `${id}-interaction` : undefined}
        geometryType={activeGeometryType}
        snapToVertex={snapToVertex}
        snapToEdge={snapToEdge}
        snapTolerance={snapTolerance}
        setProps={setProps}
      />
    </>
  );
};

DrawControl.defaultProps = {
  geometryTypes: DEFAULT_GEOMETRY_TYPES,
  position: 'top-left',
  title: 'Draw',
  snapToVertex: true,
  snapToEdge: true,
  snapTolerance: 10,
};

DrawControl.propTypes = {
  /** Component ID used to identify this drawing control and its callback outputs. */
  id: PropTypes.string,
  /** Drawing modes displayed in the control: Point, LineString, Polygon, and Box (rectangle). */
  geometryTypes: PropTypes.arrayOf(PropTypes.oneOf(['Point', 'LineString', 'Polygon', 'Box'])),
  /** Corner of the map where the drawing tools are displayed. */
  position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right']),
  /** Accessible toolbar label and visible heading. */
  title: PropTypes.string,
  /** Whether drawing snaps to existing vector vertices. */
  snapToVertex: PropTypes.bool,
  /** Whether drawing snaps to existing vector edges. */
  snapToEdge: PropTypes.bool,
  /** Maximum snap distance in screen pixels. */
  snapTolerance: PropTypes.number,
  /** Read-only: GeoJSON Feature emitted only when geometry validation succeeds. */
  drawnGeoJSON: PropTypes.object,
  /** Read-only: WKT geometry emitted only when geometry validation succeeds. */
  drawnWKT: PropTypes.string,
  /** Read-only: TopoJSON topology emitted only when geometry validation succeeds. */
  drawnTopoJSON: PropTypes.object,
  /** Read-only: validity, topology errors, and repair suggestions from the last draw. */
  geometryValidation: PropTypes.shape({
    valid: PropTypes.bool,
    errors: PropTypes.arrayOf(PropTypes.object),
    suggestions: PropTypes.arrayOf(PropTypes.string),
  }),
  /** Dash-supplied callback used to write component state back to the layout. */
  setProps: PropTypes.func,
};

export default DrawControl;
