import PropTypes from 'prop-types';

// Minimal TileLayer component stub for testing. The full implementation
// should create an OpenLayers Tile layer and attach it to the OL context.
// For integration tests we only need the component to be registered and
// not throw during render.
const TileLayer = ({ _id, _source, _setProps }) => {
  return null;
};

TileLayer.defaultProps = {
  source: null,
};

TileLayer.propTypes = {
  /** The ID used to identify this component in Dash callbacks. */
  id: PropTypes.string,
  /** Tile source identifier (e.g. "OSM"). */
  source: PropTypes.string,
  /** Dash-supplied callback used to write component state back to the layout. */
  setProps: PropTypes.func,
};

export default TileLayer;
