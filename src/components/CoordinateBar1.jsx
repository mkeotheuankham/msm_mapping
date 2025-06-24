import React, { useEffect, useState } from "react";
import { toLonLat, fromLonLat } from "ol/proj";
import proj4 from "proj4";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";

proj4.defs("EPSG:32648", "+proj=utm +zone=48 +datum=WGS84 +units=m +no_defs");

const CoordinateBar = ({ map }) => {
  const [coords, setCoords] = useState({
    easting: null,
    northing: null,
    zone: "48N",
    lat: null,
    lon: null,
  });
  const [copySuccess, setCopySuccess] = useState("");
  const [setUserPosition] = useState(null);
  const [geoError, setGeoError] = useState(null);

  // Vector layer ref for user position marker
  const [userLayer, setUserLayer] = useState(null);

  useEffect(() => {
    if (!map) return;

    // สร้าง VectorLayer สำหรับตำแหน่งผู้ใช้ครั้งแรก
    if (!userLayer) {
      const layer = new VectorLayer({
        source: new VectorSource(),
        style: new Style({
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({ color: "rgba(255, 0, 0, 0.8)" }),
            stroke: new Stroke({ color: "#fff", width: 2 }),
          }),
        }),
      });
      map.addLayer(layer);
      setUserLayer(layer);
    }

    const handlePointerMove = (evt) => {
      const lonLat = toLonLat(evt.coordinate);
      const [easting, northing] = proj4("EPSG:4326", "EPSG:32648", lonLat);
      setCoords({
        easting: easting.toFixed(2),
        northing: northing.toFixed(2),
        zone: "48N",
        lat: lonLat[1].toFixed(6),
        lon: lonLat[0].toFixed(6),
      });
    };

    map.on("pointermove", handlePointerMove);
    return () => map.un("pointermove", handlePointerMove);
  }, [map, userLayer]);

  const handleCopy = () => {
    const text = `UTM Zone ${coords.zone} E: ${coords.easting} N: ${coords.northing} | Lat: ${coords.lat} Lon: ${coords.lon}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess("Copied!");
      setTimeout(() => setCopySuccess(""), 1500);
    });
  };

  const locateUser = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoError(null);
        const { latitude, longitude } = position.coords;
        setUserPosition({ lat: latitude, lon: longitude });

        if (!map || !userLayer) return;

        // แปลงตำแหน่งเป็น coordinate ของ OL
        const coordinate = fromLonLat([longitude, latitude]);

        // สร้าง Feature จุด
        const feature = new Feature(new Point(coordinate));

        // เคลียร์ feature เดิม แล้วเพิ่ม feature ใหม่
        userLayer.getSource().clear();
        userLayer.getSource().addFeature(feature);

        // ซูมและเลื่อนแผนที่ไปตำแหน่งผู้ใช้
        map.getView().animate({ center: coordinate, zoom: 14, duration: 1000 });
      },
      (error) => {
        setGeoError("Error getting location: " + error.message);
      }
    );
  };

  return (
    <div className="coordinate-bar-container">
      <div
        className="coordinate-bar"
        onClick={handleCopy}
        title="Click to copy coordinates"
      >
        <span>
          UTM Zone {coords.zone} E: {coords.easting} N: {coords.northing}
        </span>
        <span>
          Lat: {coords.lat} Lon: {coords.lon}
        </span>
        <span className="copy-status">{copySuccess}</span>
      </div>
      <button
        className="locate-button"
        onClick={locateUser}
        title="Show my location (GPS)"
      >
        📍
      </button>
      {geoError && <div className="geo-error">{geoError}</div>}

      <style>{`
        .coordinate-bar-container {
          position: absolute;
          bottom: 12px;
          right: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 1000;
          font-family: monospace;
        }
        .coordinate-bar {
          background: rgba(20, 20, 20, 0.7);
          backdrop-filter: blur(6px);
          color: #eee;
          padding: 6px 12px;
          font-size: 13px;
          border-radius: 8px;
          display: flex;
          gap: 12px;
          cursor: pointer;
          user-select: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          align-items: center;
        }
        .copy-status {
          margin-left: 12px;
          font-size: 11px;
          color: #1e90ff;
          font-weight: bold;
          opacity: 0.8;
          transition: opacity 0.3s ease;
          user-select: none;
          pointer-events: none;
        }
        .locate-button {
          background: rgba(30, 144, 255, 0.85);
          border: none;
          color: white;
          font-size: 18px;
          padding: 6px 10px;
          border-radius: 8px;
          cursor: pointer;
          user-select: none;
          transition: background-color 0.3s ease;
        }
        .locate-button:hover {
          background: rgba(30, 144, 255, 1);
        }
        .geo-error {
          position: absolute;
          bottom: 50px;
          right: 12px;
          background: rgba(255, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          max-width: 250px;
          user-select: none;
        }
      `}</style>
    </div>
  );
};

export default CoordinateBar;
