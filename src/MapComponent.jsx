import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import { fromLonLat } from "ol/proj";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Draw } from "ol/interaction";
import GeoJSON from "ol/format/GeoJSON";

import BaseMapSwitcher from "./components/BaseMapSwitcher";
import CoordinateBar from "./components/CoordinateBar";
import DrawingToolbar from "./components/DrawingToolbar";
import FeatureTable from "./components/FeatureTable";

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

  useEffect(() => {
    Object.entries(baseLayersRef.current).forEach(([key, layer]) => {
      layer.setVisible(key === baseMap);
    });
  }, [baseMap]);

  useEffect(() => {
    if (!map || !vectorLayerRef.current) return;

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

      evt.feature.set("id", Date.now()); // สำคัญสำหรับลบ
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

  const handleRemoveFeature = (id) => {
    const source = vectorLayerRef.current.getSource();
    const features = source.getFeatures();
    const toRemove = features.find((f) => f.get("id") === id);
    if (toRemove) source.removeFeature(toRemove);
    setFeaturesData((prev) => prev.filter((f) => f.id !== id));
  };

  const handleExportGeoJSON = () => {
    const format = new GeoJSON();
    const source = vectorLayerRef.current.getSource();
    const geojson = format.writeFeatures(source.getFeatures());
    const blob = new Blob([geojson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "features.geojson";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      <BaseMapSwitcher baseMap={baseMap} setBaseMap={setBaseMap} />
      <DrawingToolbar
        map={map}
        onSelectTool={setActiveTool}
        setFeaturesData={setFeaturesData}
        onClearAll={handleClearAll}
      />
      <FeatureTable
        features={featuresData}
        onRemove={handleRemoveFeature}
        onExport={handleExportGeoJSON}
      />
      <CoordinateBar map={map} />
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default MapComponent;
