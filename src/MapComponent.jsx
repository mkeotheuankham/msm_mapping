import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromLonLat } from "ol/proj";

import BaseMapSwitcher from "./components/BaseMapSwitcher";
import CoordinateBar from "./components/CoordinateBar"; // ✅

const baseMapLayers = {
  osm: {
    url: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
  },
  stadia: {
    url: "https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}.jpg",
    attribution: "© Stadia Maps",
  },
  carto: {
    url: "https://{a-c}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
    attribution: "© Carto",
  },
  esri: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri",
  },
};

const MapComponent = () => {
  const mapRef = useRef();
  const [baseMap, setBaseMap] = useState("osm");
  const [map, setMap] = useState(null); // ✅ สร้าง state map
  const baseLayersRef = useRef({});

  useEffect(() => {
    const layers = {};
    Object.entries(baseMapLayers).forEach(([key, { url, attribution }]) => {
      layers[key] = new TileLayer({
        source: new XYZ({
          url,
          attributions: attribution,
        }),
        visible: key === baseMap,
      });
    });

    baseLayersRef.current = layers;

    const olMap = new Map({
      target: mapRef.current,
      layers: Object.values(layers),
      view: new View({
        center: fromLonLat([100.5, 13.7]),
        zoom: 5,
      }),
    });

    setMap(olMap); // ✅ เก็บไว้ใน state

    return () => olMap.setTarget(null);
  }, []);

  useEffect(() => {
    Object.entries(baseLayersRef.current).forEach(([key, layer]) => {
      layer.setVisible(key === baseMap);
    });
  }, [baseMap]);

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      <BaseMapSwitcher baseMap={baseMap} setBaseMap={setBaseMap} />
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      {map && <CoordinateBar map={map} />} {/* ✅ ส่ง map object ไป */}
    </div>
  );
};

export default MapComponent;
