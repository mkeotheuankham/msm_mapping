import React from "react";

const DrawingToolbar = ({ activeTool, onSelectTool, onClearAll }) => {
  const tools = [
    { key: "None", label: "🧭" },
    { key: "Point", label: "📍" },
    { key: "LineString", label: "📏" },
    { key: "Polygon", label: "🟥" },
  ];

  return (
    <div className="drawing-toolbar">
      {tools.map((tool) => (
        <button
          key={tool.key}
          className={`tool-btn ${activeTool === tool.key ? "active" : ""}`}
          onClick={() => onSelectTool(tool.key)}
          title={tool.key}
        >
          {tool.label}
        </button>
      ))}
      <button
        className="tool-btn danger"
        onClick={onClearAll}
        title="Clear all drawings"
      >
        🗑️
      </button>

      <style>{`
        .drawing-toolbar {
          position: absolute;
          top: 100px;
          left: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 1000;
          background: rgba(30, 30, 30, 0.75);
          padding: 8px;
          border-radius: 10px;
          backdrop-filter: blur(6px);
        }
        .tool-btn {
          font-size: 20px;
          background: none;
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .tool-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .tool-btn.active {
          background: rgba(0, 122, 255, 0.7);
        }
        .tool-btn.danger {
          background: rgba(200, 50, 50, 0.7);
        }
        .tool-btn.danger:hover {
          background: rgba(255, 80, 80, 0.9);
        }
      `}</style>
    </div>
  );
};

export default DrawingToolbar;
