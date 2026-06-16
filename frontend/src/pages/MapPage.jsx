import React, { useEffect, useRef, useState } from "react";
import { cityAQIData, getAQIStatus, pollutionSources } from "../data/sampleData";

const CITIES = Object.values(cityAQIData);

export default function MapPage({ selectedCity, setSelectedCity }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [showSources, setShowSources] = useState(false);
  const [mapLayer, setMapLayer] = useState("standard");
  const [isLoading, setIsLoading] = useState(true);

  // Dynamically load Leaflet
  useEffect(() => {
    const loadLeaflet = async () => {
      if (!window.L) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }
      initMap();
    };
    loadLeaflet();
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, []);

  const initMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const L = window.L;

    const map = L.map(mapRef.current, {
      center: [22.5, 82.0],
      zoom: 5,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap | CPCB Data',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;
    addCityMarkers(map);

    // Click handler for reverse geocoding simulation
    map.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      const locationName = await simulateReverseGeocode(lat, lng);
      const nearestCity = findNearestCity(lat, lng);

      const popupContent = `
        <div style="font-family:'Noto Sans',sans-serif;min-width:200px;">
          <div style="background:#1a3a6b;color:white;padding:8px 12px;margin:-9px -14px 10px;font-weight:700;font-size:13px;border-bottom:2px solid #c9a227;">
            📍 ${locationName}
          </div>
          <div style="font-size:12px;color:#4a5a70;margin-bottom:6px;">Coordinates: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E</div>
          ${nearestCity ? `
            <div style="background:#f0f4f9;border-radius:4px;padding:8px;margin-top:6px;">
              <div style="font-size:11px;color:#4a5a70;">Nearest Station: <strong>${nearestCity.location}</strong></div>
              <div style="font-size:20px;font-weight:700;color:${getAQIStatus(nearestCity.AQI).color};margin:4px 0;">AQI: ${nearestCity.AQI}</div>
              <div style="display:inline-block;background:${getAQIStatus(nearestCity.AQI).color};color:white;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;">${getAQIStatus(nearestCity.AQI).label}</div>
              <div style="font-size:11px;margin-top:6px;">PM2.5: <strong>${nearestCity.PM25} µg/m³</strong> | PM10: <strong>${nearestCity.PM10} µg/m³</strong></div>
            </div>
          ` : ""}
        </div>
      `;

      L.popup({ maxWidth: 260 })
        .setLatLng([lat, lng])
        .setContent(popupContent)
        .openOn(map);

      setClickedLocation({ lat, lng, name: locationName, city: nearestCity });
    });

    setIsLoading(false);
  };

  const simulateReverseGeocode = async (lat, lng) => {
    // Simulate geocodeAPI.reverseGeocode()
    const knownAreas = [
      { lat: 28.6, lng: 77.2, name: "Delhi NCR Region" },
      { lat: 19.0, lng: 72.8, name: "Mumbai Metropolitan Area" },
      { lat: 13.0, lng: 80.2, name: "Chennai Coastal Region" },
      { lat: 22.5, lng: 88.3, name: "Kolkata Urban Zone" },
      { lat: 12.9, lng: 77.5, name: "Bangalore Tech Corridor" },
      { lat: 17.3, lng: 78.4, name: "Hyderabad Deccan Region" },
    ];

    let closest = knownAreas[0];
    let minDist = Infinity;
    knownAreas.forEach((area) => {
      const dist = Math.sqrt(Math.pow(lat - area.lat, 2) + Math.pow(lng - area.lng, 2));
      if (dist < minDist) { minDist = dist; closest = area; }
    });

    if (minDist < 3) return closest.name;
    return `Location (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E)`;
  };

  const findNearestCity = (lat, lng) => {
    let nearest = null;
    let minDist = Infinity;
    CITIES.forEach((city) => {
      const dist = Math.sqrt(Math.pow(lat - city.latitude, 2) + Math.pow(lng - city.longitude, 2));
      if (dist < minDist) { minDist = dist; nearest = city; }
    });
    return nearest;
  };

  const addCityMarkers = (map) => {
    const L = window.L;
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    CITIES.forEach((city) => {
      const status = getAQIStatus(city.AQI);

      const icon = L.divIcon({
        className: "",
        html: `
          <div style="
            background:${status.color};
            color:white;
            border:2px solid white;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            width:32px;height:32px;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);
            font-size:11px;font-weight:700;font-family:'Noto Sans',sans-serif;
          ">
            <span style="transform:rotate(45deg)">${city.AQI}</span>
          </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -34],
      });

      const marker = L.marker([city.latitude, city.longitude], { icon });

      const popup = `
        <div style="font-family:'Noto Sans',sans-serif;min-width:220px;">
          <div style="background:#1a3a6b;color:white;padding:8px 12px;margin:-9px -14px 10px;font-weight:700;font-size:14px;border-bottom:2px solid #c9a227;">
            📍 ${city.location}
          </div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <div style="font-size:32px;font-weight:700;color:${status.color};font-family:'Rajdhani',sans-serif">${city.AQI}</div>
            <div>
              <div style="font-size:11px;color:#666">AQI</div>
              <div style="background:${status.color};color:white;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:700;">${status.label}</div>
            </div>
          </div>
          <table style="font-size:12px;width:100%;">
            <tr><td style="color:#666;padding:2px 0">PM2.5</td><td style="font-weight:600">${city.PM25} µg/m³</td></tr>
            <tr><td style="color:#666;padding:2px 0">PM10</td><td style="font-weight:600">${city.PM10} µg/m³</td></tr>
            <tr><td style="color:#666;padding:2px 0">NO₂</td><td style="font-weight:600">${city.NO2} µg/m³</td></tr>
            <tr><td style="color:#666;padding:2px 0">Temp</td><td style="font-weight:600">${city.temperature}°C</td></tr>
            <tr><td style="color:#666;padding:2px 0">Wind</td><td style="font-weight:600">${city.windSpeed} km/h</td></tr>
          </table>
        </div>
      `;

      marker.bindPopup(popup, { maxWidth: 260 });
      marker.addTo(map);
      markersRef.current.push(marker);
    });
  };

  const addSourceMarkers = () => {
    const L = window.L;
    if (!mapInstanceRef.current) return;

    const sourceIcons = {
      traffic: { icon: "🚗", color: "#f59e0b" },
      industrial: { icon: "🏭", color: "#ef4444" },
      construction: { icon: "🏗️", color: "#f97316" },
      cropBurning: { icon: "🌾", color: "#84cc16" },
    };

    pollutionSources.forEach((src) => {
      const si = sourceIcons[src.type];
      const icon = L.divIcon({
        className: "",
        html: `<div style="background:${si.color};color:white;border-radius:4px;padding:2px 6px;font-size:12px;box-shadow:0 2px 6px rgba(0,0,0,0.3);white-space:nowrap;font-family:'Noto Sans',sans-serif;">${si.icon} ${src.type}</div>`,
        iconAnchor: [30, 15],
      });
      const marker = L.marker([src.lat, src.lng], { icon });
      marker.bindPopup(`<b>${src.name}</b><br>Type: ${src.type}<br>Intensity: ${src.intensity}/10`);
      marker.addTo(mapInstanceRef.current);
      markersRef.current.push(marker);
    });
  };

  const handleShowSources = () => {
    setShowSources(!showSources);
    if (!showSources) addSourceMarkers();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">🗺️ Interactive AQI Map — India</div>
          <div className="page-subtitle">Click any location on the map to view AQI data. Markers show CPCB monitoring stations.</div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className={`gov-btn-outline ${showSources ? "active" : ""}`} onClick={handleShowSources}>
            🏭 Pollution Sources
          </button>
        </div>
      </div>

      {/* Map Legend */}
      <div className="card" style={{ marginBottom: "12px" }}>
        <div className="card-body" style={{ padding: "10px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", fontSize: "12px" }}>
            <span style={{ fontWeight: "700", color: "var(--gov-text-secondary)" }}>AQI LEGEND:</span>
            {[
              { label: "Good (0–50)", color: "#22c55e" },
              { label: "Satisfactory (51–100)", color: "#84cc16" },
              { label: "Moderate (101–200)", color: "#f59e0b" },
              { label: "Poor (201–300)", color: "#f97316" },
              { label: "Very Poor (301–400)", color: "#ef4444" },
              { label: "Hazardous (400+)", color: "#7f1d1d" },
            ].map((l) => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "12px", height: "12px", background: l.color, borderRadius: "2px" }}></div>
                <span>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "12px" }}>
        {/* Map */}
        <div className="card">
          <div className="card-header">🗺️ AQI Heatmap — CPCB Monitoring Stations</div>
          {isLoading && (
            <div className="loading-spinner">Loading map...</div>
          )}
          <div ref={mapRef} style={{ height: "520px" }}></div>
        </div>

        {/* Side Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Clicked location info */}
          {clickedLocation && (
            <div className="card">
              <div className="card-header">📍 Selected Location</div>
              <div className="card-body">
                <div style={{ fontWeight: "700", marginBottom: "6px" }}>{clickedLocation.name}</div>
                <div style={{ fontSize: "11px", color: "var(--gov-text-secondary)", marginBottom: "10px" }}>
                  {clickedLocation.lat.toFixed(4)}°N, {clickedLocation.lng.toFixed(4)}°E
                </div>
                {clickedLocation.city && (
                  <>
                    <div style={{ fontSize: "11px", color: "var(--gov-text-secondary)", marginBottom: "4px" }}>Nearest Station: <strong>{clickedLocation.city.location}</strong></div>
                    <div style={{
                      fontSize: "28px",
                      fontWeight: "700",
                      color: getAQIStatus(clickedLocation.city.AQI).color,
                      fontFamily: "Rajdhani, sans-serif",
                    }}>
                      AQI {clickedLocation.city.AQI}
                    </div>
                    <div className="aqi-badge" style={{
                      background: getAQIStatus(clickedLocation.city.AQI).color,
                      color: "white",
                    }}>
                      {getAQIStatus(clickedLocation.city.AQI).label}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* City List */}
          <div className="card" style={{ flex: 1, overflow: "hidden" }}>
            <div className="card-header">📋 Station Summary</div>
            <div style={{ overflowY: "auto", maxHeight: "400px" }}>
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>City</th>
                    <th>AQI</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {CITIES.sort((a, b) => b.AQI - a.AQI).map((city) => {
                    const st = getAQIStatus(city.AQI);
                    return (
                      <tr key={city.location}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setSelectedCity(city.location);
                          if (mapInstanceRef.current) {
                            mapInstanceRef.current.setView([city.latitude, city.longitude], 8, { animate: true });
                          }
                        }}
                      >
                        <td style={{ fontWeight: "600", fontSize: "12px" }}>{city.location}</td>
                        <td style={{ fontWeight: "700", color: st.color, fontFamily: "Rajdhani, sans-serif", fontSize: "15px" }}>{city.AQI}</td>
                        <td>
                          <span style={{
                            background: st.color + "22",
                            color: st.color,
                            padding: "2px 7px",
                            borderRadius: "10px",
                            fontSize: "10px",
                            fontWeight: "700",
                          }}>{st.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}