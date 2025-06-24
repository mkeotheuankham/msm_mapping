// src/components/map/BasemapSelector.jsx
import React, { useEffect, useState } from "react";
import { useMapContext } from "../../context/MapContext";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";

const BasemapSelector = () => {
  const { mapRef } = useMapContext();
  const [activeBasemap, setActiveBasemap] = useState("osm");

  const basemaps = {
    osm: {
      name: "OpenStreetMap",
      layer: new TileLayer({
        source: new OSM(),
      }),
    },
    satellite: {
      name: "Satellite",
      layer: new TileLayer({
        source: new XYZ({
          url: "https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}.jpg",
        }),
      }),
    },
    // ເພີ່ມ basemaps ອື່ນໆ
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const layers = map.getLayers();

    // ລຶບ layer ປັດຈຸບັນ
    if (layers.getLength() > 0) {
      map.removeLayer(layers.item(0));
    }

    // ເພີ່ມ layer ໃໝ່
    map.addLayer(basemaps[activeBasemap].layer);
  }, [activeBasemap, mapRef]);

  return (
    <div className="basemap-selector">
      {Object.keys(basemaps).map((key) => (
        <button
          key={key}
          className={`basemap-btn ${activeBasemap === key ? "active" : ""}`}
          onClick={() => setActiveBasemap(key)}
        >
          {basemaps[key].name}
        </button>
      ))}
    </div>
  );
};

export default BasemapSelector;
