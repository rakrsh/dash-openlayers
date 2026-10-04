import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import Overlay from 'ol/Overlay';
import { useMap } from '../context/OLContext';

/** Render React children in an OpenLayers overlay anchored to a map coordinate. */
const Popup = ({ id, children, position, positioning, offset, autoPan, className, style }) => {
  const map = useMap();
  const overlayRef = useRef(null);
  const portalElementRef = useRef(null);
  const [portalElement, setPortalElement] = useState(null);
  const initializePortal = useCallback((host) => {
    if (!host || portalElementRef.current) return;

    const element = document.createElement('div');
    portalElementRef.current = element;
    setPortalElement(element);
  }, []);

  useEffect(() => {
    if (!portalElement) return undefined;
    const overlay = new Overlay({
      element: portalElement,
      autoPan,
    });
    overlayRef.current = overlay;
    map.addOverlay(overlay);

    return () => {
      map.removeOverlay(overlay);
      if (overlayRef.current === overlay) overlayRef.current = null;
    };
  }, [autoPan, map, portalElement]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    overlay.setOffset(offset);
    overlay.setPositioning(positioning);
    overlay.setPosition(position || undefined);
  }, [autoPan, map, offset, position, positioning, portalElement]);

  if (!portalElement) return <span hidden ref={initializePortal} />;

  return createPortal(
    <div
      id={typeof id === 'string' ? id : undefined}
      className={className || undefined}
      style={style || undefined}
    >
      {children}
    </div>,
    portalElement,
  );
};

Popup.defaultProps = {
  position: null,
  positioning: 'bottom-center',
  offset: [0, 0],
  autoPan: false,
  className: null,
  style: null,
};

Popup.propTypes = {
  /** The ID used to identify this component in Dash callbacks. */
  id: PropTypes.string,
  /** Dash children rendered inside the overlay element. */
  children: PropTypes.node,
  /** Overlay position as [x, y] in the map view projection; null hides the popup. */
  position: PropTypes.arrayOf(PropTypes.number),
  /** Overlay alignment relative to its position coordinate. */
  positioning: PropTypes.oneOf([
    'bottom-left',
    'bottom-center',
    'bottom-right',
    'center-left',
    'center-center',
    'center-right',
    'top-left',
    'top-center',
    'top-right',
  ]),
  /** Pixel offset [x, y] applied to the overlay. */
  offset: PropTypes.arrayOf(PropTypes.number),
  /** Pan the map when positioning the overlay would place it outside the viewport. */
  autoPan: PropTypes.bool,
  /** CSS class applied to the popup content element. */
  className: PropTypes.string,
  /** Inline CSS style applied to the popup content element. */
  style: PropTypes.object,
  /** Dash-supplied prop setter; internal, do not set from Python. */
  setProps: PropTypes.func,
};

export default Popup;
