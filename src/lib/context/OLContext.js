import React, { createContext, useContext } from 'react';

export const OLContext = createContext(null);

export const useMap = () => {
    const map = useContext(OLContext);
    if (!map) {
        throw new Error('dash-openlayers components must be wrapped within a <Map>');
    }
    return map;
};

export default OLContext;
