// src/components/ui/DistrictSelector.jsx
import React from "react";

const DistrictSelector = ({ districts, handleDistrictToggle }) => {
  return (
    <div className="district-selector">
      <h3>ເມືອງ</h3>
      <div className="district-list">
        {districts.map((district) => (
          <div key={district.name} className="district-item">
            <input
              type="checkbox"
              id={district.name}
              checked={district.checked}
              onChange={() => handleDistrictToggle(district.name)}
            />
            <label htmlFor={district.name}>
              <span
                className="color-indicator"
                style={{ backgroundColor: district.color }}
              />
              {district.displayName}
              {district.loading && <span className="loading">...</span>}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DistrictSelector;
