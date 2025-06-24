// src/components/map/ParcelLayer.jsx
import React, { useEffect } from "react";
import { useMapContext } from "../../context/MapContext";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Fill, Stroke, Style } from "ol/style";

const ParcelLayer = ({ districts, getParcelStyle, onEachFeature }) => {
  const { mapRef, layersRef } = useMapContext();

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // ລຶບ layer ດິນເກົ່າ
    layersRef.current.forEach((layer) => {
      map.removeLayer(layer);
    });
    layersRef.current = [];

    // ສ້າງ layer ໃໝ່ສຳລັບແຕ່ລະເມືອງ
    districts.forEach((district) => {
      if (district.checked && district.parcels.length > 0) {
        const source = new VectorSource({
          features: new GeoJSON().readFeatures({
            type: "FeatureCollection",
            features: district.parcels.map((parcel) => ({
              type: "Feature",
              geometry: parcel.geom,
              properties: {
                ...parcel,
                districtName: district.displayName,
              },
            })),
          }),
        });

        const style = new Style({
          fill: new Fill({
            color: district.color + "80", // ເພີ່ມ opacity
          }),
          stroke: new Stroke({
            color: "#ffffff",
            width: 1,
          }),
        });

        const layer = new VectorLayer({
          source,
          style,
          zIndex: 1,
        });

        map.addLayer(layer);
        layersRef.current.push(layer);
      }
    });
  }, [districts, mapRef, layersRef]);

  return null;
};

export default ParcelLayer;
