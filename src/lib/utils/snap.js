import Collection from 'ol/Collection';
import Snap from 'ol/interaction/Snap';
import { unByKey } from 'ol/Observable';
import VectorSource from 'ol/source/Vector';

export const addSnapInteraction = (map, { snapToVertex, snapToEdge, snapTolerance }) => {
  if (!snapToVertex && !snapToEdge) return () => {};

  const sources = [
    ...new Set(
      map
        .getLayers()
        .getArray()
        .map((layer) => layer.getSource?.())
        .filter((source) => source instanceof VectorSource),
    ),
  ];
  const features = new Collection(sources.flatMap((source) => source.getFeatures()));
  const listenerKeys = [];

  sources.forEach((source) => {
    listenerKeys.push(
      source.on('addfeature', ({ feature }) => features.push(feature)),
      source.on('removefeature', ({ feature }) => features.remove(feature)),
    );
  });

  const snap = new Snap({
    features,
    vertex: snapToVertex,
    edge: snapToEdge,
    pixelTolerance: snapTolerance,
  });
  map.addInteraction(snap);

  return () => {
    map.removeInteraction(snap);
    listenerKeys.forEach(unByKey);
  };
};
