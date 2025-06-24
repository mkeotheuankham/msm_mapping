import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import { fromLonLat, toLonLat } from "ol/proj";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Draw } from "ol/interaction";
import GeoJSON from "ol/format/GeoJSON";

import BaseMapSwitcher from "./components/BaseMapSwitcher";
import CoordinateBar from "./components/CoordinateBar";
import DrawingToolbar from "./components/DrawingToolbar";

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
  const drawRef = useRef(null);
  const vectorLayerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [baseMap, setBaseMap] = useState("osm");
  const [activeTool, setActiveTool] = useState("None");
  const [featuresData, setFeaturesData] = useState([]);

  // Setup basemaps
  const baseLayersRef = useRef({});

  useEffect(() => {
    const baseLayers = {};
    Object.entries(baseMapLayers).forEach(([key, { url, attribution }]) => {
      baseLayers[key] = new TileLayer({
        source: new XYZ({ url, attributions: attribution }),
        visible: key === baseMap,
      });
    });
    baseLayersRef.current = baseLayers;

    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({ source: vectorSource });
    vectorLayerRef.current = vectorLayer;

    const olMap = new Map({
      target: mapRef.current,
      layers: [...Object.values(baseLayers), vectorLayer],
      view: new View({
        center: fromLonLat([100.5, 13.7]),
        zoom: 5,
      }),
    });

    setMap(olMap);
    return () => olMap.setTarget(null);
  }, []);

  // Switch basemap visibility
  useEffect(() => {
    Object.entries(baseLayersRef.current).forEach(([key, layer]) => {
      layer.setVisible(key === baseMap);
    });
  }, [baseMap]);

  // Handle draw tool
  useEffect(() => {
    if (!map || !vectorLayerRef.current) return;

    // Clear old interaction
    if (drawRef.current) {
      map.removeInteraction(drawRef.current);
      drawRef.current = null;
    }

    if (activeTool === "None") return;

    const draw = new Draw({
      source: vectorLayerRef.current.getSource(),
      type: activeTool,
    });

    draw.on("drawend", (evt) => {
      const format = new GeoJSON();
      const geojson = format.writeFeatureObject(evt.feature);
      const coords = geojson.geometry.coordinates;

      setFeaturesData((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: geojson.geometry.type,
          coordinates: coords,
        },
      ]);
    });

    map.addInteraction(draw);
    drawRef.current = draw;
  }, [map, activeTool]);

  const handleClearAll = () => {
    if (!vectorLayerRef.current) return;
    vectorLayerRef.current.getSource().clear();
    setFeaturesData([]);
  };

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      <BaseMapSwitcher baseMap={baseMap} setBaseMap={setBaseMap} />
      <DrawingToolbar
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        onClearAll={handleClearAll}
      />
      <CoordinateBar map={map} />
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

      {/* Future: Feature table preview */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          background: "rgba(255,255,255,0.9)",
          padding: "8px",
          borderRadius: "8px",
          maxHeight: "150px",
          overflowY: "auto",
          fontSize: "12px",
          fontFamily: "monospace",
        }}
      >
        <strong>Drawn Features:</strong>
        <ul>
          {featuresData.map((f) => (
            <li key={f.id}>
              {f.type}: {JSON.stringify(f.coordinates)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MapComponent;
