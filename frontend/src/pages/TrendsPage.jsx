import React, { useState, useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { cityAQIData, generateHistoricalData, getAQIStatus } from "../data/sampleData";
Chart.register(...registerables);

const CITIES = Object.keys(cityAQIData);
const TIME_RANGES = [
  { label: "7 Days", value: 7 },
  { label: "15 Days", value: 15 },
  { label: "30 Days", value: 30 },
];

export default function TrendsPage({ selectedCity }) {
  const [city, setCity] = useState(selectedCity);
  const [days, setDays] = useState(30);
  const [histData, setHistData] = useState([]);
  const [activeMetric, setActiveMetric] = useState("AQI");

  const aqiChartRef = useRef(null);
  const multiChartRef = useRef(null);
  const aqiInstanceRef = useRef(null);
  const multiInstanceRef = useRef(null);

  useEffect(() => {
    setHistData(generateHistoricalData(city, days));
  }, [city, days]);

  useEffect(() => {
    if (!histData.length) return;
    renderAQIChart();
    renderMultiChart();
    return () => {
      if (aqiInstanceRef.current) aqiInstanceRef.current.destroy();
      if (multiInstanceRef.current) multiInstanceRef.current.destroy();
    };
  }, [histData, activeMetric]);

  const renderAQIChart = () => {
    if (!aqiChartRef.current) return;
    if (aqiInstanceRef.current) aqiInstanceRef.current.destroy();

    const ctx = aqiChartRef.current.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, "rgba(26,58,107,0.25)");
    gradient.addColorStop(1, "rgba(26,58,107,0.02)");

    aqiInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: histData.map((d) => d.date),
        datasets: [{
          label: "AQI",
          data: histData.map((d) => d.AQI),
          borderColor: "#1a3a6b",
          backgroundColor: gradient,
          pointBackgroundColor: histData.map((d) => getAQIStatus(d.AQI).color),
          pointRadius: days <= 15 ? 5 : 3,
          pointBorderColor: "white",
          pointBorderWidth: 1.5,
          fill: true,
          tension: 0.4,
          borderWidth: 2.5,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "white",
            titleColor: "#1a3a6b",
            bodyColor: "#4a5a70",
            borderColor: "#c8d8ee",
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (ctx) => `AQI: ${ctx.raw} — ${getAQIStatus(ctx.raw).label}`,
            },
          },
          annotation: {
            annotations: {
              goodLine: { type: "line", yMin: 50, yMax: 50, borderColor: "#22c55e", borderWidth: 1, borderDash: [4, 4] },
              moderateLine: { type: "line", yMin: 200, yMax: 200, borderColor: "#f97316", borderWidth: 1, borderDash: [4, 4] },
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: { color: "rgba(200,216,238,0.5)" },
            ticks: { font: { size: 11 }, color: "#4a5a70" },
            title: { display: true, text: "AQI Value", color: "#4a5a70", font: { size: 11 } },
          },
          x: {
            grid: { color: "rgba(200,216,238,0.3)" },
            ticks: {
              font: { size: 10 },
              color: "#4a5a70",
              maxTicksLimit: 10,
              maxRotation: 45,
            },
          },
        },
      },
    });
  };

  const renderMultiChart = () => {
    if (!multiChartRef.current) return;
    if (multiInstanceRef.current) multiInstanceRef.current.destroy();

    const metrics = {
      PM25: { color: "#ef4444", label: "PM2.5 (µg/m³)" },
      PM10: { color: "#f97316", label: "PM10 (µg/m³)" },
      NO2: { color: "#8b5cf6", label: "NO₂ (µg/m³)" },
      SO2: { color: "#06b6d4", label: "SO₂ (µg/m³)" },
    };

    const ctx = multiChartRef.current.getContext("2d");
    multiInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: histData.map((d) => d.date),
        datasets: Object.entries(metrics).map(([key, val]) => ({
          label: val.label,
          data: histData.map((d) => d[key]),
          backgroundColor: val.color + "88",
          borderColor: val.color,
          borderWidth: 1,
          borderRadius: 2,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: { font: { size: 11 }, padding: 12, usePointStyle: true },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "rgba(200,216,238,0.5)" },
            ticks: { font: { size: 10 }, color: "#4a5a70" },
            title: { display: true, text: "Concentration (µg/m³)", color: "#4a5a70", font: { size: 10 } },
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 9 }, color: "#4a5a70", maxTicksLimit: 8, maxRotation: 45 },
          },
        },
      },
    });
  };

  // Stats
  const avgAQI = histData.length ? Math.round(histData.reduce((s, d) => s + d.AQI, 0) / histData.length) : 0;
  const maxAQI = histData.length ? Math.max(...histData.map((d) => d.AQI)) : 0;
  const minAQI = histData.length ? Math.min(...histData.map((d) => d.AQI)) : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">📈 Historical Pollution Trends</div>
          <div className="page-subtitle">Analytical data from CPCB ground monitoring stations</div>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select className="gov-select" value={city} onChange={(e) => setCity(e.target.value)}>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="tab-group">
            {TIME_RANGES.map((r) => (
              <button key={r.value} className={`tab-btn ${days === r.value ? "active" : ""}`} onClick={() => setDays(r.value)}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "16px" }}>
        {[
          { label: "Average AQI", value: avgAQI, icon: "📊", color: getAQIStatus(avgAQI).color },
          { label: "Maximum AQI", value: maxAQI, icon: "⬆️", color: getAQIStatus(maxAQI).color },
          { label: "Minimum AQI", value: minAQI, icon: "⬇️", color: getAQIStatus(minAQI).color },
          { label: "Days Monitored", value: histData.length, icon: "📅", color: "#1a3a6b" },
        ].map((s) => (
          <div key={s.label} className="card">
            <div className="card-body" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "24px" }}>{s.icon}</span>
              <div>
                <div className="data-label">{s.label}</div>
                <div className="data-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AQI Trend Chart */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="card-header">📈 AQI Trend — {city} ({days} Days)</div>
        <div className="card-body">
          <div style={{ height: "260px" }}>
            <canvas ref={aqiChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Multi-Pollutant Chart */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="card-header">🧪 Multi-Pollutant Analysis — PM2.5, PM10, NO₂, SO₂</div>
        <div className="card-body">
          <div style={{ height: "260px" }}>
            <canvas ref={multiChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="card">
        <div className="card-header">📋 Detailed Historical Data — {city}</div>
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="gov-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>AQI</th>
                <th>Status</th>
                <th>PM2.5</th>
                <th>PM10</th>
                <th>NO₂</th>
                <th>SO₂</th>
                <th>Temp (°C)</th>
                <th>Humidity (%)</th>
                <th>Wind (km/h)</th>
              </tr>
            </thead>
            <tbody>
              {[...histData].reverse().slice(0, 15).map((row, i) => {
                const st = getAQIStatus(row.AQI);
                return (
                  <tr key={i}>
                    <td style={{ fontWeight: "600", fontSize: "12px" }}>{row.date}</td>
                    <td style={{ fontWeight: "700", color: st.color, fontFamily: "Rajdhani, sans-serif", fontSize: "15px" }}>{row.AQI}</td>
                    <td>
                      <span style={{ background: st.color + "22", color: st.color, padding: "2px 7px", borderRadius: "10px", fontSize: "10px", fontWeight: "700" }}>
                        {st.label}
                      </span>
                    </td>
                    <td>{row.PM25}</td>
                    <td>{row.PM10}</td>
                    <td>{row.NO2}</td>
                    <td>{row.SO2}</td>
                    <td>{row.temperature}</td>
                    <td>{row.humidity}</td>
                    <td>{row.windSpeed}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ padding: "10px 16px", fontSize: "11px", color: "var(--gov-text-secondary)", borderTop: "1px solid var(--gov-border)" }}>
            Showing last 15 records. Data source: CPCB Ground Monitoring Stations + IMD Weather Data
          </div>
        </div>
      </div>
    </div>
  );
}