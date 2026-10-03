import { booleanValid } from '@turf/boolean-valid';
import { kinks } from '@turf/kinks';

export const getTopologyErrors = (feature) => {
  const polygonGeometry = ['Polygon', 'MultiPolygon'].includes(feature.geometry?.type);
  if (!polygonGeometry) return [];

  const intersections = kinks(feature).features.map(({ geometry }) => ({
    code: 'self_intersection',
    coordinates: geometry.coordinates,
  }));
  const errors = [...intersections];
  if (!booleanValid(feature)) errors.unshift({ code: 'invalid_geometry' });
  return errors;
};
