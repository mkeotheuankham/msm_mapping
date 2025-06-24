// src/context/MapContext.jsx
import { createContext, useContext, useRef } from "react";

export const MapContext = createContext(null);

export const MapProvider = ({ children }) => {
  const mapRef = useRef(null); // ເກັບ instance ຂອງ OpenLayers Map
  const layersRef = useRef([]); // ເກັບລາຍຊື່ layers
  const featuresRef = useRef([]); // ເກັບລາຍຊື່ features

  return (
    <MapContext.Provider value={{ mapRef, layersRef, featuresRef }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => useContext(MapContext);
