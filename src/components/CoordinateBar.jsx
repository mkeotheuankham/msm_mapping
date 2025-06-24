import React, { useEffect, useState } from "react";
import { toLonLat } from "ol/proj";
import proj4 from "proj4";

// แปลง lat/lng เป็น UTM (Zone 48N ใช้สำหรับลาว/ไทยตอนบน)
proj4.defs("EPSG:32648", "+proj=utm +zone=48 +datum=WGS84 +units=m +no_defs");

const CoordinateBar = ({ map }) => {
  const [coords, setCoords] = useState({
    easting: null,
    northing: null,
    zone: "48N",
  });

  useEffect(() => {
    if (!map) return;

    const handlePointerMove = (evt) => {
      const lonLat = toLonLat(evt.coordinate);
      const [easting, northing] = proj4("EPSG:4326", "EPSG:32648", lonLat);
      setCoords({
        easting: easting.toFixed(2),
        northing: northing.toFixed(2),
        zone: "48N",
      });
    };

    map.on("pointermove", handlePointerMove);

    return () => {
      map.un("pointermove", handlePointerMove);
    };
  }, [map]);

  return (
    <div className="coordinate-bar">
      <span>UTM Zone {coords.zone}</span>
      <span>E: {coords.easting}</span>
      <span>N: {coords.northing}</span>

      <style>{`
        .coordinate-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.6);
          color: #fff;
          padding: 4px 12px;
          font-size: 12px;
          display: flex;
          gap: 16px;
          align-items: center;
          z-index: 1000;
          font-family: monospace;
        }
      `}</style>
    </div>
  );
};

export default CoordinateBar;
