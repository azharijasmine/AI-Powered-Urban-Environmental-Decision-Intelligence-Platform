import React, { useState, useEffect, useRef } from "react";
import {
  cityAQIData,
  generateForecast,
  getAQIStatus,
  getHealthRecommendation,
} from "../data/sampleData";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const CITIES = Object.keys(cityAQIData);

export default function Dashboard({ selectedCity, setSelectedCity }) {
  const [aqiData, setAqiData] = useState(cityAQIData[selectedCity]);
  const [forecast, setForecast] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const data = cityAQIData[selectedCity];
    setAqiData(data);
    setForecast(generateForecast(selectedCity));
    setLastUpdated(new Date());
  }, [selectedCity]);

  useEffect(() => {
    if (!chartRef.current || !forecast.length) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    const ctx = chartRef.current.getContext("2d");
    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: forecast.slice(0, 5).map((f) => f.label),
        datasets: [{
          label: "Forecast AQI",
          data: forecast.slice(0, 5).map((f) => f.AQI),
          borderColor: "#1a3a6b",
          backgroundColor: "rgba(26,58,107,0.08)",
          pointBackgroundColor: forecast.slice(0, 5).map((f) => f.status.color),
          pointRadius: 5,
          pointBorderColor: "white",
          pointBorderWidth: 2,
          fill: true,
          tension: 0.4,
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `AQI: ${ctx.raw} — ${getAQIStatus(ctx.raw).label}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: { color: "rgba(200,216,238,0.5)" },
            ticks: { font: { size: 11 }, color: "#4a5a70" },
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, color: "#4a5a70" },
          },
        },
      },
    });
    return () => { if (chartInstanceRef.current) chartInstanceRef.current.destroy(); };
  }, [forecast]);

  if (!aqiData) return <div className="loading-spinner">Loading...</div>;

  const status = getAQIStatus(aqiData.AQI);
  const health = getHealthRecommendation(aqiData.AQI);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-title">🏛️ Air Quality Dashboard</div>
          <div className="page-subtitle">
            <span className="status-dot"></span>
            Real-time data — Last updated: {lastUpdated.toLocaleTimeString("en-IN")} IST
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--gov-text-secondary)" }}>
            SELECT LOCATION:
          </label>
          <select
            className="gov-select"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            {CITIES.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>
      </div>

      {/* Breadcrumb */}
      <div style={{ fontSize: "11px", color: "var(--gov-text-secondary)", marginBottom: "14px" }}>
        Home &gt; Dashboard &gt; <strong>{selectedCity}</strong>
      </div>

      {/* AQI Alert Banner */}
      {aqiData.AQI > 200 && (
        <div style={{
          background: "#fef2f2",
          border: "1.5px solid #ef4444",
          borderLeft: "5px solid #ef4444",
          borderRadius: "4px",
          padding: "12px 16px",
          marginBottom: "14px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "13px",
          fontWeight: "600",
          color: "#991b1b",
        }}>
          🚨 Air Quality Alert: Pollution levels are very high in {selectedCity}. Avoid outdoor activities.
          <button
            style={{ marginLeft: "auto", background: "#ef4444", color: "white", border: "none", padding: "4px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}
            onClick={() => {
              if ("Notification" in window) {
                Notification.requestPermission().then(p => {
                  if (p === "granted") new Notification("AQI Alert", { body: `AQI in ${selectedCity} is ${aqiData.AQI} — ${status.label}`, icon: "🏛️" });
                });
              }
            }}
          >
            Enable Push Alerts
          </button>
        </div>
      )}

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Current AQI Card */}
        <div className="card">
          <div className="card-header">📍 Current Air Quality — {selectedCity}</div>
          <div className="card-body">
            <div style={{
              background: `linear-gradient(135deg, ${status.color}22, ${status.color}11)`,
              border: `2px solid ${status.color}`,
              borderRadius: "6px",
              padding: "16px",
              marginBottom: "14px",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{ fontSize: "12px", color: "var(--gov-text-secondary)", fontWeight: "600", textTransform: "uppercase" }}>
                Location: {selectedCity}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
                <div className="aqi-value-large" style={{ color: status.color }}>{aqiData.AQI}</div>
                <div>
                  <div style={{ fontSize: "10px", color: "var(--gov-text-secondary)", marginBottom: "4px" }}>AIR QUALITY INDEX</div>
                  <div className="aqi-badge" style={{ background: status.color, color: "white" }}>
                    {status.label}
                  </div>
                </div>
              </div>
              <div style={{
                position: "absolute", right: "-10px", bottom: "-10px",
                fontSize: "80px", opacity: 0.08,
              }}>💨</div>
            </div>

            {/* Pollutant Readings */}
            <div className="pollutant-grid">
              {[
                { label: "PM2.5", value: aqiData.PM25, unit: "µg/m³", icon: "🔴" },
                { label: "PM10", value: aqiData.PM10, unit: "µg/m³", icon: "🟠" },
                { label: "NO₂", value: aqiData.NO2, unit: "µg/m³", icon: "🟡" },
                { label: "SO₂", value: aqiData.SO2, unit: "µg/m³", icon: "🟢" },
                { label: "CO", value: aqiData.CO, unit: "mg/m³", icon: "🔵" },
                { label: "AOD", value: aqiData.aod, unit: "(ISRO)", icon: "🛰️" },
              ].map((p) => (
                <div key={p.label} className="pollutant-item">
                  <div style={{ fontSize: "14px" }}>{p.icon}</div>
                  <div className="data-label">{p.label}</div>
                  <div className="data-value" style={{ fontSize: "16px" }}>{p.value}</div>
                  <div style={{ fontSize: "10px", color: "var(--gov-text-secondary)" }}>{p.unit}</div>
                </div>
              ))}
            </div>

            {/* Weather */}
            <hr className="section-divider" />
            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--gov-text-secondary)", marginBottom: "8px", textTransform: "uppercase" }}>
              🌤 IMD Weather Data
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                { label: "Temperature", value: `${aqiData.temperature}°C`, icon: "🌡️" },
                { label: "Humidity", value: `${aqiData.humidity}%`, icon: "💧" },
                { label: "Wind Speed", value: `${aqiData.windSpeed} km/h`, icon: "💨" },
                { label: "Rainfall", value: `${aqiData.rainfall} mm`, icon: "🌧️" },
              ].map((w) => (
                <div key={w.label} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
                  <span>{w.icon}</span>
                  <span style={{ color: "var(--gov-text-secondary)" }}>{w.label}:</span>
                  <span style={{ fontWeight: "600" }}>{w.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AQI Overview Chart */}
        <div className="card">
          <div className="card-header">📊 AQI Overview — All Monitored Cities</div>
          <div className="card-body">
            <AQIOverviewChart />
          </div>
        </div>

        {/* Pollution Forecast Summary */}
        <div className="card">
          <div className="card-header">🔮 Pollution Forecast</div>
          <div className="card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
              {forecast.slice(0, 3).map((f, i) => (
                <div key={i} style={{
                  background: `${f.status.bg}`,
                  border: `1px solid ${f.status.color}44`,
                  borderLeft: `4px solid ${f.status.color}`,
                  borderRadius: "4px",
                  padding: "10px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "13px" }}>{f.label}</div>
                    <div style={{ fontSize: "10px", color: "var(--gov-text-secondary)" }}>{f.date}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="forecast-aqi" style={{ color: f.status.color, fontSize: "22px" }}>{f.AQI}</div>
                    <div style={{ fontSize: "10px", color: f.status.color, fontWeight: "600" }}>{f.status.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ height: "140px" }}>
              <canvas ref={chartRef}></canvas>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dashboard-bottom">
        {/* City Selector Card */}
        <div className="card">
          <div className="card-header">🏙️ Station Overview — {selectedCity}</div>
          <div className="card-body">
            <div style={{ marginBottom: "12px" }}>
              <img
                src={`https://source.unsplash.com/400x150/?${selectedCity},skyline`}
                alt={selectedCity}
                style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "4px", marginBottom: "10px" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
            <table className="gov-table">
              <tbody>
                <tr><td style={{ color: "var(--gov-text-secondary)", fontSize: "12px" }}>Latitude</td><td style={{ fontWeight: "600" }}>{aqiData.latitude}° N</td></tr>
                <tr><td style={{ color: "var(--gov-text-secondary)", fontSize: "12px" }}>Longitude</td><td style={{ fontWeight: "600" }}>{aqiData.longitude}° E</td></tr>
                <tr><td style={{ color: "var(--gov-text-secondary)", fontSize: "12px" }}>Data Source</td><td style={{ fontWeight: "600" }}>CPCB</td></tr>
                <tr><td style={{ color: "var(--gov-text-secondary)", fontSize: "12px" }}>Satellite AOD</td><td style={{ fontWeight: "600" }}>{aqiData.aod} (ISRO Bhuvan)</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Health Advisory */}
        <div className="card">
          <div className="card-header">🩺 Health Advisory Panel</div>
          <div className="card-body">
            <div className="health-advisory" style={{
              borderLeftColor: status.color,
              background: `${status.bg}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span style={{ fontSize: "22px" }}>{health.icon}</span>
                <div>
                  <div style={{ fontWeight: "700", color: status.color, fontSize: "14px" }}>{health.title}</div>
                  <div style={{ fontSize: "12px", color: "var(--gov-text-secondary)" }}>{health.message}</div>
                </div>
              </div>
              {health.tips.map((tip, i) => (
                <div key={i} className="health-tip">
                  <span style={{ color: status.color, fontWeight: "700", fontSize: "14px" }}>•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>

            {/* AQI Scale */}
            <hr className="section-divider" />
            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--gov-text-secondary)", marginBottom: "8px", textTransform: "uppercase" }}>
              AQI Scale Reference
            </div>
            {[
              { range: "0–50", label: "Good", color: "#22c55e" },
              { range: "51–100", label: "Satisfactory", color: "#84cc16" },
              { range: "101–200", label: "Moderate", color: "#f59e0b" },
              { range: "201–300", label: "Poor", color: "#f97316" },
              { range: "301–400", label: "Very Poor", color: "#ef4444" },
              { range: "400+", label: "Hazardous", color: "#7f1d1d" },
            ].map((s) => (
              <div key={s.range} style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "4px 0", fontSize: "12px",
                borderBottom: "1px dashed var(--gov-border)",
              }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "2px", background: s.color, flexShrink: 0 }}></div>
                <span style={{ color: "var(--gov-text-secondary)", minWidth: "55px" }}>{s.range}</span>
                <span style={{ fontWeight: "600", color: s.color }}>{s.label}</span>
                {aqiData.AQI >= parseInt(s.range) && aqiData.AQI <= (parseInt(s.range.split("–")[1]) || 999) &&
                  <span style={{ marginLeft: "auto", fontSize: "10px", background: s.color, color: "white", padding: "1px 6px", borderRadius: "8px" }}>CURRENT</span>
                }
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Mini bar chart for all cities AQI overview
function AQIOverviewChart() {
  const chartRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (instanceRef.current) instanceRef.current.destroy();
    const cities = Object.values(cityAQIData);
    const ctx = chartRef.current.getContext("2d");
    instanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: cities.map((c) => c.location),
        datasets: [{
          label: "AQI",
          data: cities.map((c) => c.AQI),
          backgroundColor: cities.map((c) => getAQIStatus(c.AQI).color + "cc"),
          borderColor: cities.map((c) => getAQIStatus(c.AQI).color),
          borderWidth: 1.5,
          borderRadius: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `AQI: ${ctx.raw} (${getAQIStatus(ctx.raw).label})`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "rgba(200,216,238,0.5)" },
            ticks: { font: { size: 10 }, color: "#4a5a70" },
          },
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 10 },
              color: "#4a5a70",
              maxRotation: 45,
            },
          },
        },
      },
    });
    return () => { if (instanceRef.current) instanceRef.current.destroy(); };
  }, []);

  return (
    <div style={{ height: "320px" }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
}