import React, { useEffect, useState, useRef } from "react";
import { toLonLat, fromLonLat } from "ol/proj";
import proj4 from "proj4";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";

proj4.defs("EPSG:32648", "+proj=utm +zone=48 +datum=WGS84 +units=m +no_defs");

const CoordinateButton = ({ map }) => {
  const [coords, setCoords] = useState({
    easting: null,
    northing: null,
    zone: "48N",
    lat: null,
    lon: null,
  });
  const [copySuccess, setCopySuccess] = useState("");
  const [geoError, setGeoError] = useState(null);
  const [userLayer, setUserLayer] = useState(null);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (!map) return;

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

        if (!map || !userLayer) return;

        const coordinate = fromLonLat([longitude, latitude]);
        const feature = new Feature(new Point(coordinate));
        userLayer.getSource().clear();
        userLayer.getSource().addFeature(feature);
        map.getView().animate({ center: coordinate, zoom: 14, duration: 1000 });
      },
      (error) => {
        setGeoError("Error getting location: " + error.message);
      }
    );
  };

  return (
    <>
      <div className="coordinate-button-container">
        <button
          className="coordinate-toggle-btn"
          onClick={() => setShowPanel((v) => !v)}
          title="Toggle coordinate info"
        >
          📍
        </button>

        {showPanel && (
          <div
            className="coordinate-panel"
            onClick={handleCopy}
            title="Click to copy coordinates"
          >
            <div>
              UTM Zone {coords.zone} E: {coords.easting} N: {coords.northing}
            </div>
            <div>
              Lat: {coords.lat} Lon: {coords.lon}
            </div>
            <div className="copy-status">{copySuccess}</div>
            <button
              className="locate-button"
              onClick={locateUser}
              title="Show my location (GPS)"
            >
              🎯
            </button>
          </div>
        )}
        {geoError && <div className="geo-error">{geoError}</div>}
      </div>

      <style>{`
        .coordinate-button-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 10000;
          font-family: monospace;
        }
        .coordinate-toggle-btn {
          background: rgba(30, 144, 255, 0.85);
          border: none;
          color: white;
          font-size: 24px;
          padding: 12px 16px;
          border-radius: 50%;
          cursor: pointer;
          user-select: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: background-color 0.3s ease;
        }
        .coordinate-toggle-btn:hover {
          background: rgba(30, 144, 255, 1);
        }
        .coordinate-panel {
          margin-top: 10px;
          background: rgba(20, 20, 20, 0.9);
          padding: 12px 16px;
          border-radius: 10px;
          color: #eee;
          font-size: 13px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          user-select: none;
          cursor: pointer;
          max-width: 280px;
        }
        .copy-status {
          margin-top: 6px;
          font-size: 12px;
          color: #1e90ff;
          font-weight: bold;
          opacity: 0.8;
          pointer-events: none;
          user-select: none;
        }
        .locate-button {
          margin-top: 10px;
          background: rgba(30, 144, 255, 0.85);
          border: none;
          color: white;
          font-size: 16px;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          user-select: none;
          transition: background-color 0.3s ease;
          display: block;
        }
        .locate-button:hover {
          background: rgba(30, 144, 255, 1);
        }
        .geo-error {
          margin-top: 6px;
          background: rgba(255, 0, 0, 0.85);
          color: white;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 12px;
          max-width: 280px;
          user-select: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.6);
        }
      `}</style>
    </>
  );
};

export default CoordinateButton;
