import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Icon from 'ol/style/Icon';
import { asArray } from 'ol/color';
import Stroke from 'ol/style/Stroke';
import Style, { toFunction } from 'ol/style/Style';

const DECLARATIVE_STYLE_KEYS = [
  'fillColor',
  'strokeColor',
  'strokeWidth',
  'radius',
  'opacity',
  'marker',
  'icon',
  'rules',
];

const colorWithOpacity = (color, opacity) => {
  if (color == null || opacity == null || opacity >= 1) return color;
  const [red, green, blue, alpha = 1] = asArray(color);
  return [red, green, blue, alpha * opacity];
};

const markerOptions = (marker, opacity) => {
  if (!marker) return null;
  if (marker === 'circle') return {};

  const options = typeof marker === 'string' ? { src: marker } : { ...marker };
  const svg =
    options.svg ??
    (typeof options.src === 'string' && options.src.trimStart().startsWith('<svg')
      ? options.src
      : null);
  const src = svg
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    : (options.url ?? options.src);
  if (!src) return null;
  const iconOptions = { ...options };
  delete iconOptions.svg;
  delete iconOptions.url;
  return { ...iconOptions, src, opacity: options.opacity ?? opacity };
};

const toOpenLayersStyle = (config) => {
  if (!config || typeof config !== 'object' || Array.isArray(config)) return config;

  const { fillColor, strokeColor, strokeWidth, radius, opacity = 1, marker, icon } = config;
  const image = markerOptions(marker ?? icon, opacity);
  const fill =
    fillColor == null ? undefined : new Fill({ color: colorWithOpacity(fillColor, opacity) });
  const stroke =
    strokeColor == null
      ? undefined
      : new Stroke({
          color: colorWithOpacity(strokeColor, opacity),
          width: strokeWidth,
        });
  const isCircleMarker = image && !image.src;
  const circleFill =
    isCircleMarker && !fill ? new Fill({ color: colorWithOpacity('#3399CC', opacity) }) : fill;
  const circleStroke =
    isCircleMarker && !stroke
      ? new Stroke({ color: colorWithOpacity('#ffffff', opacity), width: 1.5 })
      : stroke;
  const imageStyle = image
    ? image.src
      ? new Icon(image)
      : new CircleStyle({ radius: radius ?? 6, fill: circleFill, stroke: circleStroke })
    : radius == null
      ? undefined
      : new CircleStyle({ radius, fill, stroke });

  return new Style({ fill, stroke, image: imageStyle });
};

const matchesRule = (feature, rule) => {
  if (!rule || typeof rule.property !== 'string') return false;
  const actual = feature.get(rule.property);
  const expected = rule.value;
  switch (rule.operator ?? '==') {
    case '=':
    case '==':
    case '===':
      return actual === expected;
    case '!=':
    case '!==':
      return actual !== expected;
    case '>':
      return actual > expected;
    case '>=':
      return actual >= expected;
    case '<':
      return actual < expected;
    case '<=':
      return actual <= expected;
    case 'in':
      return Array.isArray(expected) && expected.includes(actual);
    case 'notIn':
      return Array.isArray(expected) && !expected.includes(actual);
    default:
      return false;
  }
};

const isDeclarativeStyle = (style) =>
  style &&
  typeof style === 'object' &&
  !Array.isArray(style) &&
  DECLARATIVE_STYLE_KEYS.some((key) => Object.hasOwn(style, key));

export const createVectorStyle = (style) => {
  if (!isDeclarativeStyle(style)) return style;

  const { rules = [], ...defaultConfig } = style;
  const defaultStyle = toOpenLayersStyle(defaultConfig);
  if (!Array.isArray(rules) || rules.length === 0) return defaultStyle;

  const compiledRules = rules.map((rule) => ({
    matches: (feature) => matchesRule(feature, rule),
    styleFunction: toFunction(
      toOpenLayersStyle(
        rule.style ??
          Object.fromEntries(
            Object.entries(rule).filter(
              ([key]) => !['property', 'operator', 'value'].includes(key),
            ),
          ),
      ),
    ),
  }));
  const defaultStyleFunction = toFunction(defaultStyle);

  return (feature, resolution) => {
    const matchedRule = compiledRules.find(({ matches }) => matches(feature));
    return matchedRule
      ? matchedRule.styleFunction(feature, resolution)
      : defaultStyleFunction(feature, resolution);
  };
};
