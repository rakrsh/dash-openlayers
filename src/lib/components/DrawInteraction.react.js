import React from 'react';
import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Draw, { createBox } from 'ol/interaction/Draw';
import { fromCircle } from 'ol/geom/Polygon';
import Modify from 'ol/interaction/Modify';
import Select from 'ol/interaction/Select';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { unByKey } from 'ol/Observable';
import { useMap } from '../context/OLContext';
import { getEditHistory } from '../utils/editHistory';
import { getTopologyErrors } from '../utils/geometryValidation';
import { addSnapInteraction } from '../utils/snap';
import { exportFeature } from '../utils/featureFormats';

const prepareFeatureForExport = (feature) => {
  const geometry = feature.getGeometry?.();
  if (!geometry || geometry.getType() !== 'Circle') return feature;

  const exportableFeature = feature.clone();
  exportableFeature.setGeometry(fromCircle(geometry));
  return exportableFeature;
};

const serializeDrawnFeatures = (source, map) => {
  const formatOptions = {
    featureProjection: map.getView().getProjection(),
    dataProjection: 'EPSG:4326',
  };
  const features = source.getFeatures().map(prepareFeatureForExport);
  return new GeoJSON().writeFeaturesObject(features, formatOptions);
};

const serializeEditedFeature = (feature, map) =>
  new GeoJSON().writeFeatureObject(prepareFeatureForExport(feature), {
    featureProjection: map.getView().getProjection(),
    dataProjection: 'EPSG:4326',
  });

const publishDrawnFeatures = (
  source,
  map,
  setPropsRef,
  selectedFeatures,
  changedFeature,
  removed,
) => {
  if (!setPropsRef.current) return;
  const props = { drawnFeatures: serializeDrawnFeatures(source, map) };
  if (selectedFeatures?.getArray().includes(changedFeature)) {
    props.editedFeature = removed ? null : serializeEditedFeature(changedFeature, map);
  }
  setPropsRef.current(props);
};

/** Draw, validate, select, and edit spatial features. */
const DrawInteraction = ({
  id,
  geometryType,
  editMode = false,
  deleteSelected = 0,
  snapToVertex = true,
  snapToEdge = true,
  snapTolerance = 10,
  setProps,
}) => {
  const map = useMap();
  const setPropsRef = useRef(setProps);
  const sourceRef = useRef(null);
  const layerRef = useRef(null);
  const selectedFeaturesRef = useRef(null);
  const selectRef = useRef(null);
  const previousDeleteSelectedRef = useRef(deleteSelected);

  useEffect(() => {
    setPropsRef.current = setProps;
  }, [setProps]);

  useEffect(() => {
    if (!map) return;

    const source = new VectorSource();
    const vector = new VectorLayer({ source });
    const history = getEditHistory(map);
    sourceRef.current = source;
    layerRef.current = vector;
    vector.set('dashId', id);
    map.addLayer(vector);
    const sourceListenerKeys = [
      source.on('changefeature', ({ feature }) =>
        publishDrawnFeatures(source, map, setPropsRef, selectedFeaturesRef.current, feature, false),
      ),
      source.on('removefeature', ({ feature }) =>
        publishDrawnFeatures(source, map, setPropsRef, selectedFeaturesRef.current, feature, true),
      ),
    ];

    return () => {
      unByKey(sourceListenerKeys);
      history.removeSource(source);
      map.removeLayer(vector);
      source.clear();
      if (sourceRef.current === source) sourceRef.current = null;
      if (layerRef.current === vector) layerRef.current = null;
    };
  }, [map, id]);

  useEffect(() => {
    const source = sourceRef.current;
    if (!map || !source || !geometryType) return undefined;

    const drawOptions = {
      source,
      type: geometryType === 'Box' ? 'Circle' : geometryType,
    };
    if (geometryType === 'Box') drawOptions.geometryFunction = createBox();

    const draw = new Draw(drawOptions);
    const history = getEditHistory(map);
    map.addInteraction(draw);

    const drawEndListener = draw.on('drawend', (evt) => {
      const formatOptions = {
        featureProjection: map.getView().getProjection(),
        dataProjection: 'EPSG:4326',
      };
      const writer = new GeoJSON();
      const exportableFeature = prepareFeatureForExport(evt.feature);
      const geojson = writer.writeFeatureObject(exportableFeature, formatOptions);
      const errors = getTopologyErrors(geojson);
      const structurallyValid = !errors.some((error) => error.code === 'invalid_geometry');
      const intersections = errors.filter((error) => error.code === 'self_intersection');

      const suggestions = [];
      if (intersections.length > 0) {
        suggestions.push('Move the reported vertices so polygon boundaries do not cross.');
      }
      if (!structurallyValid) {
        suggestions.push(
          'Close each ring, provide at least four positions, and keep holes inside the outer ring without overlap.',
        );
      }

      const valid = errors.length === 0;
      const outputFormats = valid ? exportFeature(exportableFeature, formatOptions) : null;
      if (!valid) {
        source.removeFeature(evt.feature);
      } else {
        history.record(
          {
            undo: () => {
              source.removeFeature(evt.feature);
              if (setPropsRef.current) {
                setPropsRef.current({
                  drawnGeoJSON: null,
                  drawnWKT: null,
                  drawnTopoJSON: null,
                  drawnFeatures: serializeDrawnFeatures(source, map),
                });
              }
            },
            redo: () => {
              source.addFeature(evt.feature);
              if (setPropsRef.current) {
                setPropsRef.current({
                  drawnGeoJSON: outputFormats.geojson,
                  drawnWKT: outputFormats.wkt,
                  drawnTopoJSON: outputFormats.topojson,
                  drawnFeatures: serializeDrawnFeatures(source, map),
                });
              }
            },
          },
          source,
        );
      }

      if (setPropsRef.current) {
        setPropsRef.current({
          drawnGeoJSON: valid ? outputFormats.geojson : null,
          drawnWKT: valid ? outputFormats.wkt : null,
          drawnTopoJSON: valid ? outputFormats.topojson : null,
          drawnFeatures: serializeDrawnFeatures(source, map),
          geometryValidation: { valid, errors, suggestions },
        });
      }
    });

    return () => {
      unByKey(drawEndListener);
      map.removeInteraction(draw);
    };
  }, [map, geometryType]);

  useEffect(() => {
    const source = sourceRef.current;
    const layer = layerRef.current;
    if (!map || !source || !layer || !editMode) return undefined;

    const select = new Select({ layers: [layer] });
    const selectedFeatures = select.getFeatures();
    const modify = new Modify({ features: selectedFeatures });
    const history = getEditHistory(map);
    let beforeGeometries = null;
    selectedFeaturesRef.current = selectedFeatures;
    selectRef.current = select;
    map.addInteraction(select);
    map.addInteraction(modify);

    const selectListenerKey = select.on('select', () => {
      const selected = selectedFeatures.getArray();
      const feature = selected[selected.length - 1] || null;
      if (setPropsRef.current) {
        setPropsRef.current({
          editedFeature: feature ? serializeEditedFeature(feature, map) : null,
        });
      }
    });
    const modifyStartListenerKey = modify.on('modifystart', (event) => {
      beforeGeometries = event.features.getArray().map((feature) => ({
        feature,
        geometry: feature.getGeometry().clone(),
      }));
    });
    const modifyEndListenerKey = modify.on('modifyend', (event) => {
      const afterGeometries = event.features.getArray().map((feature) => ({
        feature,
        geometry: feature.getGeometry().clone(),
      }));
      const previousGeometries = beforeGeometries;
      if (previousGeometries) {
        history.record(
          {
            undo: () => {
              previousGeometries.forEach(({ feature, geometry }) =>
                feature.setGeometry(geometry.clone()),
              );
              publishDrawnFeatures(
                source,
                map,
                setPropsRef,
                selectedFeatures,
                previousGeometries[0]?.feature,
                false,
              );
            },
            redo: () => {
              afterGeometries.forEach(({ feature, geometry }) =>
                feature.setGeometry(geometry.clone()),
              );
              publishDrawnFeatures(
                source,
                map,
                setPropsRef,
                selectedFeatures,
                afterGeometries[0]?.feature,
                false,
              );
            },
          },
          source,
        );
      }
      beforeGeometries = null;
      const feature = selectedFeatures.getArray().at(-1) || null;
      if (setPropsRef.current) {
        setPropsRef.current({
          drawnFeatures: serializeDrawnFeatures(source, map),
          editedFeature: feature ? serializeEditedFeature(feature, map) : null,
        });
      }
    });

    return () => {
      unByKey([selectListenerKey, modifyStartListenerKey, modifyEndListenerKey]);
      map.removeInteraction(modify);
      map.removeInteraction(select);
      selectedFeatures.clear();
      if (selectedFeaturesRef.current === selectedFeatures) selectedFeaturesRef.current = null;
      if (selectRef.current === select) selectRef.current = null;
      if (setPropsRef.current) setPropsRef.current({ editedFeature: null });
    };
  }, [editMode, map]);

  useEffect(() => {
    if (previousDeleteSelectedRef.current === deleteSelected) return;
    previousDeleteSelectedRef.current = deleteSelected;

    const source = sourceRef.current;
    const selectedFeatures = selectedFeaturesRef.current;
    const features = selectedFeatures?.getArray().slice() || [];
    if (!source || !features.length) return;

    const history = getEditHistory(map);
    const deleteFeatures = () => features.forEach((feature) => source.removeFeature(feature));
    const restoreFeatures = () => features.forEach((feature) => source.addFeature(feature));
    deleteFeatures();
    selectedFeatures.clear();
    history.record(
      {
        undo: () => {
          restoreFeatures();
          if (setPropsRef.current) {
            setPropsRef.current({
              drawnFeatures: serializeDrawnFeatures(source, map),
              editedFeature: null,
            });
          }
        },
        redo: () => {
          deleteFeatures();
          if (setPropsRef.current) {
            setPropsRef.current({
              drawnFeatures: serializeDrawnFeatures(source, map),
              editedFeature: null,
            });
          }
        },
      },
      source,
    );
    if (setPropsRef.current) {
      setPropsRef.current({
        drawnFeatures: serializeDrawnFeatures(source, map),
        editedFeature: null,
      });
    }
  }, [deleteSelected, map]);

  useEffect(() => {
    if (!geometryType && !editMode) return undefined;
    return addSnapInteraction(map, { snapToVertex, snapToEdge, snapTolerance });
  }, [map, id, geometryType, editMode, snapToVertex, snapToEdge, snapTolerance]);

  return <div style={{ display: 'none' }} />;
};

DrawInteraction.defaultProps = {
  geometryType: 'Polygon',
  snapToVertex: true,
  snapToEdge: true,
  snapTolerance: 10,
};

DrawInteraction.propTypes = {
  /** The ID used to identify this component in Dash callbacks. */
  id: PropTypes.string,
  /** Geometry to draw: Point, LineString, Polygon, Circle, or Box (an axis-aligned rectangle). */
  geometryType: PropTypes.oneOf(['Point', 'LineString', 'Polygon', 'Circle', 'Box']),
  /** Whether to select and modify features created by this interaction. */
  editMode: PropTypes.bool,
  /** Increment to delete the currently selected feature or features. */
  deleteSelected: PropTypes.number,
  /** Whether drawing snaps to existing vector vertices. */
  snapToVertex: PropTypes.bool,
  /** Whether drawing snaps to existing vector edges. */
  snapToEdge: PropTypes.bool,
  /** Maximum snap distance in screen pixels. */
  snapTolerance: PropTypes.number,
  /** Read-only: GeoJSON Feature emitted only when geometry validation succeeds. */
  drawnGeoJSON: PropTypes.object,
  /** Read-only: GeoJSON FeatureCollection containing every currently drawn feature. */
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
  /** Dash-supplied prop setter; internal, do not set from Python. */
  setProps: PropTypes.func,
};

export default DrawInteraction;
