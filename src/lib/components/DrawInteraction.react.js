import React from 'react';
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import Draw from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { useMap } from '../context/OLContext';

const DrawInteraction = ({ id, geometryType, setProps }) => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        const source = new VectorSource();
        const vector = new VectorLayer({ source });
        map.addLayer(vector);

        const draw = new Draw({
            source: source,
            type: geometryType,
        });

        map.addInteraction(draw);

        draw.on('drawend', (evt) => {
            const writer = new GeoJSON();
            const geojson = writer.writeFeatureObject(evt.feature);

            if (setProps) {
                setProps({
                    drawnGeoJSON: geojson,
                });
            }
        });

        return () => {
            map.removeInteraction(draw);
            map.removeLayer(vector);
        };
    }, [map, geometryType]);

    return <div style={{ display: 'none' }} />;
};

DrawInteraction.defaultProps = {
    geometryType: 'Polygon',
};

DrawInteraction.propTypes = {
    id: PropTypes.string,
    geometryType: PropTypes.oneOf(['Point', 'LineString', 'Polygon', 'Circle']),
    drawnGeoJSON: PropTypes.object,
    setProps: PropTypes.func,
};

export default DrawInteraction;
