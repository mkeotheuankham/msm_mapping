import React from "react";

const baseMapOptions = [
  {
    key: "osm",
    label: "OSM",
    img: "https://a.tile.openstreetmap.org/6/33/22.png",
  },
  {
    key: "stadia",
    label: "Stadia",
    img: "https://tiles.stadiamaps.com/tiles/alidade_satellite/6/33/22.jpg",
  },
  {
    key: "carto",
    label: "Carto",
    img: "https://a.basemaps.cartocdn.com/rastertiles/voyager_nolabels/6/33/22.png",
  },
  {
    key: "esri",
    label: "Esri",
    img: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/6/22/33",
  },
];

const BaseMapSwitcher = ({ baseMap, setBaseMap }) => {
  return (
    <div className="basemap-switcher">
      {baseMapOptions.map((option) => (
        <button
          key={option.key}
          onClick={() => setBaseMap(option.key)}
          className={`basemap-button ${baseMap === option.key ? "active" : ""}`}
          title={option.label}
        >
          <img src={option.img} alt={option.label} />
          <span>{option.label}</span>
        </button>
      ))}
      <style>{`
        .basemap-switcher {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 1000;
          background: rgba(20, 20, 20, 0.6); /* ดำและโปร่งแสง */
          backdrop-filter: blur(6px); /* เพิ่มความสวยแบบ glass */
          border-radius: 12px;
          box-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);
          padding: 6px;
          display: flex;
          gap: 6px;
        }

        .basemap-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          width: 50px;
          height: 65px;
          background: none;
          padding: 2px;
          cursor: pointer;
          font-size: 10px;
          color: #eee;
          gap: 2px;
          transition: all 0.2s ease;
        }

        .basemap-button.active {
          border: 2px solid #1e90ff;
          font-weight: bold;
          background-color: rgba(255, 255, 255, 0.05);
        }

        .basemap-button img {
          width: 100%;
          height: 35px;
          object-fit: cover;
          border-radius: 4px;
          filter: grayscale(0.6) brightness(0.9);
        }

        .basemap-button.active img {
          filter: none;
        }

        .basemap-button span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 768px) {
          .basemap-switcher {
            bottom: 12px;
            top: auto;
            right: 50%;
            transform: translateX(50%);
            gap: 4px;
          }

          .basemap-button {
            width: 44px;
            height: 58px;
            font-size: 9px;
          }

          .basemap-button img {
            height: 30px;
          }
        }
      `}</style>
    </div>
  );
};

export default BaseMapSwitcher;
