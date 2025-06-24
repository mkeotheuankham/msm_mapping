import React from "react";

const HistoryToggleButton = ({ isOpen, toggle }) => {
  return (
    <button
      className="history-toggle"
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      title="Toggle history panel"
      aria-pressed={isOpen}
    >
      📋
      <style>{`
        .history-toggle {
          background: transparent;
          border: none;
          color: #ccc;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          user-select: none;
          margin-left: 8px;
          padding: 0 4px;
          transition: color 0.3s ease;
        }
        .history-toggle:hover {
          color: white;
        }
      `}</style>
    </button>
  );
};

export default HistoryToggleButton;
