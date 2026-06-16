import React, { useState, useEffect } from "react";
import { cityAQIData, getAQIStatus, getHealthRecommendation } from "../data/sampleData";

export default function AlertsPage({ selectedCity, setAlertCount }) {
  const [alerts, setAlerts] = useState([]);
  const [notifPermission, setNotifPermission] = useState("default");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    generateAlerts();
    if ("Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const generateAlerts = () => {
    const now = new Date();
    const allAlerts = [];

    Object.values(cityAQIData).forEach((city) => {
      const status = getAQIStatus(city.AQI);

      if (city.AQI > 300) {
        allAlerts.push({
          id: `${city.location}-hazardous`,
          type: "danger",
          city: city.location,
          title: `🚨 Hazardous Air Quality — ${city.location}`,
          message: `AQI has reached ${city.AQI} (${status.label}). Entire population at serious health risk. Emergency conditions.`,
          aqi: city.AQI,
          time: new Date(now - Math.random() * 3600000).toLocaleTimeString("en-IN"),
          date: now.toLocaleDateString("en-IN"),
          pm25: city.PM25,
          action: "Immediate Action Required",
        });
      } else if (city.AQI > 200) {
        allAlerts.push({
          id: `${city.location}-poor`,
          type: "warning",
          city: city.location,
          title: `⚠️ Very Poor Air Quality — ${city.location}`,
          message: `AQI is ${city.AQI} (${status.label}). Health effects expected. Sensitive groups severely affected.`,
          aqi: city.AQI,
          time: new Date(now - Math.random() * 7200000).toLocaleTimeString("en-IN"),
          date: now.toLocaleDateString("en-IN"),
          pm25: city.PM25,
          action: "Health Advisory Issued",
        });
      } else if (city.AQI > 150) {
        allAlerts.push({
          id: `${city.location}-moderate`,
          type: "info",
          city: city.location,
          title: `ℹ️ Moderate Air Quality — ${city.location}`,
          message: `AQI is ${city.AQI} (${status.label}). Sensitive groups should reduce outdoor activities.`,
          aqi: city.AQI,
          time: new Date(now - Math.random() * 10800000).toLocaleTimeString("en-IN"),
          date: now.toLocaleDateString("en-IN"),
          pm25: city.PM25,
          action: "Advisory",
        });
      }
    });

    allAlerts.sort((a, b) => b.aqi - a.aqi);
    setAlerts(allAlerts);
    if (setAlertCount) setAlertCount(allAlerts.filter((a) => a.type === "danger" || a.type === "warning").length);
  };

  const requestNotification = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        setNotifPermission(permission);
        if (permission === "granted") {
          alerts.filter((a) => a.type === "danger").forEach((a) => {
            new Notification(`🚨 AQI Alert — ${a.city}`, {
              body: a.message,
              tag: a.id,
            });
          });
        }
      });
    }
  };

  const sendTestNotification = () => {
    if (notifPermission === "granted") {
      new Notification("🔔 AQI Test Alert — CPCB System", {
        body: `Air Quality in ${selectedCity} is ${cityAQIData[selectedCity]?.AQI}. Check the CPCB portal for details.`,
      });
    }
  };

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.type === filter);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">🔔 Pollution Alert System</div>
          <div className="page-subtitle">Real-time alerts for high pollution events across India</div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {notifPermission !== "granted" ? (
            <button className="gov-btn" onClick={requestNotification}>
              🔔 Enable Push Notifications
            </button>
          ) : (
            <button className="gov-btn-outline" onClick={sendTestNotification}>
              📤 Send Test Alert
            </button>
          )}
        </div>
      </div>

      {/* Notification Status Banner */}
      <div style={{
        background: notifPermission === "granted" ? "#dcfce7" : "#fffbeb",
        border: `1px solid ${notifPermission === "granted" ? "#86efac" : "#fde68a"}`,
        borderRadius: "4px",
        padding: "10px 16px",
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "13px",
      }}>
        <span style={{ fontSize: "18px" }}>{notifPermission === "granted" ? "✅" : "⚠️"}</span>
        <span>
          {notifPermission === "granted"
            ? "Push notifications are enabled. You will receive alerts for hazardous AQI levels."
            : notifPermission === "denied"
            ? "Push notifications are blocked. Enable them in browser settings to receive AQI alerts."
            : "Enable push notifications to receive real-time AQI alerts from CPCB."}
        </span>
      </div>

      {/* Alert Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "16px" }}>
        {[
          { label: "Total Alerts", value: alerts.length, icon: "🔔", color: "#1a3a6b" },
          { label: "Hazardous", value: alerts.filter((a) => a.type === "danger").length, icon: "🚨", color: "#ef4444" },
          { label: "Warning", value: alerts.filter((a) => a.type === "warning").length, icon: "⚠️", color: "#f97316" },
          { label: "Advisory", value: alerts.filter((a) => a.type === "info").length, icon: "ℹ️", color: "#f59e0b" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ cursor: "pointer" }} onClick={() => setFilter(s.label === "Total Alerts" ? "all" : s.label === "Hazardous" ? "danger" : s.label === "Warning" ? "warning" : "info")}>
            <div className="card-body" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "24px" }}>{s.icon}</span>
              <div>
                <div className="data-label">{s.label}</div>
                <div className="data-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        {[
          { key: "all", label: "All Alerts" },
          { key: "danger", label: "🚨 Hazardous" },
          { key: "warning", label: "⚠️ Warning" },
          { key: "info", label: "ℹ️ Advisory" },
        ].map((f) => (
          <button key={f.key} className={`tab-btn ${filter === f.key ? "active" : ""}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Alert List */}
      {filtered.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: "center", padding: "40px", color: "var(--gov-text-secondary)" }}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>✅</div>
            <div style={{ fontWeight: "600" }}>No alerts for this filter</div>
          </div>
        </div>
      ) : (
        filtered.map((alert) => {
          const st = getAQIStatus(alert.aqi);
          const health = getHealthRecommendation(alert.aqi);
          return (
            <div key={alert.id} className={`alert-item ${alert.type}`}>
              <div style={{ fontSize: "28px", flexShrink: 0 }}>{alert.type === "danger" ? "🚨" : alert.type === "warning" ? "⚠️" : "ℹ️"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                  <div style={{ fontWeight: "700", fontSize: "14px" }}>{alert.title}</div>
                  <div style={{ fontSize: "11px", color: "var(--gov-text-secondary)", flexShrink: 0, marginLeft: "10px" }}>
                    {alert.date} {alert.time}
                  </div>
                </div>
                <div style={{ fontSize: "13px", marginBottom: "8px", color: "var(--gov-text-secondary)" }}>{alert.message}</div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", fontSize: "12px", alignItems: "center" }}>
                  <span style={{ background: st.color, color: "white", padding: "2px 10px", borderRadius: "10px", fontWeight: "700" }}>
                    AQI {alert.aqi}
                  </span>
                  <span style={{ color: "var(--gov-text-secondary)" }}>PM2.5: <strong>{alert.pm25} µg/m³</strong></span>
                  <span style={{
                    background: alert.type === "danger" ? "#fef2f2" : alert.type === "warning" ? "#fff7ed" : "#fffbeb",
                    color: alert.type === "danger" ? "#ef4444" : alert.type === "warning" ? "#f97316" : "#f59e0b",
                    padding: "2px 8px",
                    border: `1px solid ${alert.type === "danger" ? "#fecaca" : alert.type === "warning" ? "#fed7aa" : "#fde68a"}`,
                    borderRadius: "3px",
                    fontWeight: "600",
                    fontSize: "11px",
                  }}>
                    {alert.action}
                  </span>
                </div>
                {/* Health tip */}
                <div style={{ marginTop: "8px", background: "rgba(255,255,255,0.6)", borderRadius: "4px", padding: "6px 10px", fontSize: "12px", color: "var(--gov-text-secondary)" }}>
                  💡 <strong>Advisory:</strong> {health.tips[0]}
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* City AQI Quick Status Table */}
      <div className="card" style={{ marginTop: "16px" }}>
        <div className="card-header">📋 Current AQI Status — All Monitored Cities</div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="gov-table">
            <thead>
              <tr>
                <th>City</th>
                <th>AQI</th>
                <th>PM2.5 (µg/m³)</th>
                <th>Status</th>
                <th>Alert Level</th>
                <th>Health Advisory</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(cityAQIData).sort((a, b) => b.AQI - a.AQI).map((city) => {
                const st = getAQIStatus(city.AQI);
                const alertLevel = city.AQI > 300 ? "Hazardous" : city.AQI > 200 ? "High Alert" : city.AQI > 150 ? "Moderate" : "Normal";
                const alertColor = city.AQI > 300 ? "#ef4444" : city.AQI > 200 ? "#f97316" : city.AQI > 150 ? "#f59e0b" : "#22c55e";
                return (
                  <tr key={city.location}>
                    <td style={{ fontWeight: "600" }}>{city.location}</td>
                    <td style={{ fontWeight: "700", color: st.color, fontFamily: "Rajdhani, sans-serif", fontSize: "15px" }}>{city.AQI}</td>
                    <td>{city.PM25}</td>
                    <td><span style={{ background: st.color + "22", color: st.color, padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "700" }}>{st.label}</span></td>
                    <td><span style={{ background: alertColor + "22", color: alertColor, padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "700" }}>{alertLevel}</span></td>
                    <td style={{ fontSize: "12px", color: "var(--gov-text-secondary)" }}>{getHealthRecommendation(city.AQI).tips[0].substring(0, 50)}...</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}