import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat, toLonLat } from 'ol/proj';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { OLContext } from '../context/OLContext';

const MapComponent = ({ id, children, center, zoom, projection, proj4Defs, style, setProps }) => {
    const mapElement = useRef(null);
    const [map, setMap] = useState(null);

    useEffect(() => {
        if (proj4Defs && proj4Defs.length > 0) {
            proj4Defs.forEach(({ code, def }) => {
                proj4.defs(code, def);
            });
            register(proj4);
        }
    }, [proj4Defs]);

    useEffect(() => {
        if (!mapElement.current) return;

        const initialCenter = projection === 'EPSG:3857'
            ? fromLonLat(center)
            : center;

        const olMap = new Map({
            target: mapElement.current,
            view: new View({
                projection: projection,
                center: initialCenter,
                zoom: zoom,
            }),
        });

        olMap.on('singleclick', (evt) => {
            if (setProps) {
                const lonLat = toLonLat(evt.coordinate, projection);
                setProps({
                    clickData: {
                        coordinate: evt.coordinate,
                        latLon: [lonLat[1], lonLat[0]],
                    },
                });
            }
        });

        olMap.on('moveend', () => {
            if (setProps) {
                const view = olMap.getView();
                setProps({
                    center: view.getCenter(),
                    zoom: view.getZoom(),
                });
            }
        });

        setMap(olMap);

        return () => olMap.setTarget(null);
    }, []);

    return (
        <OLContext.Provider value={map}>
            <div id={id} ref={mapElement} style={style || { width: '100%', height: '500px' }}>
                {map ? children : null}
            </div>
        </OLContext.Provider>
    );
};

MapComponent.defaultProps = {
    center: [0, 0],
    zoom: 2,
    projection: 'EPSG:3857',
    proj4Defs: [],
};

MapComponent.propTypes = {
    id: PropTypes.string,
    children: PropTypes.node,
    center: PropTypes.arrayOf(PropTypes.number),
    zoom: PropTypes.number,
    projection: PropTypes.string,
    proj4Defs: PropTypes.arrayOf(
        PropTypes.shape({
            code: PropTypes.string.isRequired,
            def: PropTypes.string.isRequired,
        })
    ),
    style: PropTypes.object,
    clickData: PropTypes.object,
    setProps: PropTypes.func,
};

export default MapComponent;
