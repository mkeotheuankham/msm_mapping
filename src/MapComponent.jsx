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
import { getLength, getArea } from "ol/sphere";
import Overlay from "ol/Overlay";
import LineString from "ol/geom/LineString";

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
  const [overlays, setOverlays] = useState([]);

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

    let segmentOverlays = [];
    let segmentInputs = [];

    draw.on("drawstart", (evt) => {
      const geom = evt.feature.getGeometry();

      evt.feature.on("change", () => {
        if (geom.getType() !== "LineString") return;

        segmentOverlays.forEach((o) => map.removeOverlay(o));
        segmentInputs.forEach((el) => el.remove());
        segmentOverlays = [];
        segmentInputs = [];

        const coords = geom.getCoordinates();

        for (let i = 1; i < coords.length; i++) {
          const c1 = coords[i - 1];
          const c2 = coords[i];
          const mid = [(c1[0] + c2[0]) / 2, (c1[1] + c2[1]) / 2];
          const len = getLength(new LineString([c1, c2]));

          const input = document.createElement("input");
          input.className = "segment-input";
          input.type = "number";
          input.value = len.toFixed(1);
          input.style.width = "60px";

          input.addEventListener("change", () => {
            // Optional: logic to handle length constraint
          });

          const overlay = new Overlay({
            element: input,
            position: mid,
            positioning: "bottom-center",
            offset: [0, -10],
          });

          map.addOverlay(overlay);
          segmentOverlays.push(overlay);
          segmentInputs.push(input);
        }
      });
    });

    draw.on("drawend", () => {
      setOverlays((prev) => [...prev, ...segmentOverlays]);
    });

    map.addInteraction(draw);
    drawRef.current = draw;
  }, [map, activeTool]);

  const handleClearAll = () => {
    if (!vectorLayerRef.current) return;
    vectorLayerRef.current.getSource().clear();
    setFeaturesData([]);
    overlays.forEach((overlay) => map.removeOverlay(overlay));
    setOverlays([]);
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
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        onClearAll={handleClearAll}
      />
      <FeatureTable
        features={featuresData}
        onRemove={handleRemoveFeature}
        onExport={handleExportGeoJSON}
      />
      <CoordinateBar map={map} />
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      <style>{`
        .measure-label {
          background: rgba(0,0,0,0.7);
          color: #fff;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
        }
        .segment-input {
          padding: 2px;
          font-size: 11px;
          text-align: center;
          border: 1px solid #888;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default MapComponent;
