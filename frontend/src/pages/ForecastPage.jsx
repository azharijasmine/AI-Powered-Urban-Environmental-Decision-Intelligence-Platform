import React, { useState, useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { cityAQIData, generateForecast, getAQIStatus } from "../data/sampleData";
Chart.register(...registerables);

const CITIES = Object.keys(cityAQIData);

export default function ForecastPage({ selectedCity }) {
  const [city, setCity] = useState(selectedCity);
  const [forecast, setForecast] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [modelOutput, setModelOutput] = useState([]);
  const chartRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    setForecast(generateForecast(city));
  }, [city]);

  useEffect(() => {
    if (!forecast.length) return;
    renderForecastChart();
    return () => { if (instanceRef.current) instanceRef.current.destroy(); };
  }, [forecast]);

  const renderForecastChart = () => {
    if (!chartRef.current) return;
    if (instanceRef.current) instanceRef.current.destroy();
    const ctx = chartRef.current.getContext("2d");

    instanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: forecast.map((f) => f.label),
        datasets: [
          {
            label: "Forecasted AQI",
            data: forecast.map((f) => f.AQI),
            borderColor: "#1a3a6b",
            backgroundColor: "rgba(26,58,107,0.07)",
            pointBackgroundColor: forecast.map((f) => f.status.color),
            pointRadius: 7,
            pointBorderColor: "white",
            pointBorderWidth: 2,
            fill: true,
            tension: 0.4,
            borderWidth: 2.5,
            borderDash: [8, 3],
          },
          {
            label: "PM2.5",
            data: forecast.map((f) => f.PM25),
            borderColor: "#ef4444",
            backgroundColor: "transparent",
            pointRadius: 4,
            fill: false,
            tension: 0.4,
            borderWidth: 1.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            position: "top",
            labels: { font: { size: 11 }, padding: 12, usePointStyle: true },
          },
          tooltip: {
            backgroundColor: "white",
            titleColor: "#1a3a6b",
            bodyColor: "#4a5a70",
            borderColor: "#c8d8ee",
            borderWidth: 1,
            padding: 10,
            callbacks: {
              afterLabel: (ctx) => {
                if (ctx.dataset.label === "Forecasted AQI") {
                  return `Status: ${getAQIStatus(ctx.raw).label}`;
                }
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: { color: "rgba(200,216,238,0.5)" },
            ticks: { font: { size: 11 }, color: "#4a5a70" },
            title: { display: true, text: "AQI / PM2.5", color: "#4a5a70", font: { size: 11 } },
          },
          x: {
            grid: { color: "rgba(200,216,238,0.2)" },
            ticks: { font: { size: 11 }, color: "#4a5a70" },
          },
        },
      },
    });
  };

  const runMLSimulation = () => {
    setIsRunning(true);
    setModelOutput([]);
    const logs = [
      "🔄 Initializing Random Forest model...",
      `📥 Loading historical AQI data for ${city} (30 days)...`,
      "🌤️ Fetching IMD weather parameters (Temperature, Humidity, Wind, Pressure)...",
      "🛰️ Loading ISRO satellite AOD data...",
      "📊 Extracting feature matrix: [AQI_lag1, AQI_lag3, AQI_lag7, temp, humidity, wind, rainfall, aod]",
      "🌳 Training Random Forest (100 trees, max_depth=8)...",
      "✅ Model training complete — RMSE: 18.4, R²: 0.87",
      "⚙️ Running time-series forecast (ARIMA + RF ensemble)...",
      `📈 Generating 7-day forecast for ${city}...`,
      "✅ Forecast complete. Confidence interval: ±15%",
    ];

    logs.forEach((log, i) => {
      setTimeout(() => {
        setModelOutput((prev) => [...prev, log]);
        if (i === logs.length - 1) setIsRunning(false);
      }, i * 400);
    });
  };

  const baseData = cityAQIData[city];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">🔮 Air Quality Forecast</div>
          <div className="page-subtitle">7-day pollution forecast using ensemble ML model (Random Forest + ARIMA)</div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <select className="gov-select" value={city} onChange={(e) => setCity(e.target.value)}>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="gov-btn" onClick={runMLSimulation} disabled={isRunning}>
            {isRunning ? "⚙️ Running..." : "▶ Run ML Forecast"}
          </button>
        </div>
      </div>

      {/* Model Input Summary */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="card-header">📥 Forecast Model Inputs — {city}</div>
        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
            {[
              { label: "Current AQI", value: baseData.AQI, icon: "💨", color: getAQIStatus(baseData.AQI).color },
              { label: "Wind Speed (IMD)", value: `${baseData.windSpeed} km/h`, icon: "🌬️", color: "#1a3a6b" },
              { label: "Humidity (IMD)", value: `${baseData.humidity}%`, icon: "💧", color: "#1a3a6b" },
              { label: "Satellite AOD (ISRO)", value: baseData.aod, icon: "🛰️", color: "#1a3a6b" },
            ].map((s) => (
              <div key={s.label} style={{
                background: "var(--gov-bg)",
                border: "1px solid var(--gov-border)",
                borderRadius: "4px",
                padding: "12px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}>
                <span style={{ fontSize: "22px" }}>{s.icon}</span>
                <div>
                  <div className="data-label">{s.label}</div>
                  <div className="data-value" style={{ color: s.color }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Forecast Cards */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="card-header">📅 7-Day AQI Forecast — {city}</div>
        <div className="card-body">
          <div className="forecast-cards" style={{ marginBottom: "20px" }}>
            {forecast.map((f, i) => (
              <div key={i} className="forecast-card" style={{
                borderTop: `3px solid ${f.status.color}`,
                background: i === 0 ? `${f.status.bg}` : "var(--gov-bg)",
              }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--gov-text-secondary)", marginBottom: "4px" }}>{f.label}</div>
                <div style={{ fontSize: "9px", color: "var(--gov-text-secondary)", marginBottom: "8px" }}>{f.date}</div>
                <div className="forecast-aqi" style={{ color: f.status.color }}>{f.AQI}</div>
                <div style={{ fontSize: "9px", color: f.status.color, fontWeight: "700", marginBottom: "6px" }}>{f.status.label}</div>
                <div style={{ fontSize: "9px", color: "var(--gov-text-secondary)" }}>🌡️ {f.temperature}°C</div>
                <div style={{ fontSize: "9px", color: "var(--gov-text-secondary)" }}>💨 {f.windSpeed} km/h</div>
                {i === 0 && <div style={{ fontSize: "9px", background: "#1a3a6b", color: "white", padding: "2px 4px", borderRadius: "2px", marginTop: "4px" }}>TODAY</div>}
              </div>
            ))}
          </div>

          {/* Forecast Chart */}
          <div style={{ height: "260px" }}>
            <canvas ref={chartRef}></canvas>
          </div>
        </div>
      </div>

      {/* ML Model Console */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="card-header">🤖 ML Forecast Engine Console</div>
        <div className="card-body">
          <div style={{
            background: "#0f172a",
            borderRadius: "4px",
            padding: "16px",
            fontFamily: "monospace",
            fontSize: "12px",
            color: "#94a3b8",
            minHeight: "180px",
            maxHeight: "220px",
            overflowY: "auto",
          }}>
            <div style={{ color: "#64748b", marginBottom: "8px" }}>// CPCB-AQI Random Forest + ARIMA Ensemble Model v2.1</div>
            {modelOutput.length === 0 && !isRunning && (
              <div style={{ color: "#475569" }}>Click "Run ML Forecast" to execute the prediction model...</div>
            )}
            {modelOutput.map((log, i) => (
              <div key={i} style={{ marginBottom: "4px", color: log.startsWith("✅") ? "#4ade80" : log.startsWith("❌") ? "#f87171" : "#94a3b8" }}>
                <span style={{ color: "#475569", marginRight: "8px" }}>[{String(i + 1).padStart(2, "0")}]</span>
                {log}
              </div>
            ))}
            {isRunning && <div style={{ color: "#fbbf24" }}>▊ Processing...</div>}
          </div>
          <div style={{ marginTop: "10px", fontSize: "11px", color: "var(--gov-text-secondary)" }}>
            Model features: AQI lag-1/3/7, Temperature, Humidity, Wind Speed, Rainfall, AOD (ISRO Bhuvan), Pressure (IMD)
          </div>
        </div>
      </div>

      {/* Weather Impact Table */}
      <div className="card">
        <div className="card-header">🌤️ Weather-Pollution Impact Analysis</div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="gov-table">
            <thead>
              <tr>
                <th>Weather Condition</th>
                <th>Effect on AQI</th>
                <th>Mechanism</th>
                <th>Impact Level</th>
              </tr>
            </thead>
            <tbody>
              {[
                { cond: "Strong Wind (>15 km/h)", effect: "Decreases", mechanism: "Disperses pollutants laterally", impact: "High", color: "#22c55e" },
                { cond: "No Wind (<3 km/h)", effect: "Increases", mechanism: "Pollutants accumulate near surface", impact: "High", color: "#ef4444" },
                { cond: "Heavy Rainfall (>10mm)", effect: "Decreases", mechanism: "Wet deposition of particles", impact: "High", color: "#22c55e" },
                { cond: "High Humidity (>80%)", effect: "Increases", mechanism: "PM particles absorb moisture and grow", impact: "Medium", color: "#f97316" },
                { cond: "High Temperature (>35°C)", effect: "Increases", mechanism: "Enhances photochemical smog (NO₂+VOC)", impact: "Medium", color: "#f97316" },
                { cond: "Temperature Inversion", effect: "Increases strongly", mechanism: "Traps pollution layer near ground", impact: "Very High", color: "#ef4444" },
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: "600", fontSize: "12px" }}>{row.cond}</td>
                  <td><span style={{ color: row.color, fontWeight: "700" }}>{row.effect}</span></td>
                  <td style={{ fontSize: "12px", color: "var(--gov-text-secondary)" }}>{row.mechanism}</td>
                  <td><span style={{ background: row.color + "22", color: row.color, padding: "2px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: "700" }}>{row.impact}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}