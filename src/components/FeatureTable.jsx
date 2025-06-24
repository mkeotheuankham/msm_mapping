import React from "react";

const FeatureTable = ({ features, onRemove, onExport }) => {
  return (
    <div className="feature-table">
      <div className="table-header">
        <strong>🗺️ Features ({features.length})</strong>
        <button
          className="export-btn"
          onClick={onExport}
          title="Export GeoJSON"
        >
          📤 Export
        </button>
      </div>

      {features.length === 0 ? (
        <div className="empty">No features drawn.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Coordinates</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {features.map((f) => (
              <tr key={f.id}>
                <td>{f.type}</td>
                <td className="coords">{formatCoordinates(f)}</td>
                <td>
                  <button
                    className="remove-btn"
                    onClick={() => onRemove(f.id)}
                    title="Remove"
                  >
                    ❌
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <style>{`
        .feature-table {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(255, 255, 255, 0.92);
          border-radius: 8px;
          padding: 8px;
          max-height: 200px;
          max-width: 90vw;
          overflow: auto;
          font-family: monospace;
          font-size: 12px;
          box-shadow: 0 1px 6px rgba(0,0,0,0.2);
          z-index: 1000;
        }
        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        .export-btn {
          font-size: 12px;
          padding: 3px 6px;
          background: #1e90ff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .export-btn:hover {
          background: #0077cc;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 4px 6px;
          border-bottom: 1px solid #ddd;
          text-align: left;
          vertical-align: top;
        }
        .coords {
          max-width: 300px;
          overflow-x: auto;
          white-space: nowrap;
        }
        .remove-btn {
          background: none;
          border: none;
          color: #c00;
          font-size: 14px;
          cursor: pointer;
        }
        .remove-btn:hover {
          color: #f00;
        }
        .empty {
          color: #666;
          padding: 4px;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

function formatCoordinates(f) {
  if (f.type === "Point") {
    const [lon, lat] = f.coordinates;
    return `Lon: ${lon.toFixed(4)}, Lat: ${lat.toFixed(4)}`;
  } else if (f.type === "LineString" || f.type === "Polygon") {
    const coords = f.type === "Polygon" ? f.coordinates[0] : f.coordinates;
    return (
      coords
        .slice(0, 3)
        .map(([lon, lat]) => `(${lon.toFixed(2)}, ${lat.toFixed(2)})`)
        .join(" → ") + (coords.length > 3 ? " ..." : "")
    );
  }
  return "-";
}

export default FeatureTable;
