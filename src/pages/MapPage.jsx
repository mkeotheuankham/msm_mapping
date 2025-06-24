// src/pages/MapPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { MapProvider } from '../context/MapContext';
import BasemapSelector from '../components/map/BasemapSelector';
import FloatingButtons from '../components/ui/FloatingButtons';
import DistrictSelector from '../components/ui/DistrictSelector';
import LoadingBar from '../components/ui/LoadingBar';

const MapPage = () => {
  const [districts, setDistricts] = useState([...]); // ຂໍ້ມູນເມືອງ
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  // ສ້າງແຜນທີ່ OpenLayers
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialMap = new Map({
      target: mapContainerRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([102.6, 17.9]), // ຈຸດກາງປະເທດລາວ
        zoom: 7,
      }),
      controls: [],
    });

    mapRef.current = initialMap;

    return () => {
      if (initialMap) {
        initialMap.setTarget(undefined);
      }
    };
  }, []);

  // ຟັງຊັນຕ່າງໆ (fetchDistrictData, handleDistrictToggle, ແລະອື່ນໆ)
  // ...

  return (
    <MapProvider>
      <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
        <LoadingBar isLoading={isLoading} loadingProgress={loadingProgress} />
        
        <FloatingButtons
          // props ຕ່າງໆ
        />
        
        <div
          ref={mapContainerRef}
          style={{ height: '100%', width: '100%' }}
        />
        
        <DistrictSelector
          districts={districts}
          handleDistrictToggle={handleDistrictToggle}
        />
      </div>
    </MapProvider>
  );
};

export default MapPage;