'use strict';

/**
 * GIS Data Inspector MCP server.
 *
 * Exposes a `validate_spatial_file` tool that parses and validates local
 * GeoJSON/KML fixtures before an AI agent wires them into a test or demo,
 * catching malformed JSON/XML and swapped [lat, lon] coordinate order early
 * (see the `gis-projection-validator` skill for the underlying rules).
 */

const fs = require('fs');
const path = require('path');
const { createServer } = require('./lib/stdio-rpc');

const GEOJSON_GEOMETRY_TYPES = new Set([
  'Point',
  'MultiPoint',
  'LineString',
  'MultiLineString',
  'Polygon',
  'MultiPolygon',
  'GeometryCollection',
]);

function flattenCoordinates(coords, depth = 0) {
  if (depth > 6) return []; // guard against pathological nesting
  if (Array.isArray(coords) && typeof coords[0] === 'number') {
    return [coords];
  }
  if (Array.isArray(coords)) {
    return coords.flatMap((c) => flattenCoordinates(c, depth + 1));
  }
  return [];
}

function checkAxisOrder(points) {
  const warnings = [];
  for (const point of points) {
    const [a, b] = point;
    if (typeof a !== 'number' || typeof b !== 'number') {
      warnings.push(`Non-numeric coordinate pair: ${JSON.stringify(point)}`);
      continue;
    }
    if (Math.abs(a) > 180 || Math.abs(b) > 90) {
      // Out of any lon/lat range at all - likely a projected CRS, not an error by itself.
      continue;
    }
    if (Math.abs(a) <= 90 && Math.abs(b) > 90 === false && Math.abs(a) < Math.abs(b)) {
      warnings.push(
        `Possible [lat, lon] swap at ${JSON.stringify(point)} — GeoJSON requires [lon, lat] (RFC 7946).`,
      );
    }
  }
  return warnings;
}

function validateGeoJsonNode(node, issues) {
  if (!node || typeof node !== 'object') {
    issues.push('Root value is not a JSON object.');
    return;
  }
  if (!node.type) {
    issues.push('Missing required "type" member.');
    return;
  }

  if (node.type === 'FeatureCollection') {
    if (!Array.isArray(node.features)) {
      issues.push('FeatureCollection.features must be an array.');
      return;
    }
    node.features.forEach((feature, i) => {
      if (feature.type !== 'Feature') {
        issues.push(`features[${i}].type must be "Feature", got "${feature.type}".`);
      }
      if (feature.geometry) validateGeoJsonNode(feature.geometry, issues);
    });
    return;
  }

  if (node.type === 'Feature') {
    if (node.geometry) validateGeoJsonNode(node.geometry, issues);
    return;
  }

  if (!GEOJSON_GEOMETRY_TYPES.has(node.type)) {
    issues.push(`Unknown GeoJSON "type": "${node.type}".`);
    return;
  }

  if (node.type === 'GeometryCollection') {
    (node.geometries || []).forEach((g) => validateGeoJsonNode(g, issues));
    return;
  }

  if (!node.coordinates) {
    issues.push(`${node.type} is missing "coordinates".`);
    return;
  }

  const points = flattenCoordinates(node.coordinates);
  issues.push(...checkAxisOrder(points));
}

function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function validateGeoJson(filePath) {
  const raw = stripBom(fs.readFileSync(filePath, 'utf8'));
  let json;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    return { valid: false, format: 'geojson', issues: [`Invalid JSON: ${err.message}`] };
  }

  const issues = [];
  validateGeoJsonNode(json, issues);
  return { valid: issues.length === 0, format: 'geojson', issues };
}

function validateKml(filePath) {
  const raw = stripBom(fs.readFileSync(filePath, 'utf8'));
  const issues = [];

  if (!/^\s*<\?xml/.test(raw)) {
    issues.push('File does not start with an XML declaration.');
  }
  if (!/<kml[\s>]/.test(raw)) {
    issues.push('No <kml> root element found.');
  }

  // Heuristic well-formedness check: tag stack balance (not a full XML parse).
  const tagPattern = /<\/?([a-zA-Z0-9:_-]+)(?:\s[^>]*)?\/?>/g;
  const stack = [];
  let match;
  while ((match = tagPattern.exec(raw)) !== null) {
    const full = match[0];
    const tagName = match[1];
    if (full.startsWith('</')) {
      const expected = stack.pop();
      if (expected !== tagName) {
        issues.push(`Mismatched closing tag </${tagName}> (expected </${expected || 'nothing'}>).`);
      }
    } else if (!full.endsWith('/>')) {
      stack.push(tagName);
    }
  }
  if (stack.length > 0) {
    issues.push(`Unclosed tag(s): ${stack.join(', ')}.`);
  }

  // Axis order in KML <coordinates> is lon,lat[,alt] separated by commas/whitespace.
  const coordBlocks = [...raw.matchAll(/<coordinates>([\s\S]*?)<\/coordinates>/g)];
  for (const [, block] of coordBlocks) {
    const tuples = block.trim().split(/\s+/).filter(Boolean);
    for (const tuple of tuples) {
      const parts = tuple.split(',').map(Number);
      if (parts.some(Number.isNaN)) {
        issues.push(`Non-numeric coordinate tuple in <coordinates>: "${tuple}".`);
        continue;
      }
      const [lon, lat] = parts;
      if (Math.abs(lon) <= 90 && Math.abs(lat) <= 180 && Math.abs(lon) < Math.abs(lat)) {
        issues.push(`Possible [lat, lon] swap in <coordinates>: "${tuple}" — KML requires lon,lat[,alt].`);
      }
    }
  }

  return { valid: issues.length === 0, format: 'kml', issues };
}

function validateSpatialFile({ path: filePath }) {
  if (!filePath) throw new Error('Missing required argument: path');
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }

  const ext = path.extname(resolved).toLowerCase();
  const result = ext === '.kml' ? validateKml(resolved) : validateGeoJson(resolved);
  return { file: resolved, ...result };
}

createServer({
  name: 'dash-openlayers-gis-inspector',
  version: '1.0.0',
  tools: [
    {
      name: 'validate_spatial_file',
      description:
        'Parse and validate a local GeoJSON (.geojson/.json) or KML (.kml) file: checks structural ' +
        'validity and flags likely [lat, lon]/[lon, lat] coordinate axis-order mistakes before the ' +
        'file is used in a test fixture or demo.',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Path to the .geojson/.json/.kml file to validate.' },
        },
        required: ['path'],
      },
      handler: validateSpatialFile,
    },
  ],
});
