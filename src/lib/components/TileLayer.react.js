import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Tile from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import { useMap } from '../context/OLContext';

const TileLayer = ({ source, url }) => {
  const map = useMap();

  useEffect(() => {
    const tileSource = url ? new XYZ({ url }) : source === 'OSM' ? new OSM() : null;
    if (!tileSource) return;

    const tileLayer = new Tile({ source: tileSource });
    map.addLayer(tileLayer);

    return () => map.removeLayer(tileLayer);
  }, [map, source, url]);

  return null;
};

TileLayer.defaultProps = {
  source: null,
  url: null,
};

TileLayer.propTypes = {
  /** The ID used to identify this component in Dash callbacks. */
  id: PropTypes.string,
  /** Built-in tile source identifier. Currently supports "OSM". */
  source: PropTypes.string,
  /** URL template for a custom XYZ tile source, e.g. "https://tiles.example.com/{z}/{x}/{y}.png". */
  url: PropTypes.string,
  /** Dash-supplied callback used to write component state back to the layout. */
  setProps: PropTypes.func,
};

export default TileLayer;
