import { useEffect, useRef } from 'react';

export const applyLayerProperties = (layer, { visible, opacity, zIndex }) => {
  if (visible !== null && visible !== undefined) {
    if (typeof visible !== 'boolean') throw new TypeError('Layer visible must be a boolean.');
    layer.setVisible(visible);
  }
  if (opacity !== null && opacity !== undefined) {
    if (!Number.isFinite(opacity) || opacity < 0 || opacity > 1) {
      throw new RangeError('Layer opacity must be a finite number between 0 and 1.');
    }
    layer.setOpacity(opacity);
  }
  if (zIndex !== null && zIndex !== undefined) {
    if (!Number.isInteger(zIndex)) throw new TypeError('Layer zIndex must be an integer.');
    layer.setZIndex(zIndex);
  }
};

export const useLayerProperties = (layerRef, visible, opacity, zIndex) => {
  const propertiesRef = useRef({ visible, opacity, zIndex });

  useEffect(() => {
    propertiesRef.current = { visible, opacity, zIndex };
    const layer = layerRef.current;
    if (layer) applyLayerProperties(layer, { visible, opacity, zIndex });
  }, [layerRef, visible, opacity, zIndex]);

  return propertiesRef;
};
