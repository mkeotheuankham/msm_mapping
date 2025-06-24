import React, { useEffect, useState } from "react";
import { toLonLat } from "ol/proj";
import proj4 from "proj4";
import HistoryToggleButton from "./HistoryToggleButton";

// Define UTM Zone 48N for Lao/Thailand area
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
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!map) return;

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

    const handleMapClick = (evt) => {
      const lonLat = toLonLat(evt.coordinate);
      const [easting, northing] = proj4("EPSG:4326", "EPSG:32648", lonLat);
      const newEntry = {
        id: Date.now(),
        lat: lonLat[1].toFixed(6),
        lon: lonLat[0].toFixed(6),
        easting: easting.toFixed(2),
        northing: northing.toFixed(2),
        zone: "48N",
      };
      setHistory((prev) => [newEntry, ...prev]);
    };

    map.on("pointermove", handlePointerMove);
    map.on("click", handleMapClick);

    return () => {
      map.un("pointermove", handlePointerMove);
      map.un("click", handleMapClick);
    };
  }, [map]);

  const handleCopy = () => {
    const text = `UTM Zone ${coords.zone} E: ${coords.easting} N: ${coords.northing} | Lat: ${coords.lat} Lon: ${coords.lon}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess("Copied!");
      setTimeout(() => setCopySuccess(""), 1500);
    });
  };

  const copyHistoryEntry = (entry) => {
    const text = `UTM Zone ${entry.zone} E: ${entry.easting} N: ${entry.northing} | Lat: ${entry.lat} Lon: ${entry.lon}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess("Copied history!");
      setTimeout(() => setCopySuccess(""), 1500);
    });
  };

  const removeHistoryEntry = (id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <>
      <div
        className="coordinate-bar"
        onClick={handleCopy}
        title="Click to copy current coordinates"
      >
        <span>
          UTM Zone {coords.zone} E: {coords.easting} N: {coords.northing}
        </span>
        <span>
          Lat: {coords.lat} Lon: {coords.lon}
        </span>
        <span className="copy-status">{copySuccess}</span>
        <HistoryToggleButton
          isOpen={showHistory}
          toggle={() => setShowHistory((v) => !v)}
        />
      </div>

      {showHistory && (
        <div
          className="history-panel"
          title="Click coordinate to copy, X to remove"
        >
          {history.length === 0 && <div className="empty">No history yet.</div>}
          {history.map((entry) => (
            <div key={entry.id} className="history-entry">
              <div
                className="coord-text"
                onClick={() => copyHistoryEntry(entry)}
                title="Click to copy this coordinate"
              >
                UTM {entry.zone} E:{entry.easting} N:{entry.northing} | Lat:{" "}
                {entry.lat} Lon: {entry.lon}
              </div>
              <button
                className="remove-btn"
                onClick={() => removeHistoryEntry(entry.id)}
                title="Remove this entry"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .coordinate-bar {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(20, 20, 20, 0.7);
          backdrop-filter: blur(6px);
          color: #eee;
          padding: 6px 12px;
          font-size: 13px;
          font-family: monospace;
          border-radius: 8px;
          display: flex;
          gap: 12px;
          cursor: pointer;
          user-select: none;
          align-items: center;
          z-index: 1000;
          max-width: 95vw;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          position: relative;
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
        .history-panel {
          position: absolute;
          bottom: 50px;
          right: 12px;
          max-height: 200px;
          width: 320px;
          background: rgba(10, 10, 10, 0.85);
          border-radius: 8px;
          padding: 8px;
          overflow-y: auto;
          font-family: monospace;
          font-size: 12px;
          color: #eee;
          box-shadow: 0 0 8px rgba(0,0,0,0.5);
          z-index: 1100;
        }
        .history-entry {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 6px;
          border-bottom: 1px solid #333;
        }
        .history-entry:last-child {
          border-bottom: none;
        }
        .coord-text {
          flex: 1;
          cursor: pointer;
          user-select: none;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-right: 8px;
        }
        .coord-text:hover {
          color: #1e90ff;
        }
        .remove-btn {
          background: transparent;
          border: none;
          color: #cc4444;
          font-weight: bold;
          cursor: pointer;
          font-size: 14px;
          padding: 0 4px;
        }
        .remove-btn:hover {
          color: #ff6666;
        }
        .empty {
          text-align: center;
          color: #888;
          padding: 10px;
          font-style: italic;
        }
      `}</style>
    </>
  );
};

export default CoordinateBar;
