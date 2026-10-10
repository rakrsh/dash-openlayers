import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Control from 'ol/control/Control';
import { useMap } from '../context/OLContext';
import DrawInteraction from './DrawInteraction.react';

const TOOL_LABELS = {
  Point: 'Point',
  LineString: 'Line',
  Polygon: 'Polygon',
  Circle: 'Circle',
  Box: 'Rectangle',
};
const DEFAULT_GEOMETRY_TYPES = ['Point', 'LineString', 'Polygon', 'Circle', 'Box'];

/** Add map controls for drawing and serializing spatial study areas. */
const DrawControl = ({
  id,
  geometryTypes = DEFAULT_GEOMETRY_TYPES,
  activeDrawMode,
  editMode,
  deleteSelected = 0,
  position = 'top-left',
  title = 'Draw',
  style,
  buttonStyle,
  snapToVertex = true,
  snapToEdge = true,
  snapTolerance = 10,
  setProps,
}) => {
  const map = useMap();
  const controlElementRef = React.useRef(null);
  const [uncontrolledDrawMode, setUncontrolledDrawMode] = useState(null);
  const [uncontrolledEditMode, setUncontrolledEditMode] = useState(false);
  const [deleteRequest, setDeleteRequest] = useState(0);
  const uncontrolledDrawModeRef = React.useRef(null);
  const uncontrolledEditModeRef = React.useRef(false);
  const activeDrawModeRef = React.useRef(activeDrawMode);
  const editModeRef = React.useRef(editMode);
  const setPropsRef = React.useRef(setProps);
  const previousDeleteSelectedRef = React.useRef(deleteSelected);
  const controlled = activeDrawMode !== undefined;
  const editing = editMode === undefined ? uncontrolledEditMode : editMode;
  const activeGeometryType = controlled ? activeDrawMode : uncontrolledDrawMode;
  const enabledActiveGeometryType =
    !editing && geometryTypes.includes(activeGeometryType) ? activeGeometryType : null;

  useEffect(() => {
    activeDrawModeRef.current = activeDrawMode;
    editModeRef.current = editMode;
    setPropsRef.current = setProps;
  }, [activeDrawMode, editMode, setProps]);

  useEffect(() => {
    if (previousDeleteSelectedRef.current === deleteSelected) return;
    previousDeleteSelectedRef.current = deleteSelected;
    setDeleteRequest((request) => request + 1);
  }, [deleteSelected]);

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
        ...style,
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
        ...buttonStyle,
      });
      const listener = () => {
        const currentMode =
          activeDrawModeRef.current === undefined
            ? uncontrolledDrawModeRef.current
            : activeDrawModeRef.current;
        const nextMode = currentMode === geometryType ? null : geometryType;
        if (editModeRef.current === undefined) {
          uncontrolledEditModeRef.current = false;
          setUncontrolledEditMode(false);
        }
        const changes = {};
        if (editModeRef.current !== undefined && editModeRef.current) {
          changes.editMode = false;
        }
        if (activeDrawModeRef.current === undefined) {
          uncontrolledDrawModeRef.current = nextMode;
          setUncontrolledDrawMode(nextMode);
        } else {
          changes.activeDrawMode = nextMode;
        }
        if (Object.keys(changes).length && setPropsRef.current) setPropsRef.current(changes);
      };
      button.addEventListener('click', listener);
      buttonListeners.push([button, listener]);
      toolbar.appendChild(button);
    });

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.dataset.editMode = 'true';
    editButton.setAttribute('aria-label', 'Edit drawn features');
    editButton.setAttribute('aria-pressed', 'false');
    editButton.textContent = 'Edit';
    editButton.title = 'Select and edit drawn features';
    Object.assign(editButton.style, {
      minHeight: '32px',
      padding: '4px 8px',
      color: '#182522',
      background: '#ffffff',
      border: '1px solid #778581',
      borderRadius: '3px',
      cursor: 'pointer',
    });
    const editListener = () => {
      const currentMode =
        editModeRef.current === undefined ? uncontrolledEditModeRef.current : editModeRef.current;
      const nextMode = !currentMode;
      if (editModeRef.current === undefined) {
        uncontrolledEditModeRef.current = nextMode;
        setUncontrolledEditMode(nextMode);
      } else if (setPropsRef.current) {
        setPropsRef.current({ editMode: nextMode });
      }
    };
    editButton.addEventListener('click', editListener);
    buttonListeners.push([editButton, editListener]);
    toolbar.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.dataset.deleteSelected = 'true';
    deleteButton.setAttribute('aria-label', 'Delete selected feature');
    deleteButton.textContent = 'Delete';
    deleteButton.title = 'Delete selected feature';
    Object.assign(deleteButton.style, {
      minHeight: '32px',
      padding: '4px 8px',
      color: '#182522',
      background: '#ffffff',
      border: '1px solid #778581',
      borderRadius: '3px',
      cursor: 'pointer',
    });
    const deleteListener = () => setDeleteRequest((request) => request + 1);
    deleteButton.addEventListener('click', deleteListener);
    buttonListeners.push([deleteButton, deleteListener]);
    toolbar.appendChild(deleteButton);
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
  }, [map, position, title, geometryTypes, style, buttonStyle]);

  useEffect(() => {
    const buttons = controlElementRef.current?.querySelectorAll('button[data-geometry-type]') ?? [];
    buttons.forEach((button) => {
      const isActive = button.dataset.geometryType === enabledActiveGeometryType;
      button.setAttribute('aria-pressed', String(isActive));
      button.style.color = isActive ? '#ffffff' : '#182522';
      button.style.background = isActive ? '#1f6a5e' : '#ffffff';
    });
    const editButton = controlElementRef.current?.querySelector('button[data-edit-mode]');
    if (editButton) {
      editButton.setAttribute('aria-pressed', String(editing));
      editButton.style.color = editing ? '#ffffff' : '#182522';
      editButton.style.background = editing ? '#1f6a5e' : '#ffffff';
    }
    const deleteButton = controlElementRef.current?.querySelector('button[data-delete-selected]');
    if (deleteButton) {
      deleteButton.disabled = !editing;
      deleteButton.style.cursor = editing ? 'pointer' : 'not-allowed';
    }
  }, [enabledActiveGeometryType, editing]);

  return (
    <>
      <DrawInteraction
        id={id ? `${id}-interaction` : undefined}
        geometryType={enabledActiveGeometryType}
        editMode={editing}
        deleteSelected={deleteRequest}
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
  /** Drawing modes displayed in the control: Point, LineString, Polygon, Circle, and Box (rectangle). */
  geometryTypes: PropTypes.arrayOf(
    PropTypes.oneOf(['Point', 'LineString', 'Polygon', 'Circle', 'Box']),
  ),
  /** Active drawing mode; set to null to stop drawing. Bidirectional when changed by toolbar clicks. */
  activeDrawMode: PropTypes.oneOf([null, 'Point', 'LineString', 'Polygon', 'Circle', 'Box']),
  /** Whether selection and vertex editing are enabled; toolbar changes are bidirectional. */
  editMode: PropTypes.bool,
  /** Increment to delete the currently selected feature or features. */
  deleteSelected: PropTypes.number,
  /** Corner of the map where the drawing tools are displayed. */
  position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right']),
  /** Accessible toolbar label and visible heading. */
  title: PropTypes.string,
  /** Inline styles applied to the toolbar control container. */
  style: PropTypes.object,
  /** Inline styles applied to each drawing mode button. */
  buttonStyle: PropTypes.object,
  /** Whether drawing snaps to existing vector vertices. */
  snapToVertex: PropTypes.bool,
  /** Whether drawing snaps to existing vector edges. */
  snapToEdge: PropTypes.bool,
  /** Maximum snap distance in screen pixels. */
  snapTolerance: PropTypes.number,
  /** Read-only: GeoJSON Feature emitted only when geometry validation succeeds. */
  drawnGeoJSON: PropTypes.object,
  /** Read-only: GeoJSON FeatureCollection of all drawn features, updated after drawing, editing, undo, or removal. */
  drawnFeatures: PropTypes.object,
  /** Read-only: selected or last modified GeoJSON Feature, or null after deselection or deletion. */
  editedFeature: PropTypes.object,
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
