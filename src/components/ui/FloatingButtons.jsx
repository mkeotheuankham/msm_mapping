// src/components/ui/FloatingButtons.jsx
import React from "react";
import {
  FiMap,
  FiEdit2,
  FiUpload,
  FiRotateCcw,
  FiRotateCw,
  FiSave,
} from "react-icons/fi";

const FloatingButtons = ({
  onUploadCSV,
  onUndo,
  onRedo,
  onSave,
  canUndo,
  canRedo,
}) => {
  return (
    <div className="floating-buttons">
      <button onClick={onUploadCSV} title="Upload CSV">
        <FiUpload />
      </button>

      <button onClick={onUndo} disabled={!canUndo} title="Undo">
        <FiRotateCcw />
      </button>

      <button onClick={onRedo} disabled={!canRedo} title="Redo">
        <FiRotateCw />
      </button>

      <button onClick={onSave} title="Save">
        <FiSave />
      </button>

      {/* ເພີ່ມປຸ່ມອື່ນໆຕາມຄວາມຕ້ອງການ */}
    </div>
  );
};

export default FloatingButtons;
