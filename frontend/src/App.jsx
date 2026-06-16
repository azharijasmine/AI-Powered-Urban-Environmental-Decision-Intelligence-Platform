import React, { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import MapPage from "./pages/MapPage";
import TrendsPage from "./pages/TrendsPage";
import ForecastPage from "./pages/ForecastPage";
import AlertsPage from "./pages/AlertsPage";
import "./App.css";


const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "🏛️" },
  { id: "map", label: "AQI Map", icon: "🗺️" },
  { id: "trends", label: "Trends", icon: "📈" },
  { id: "forecast", label: "Forecast", icon: "🔮" },
  { id: "alerts", label: "Alerts", icon: "🔔" },
];

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedCity, setSelectedCity] = useState("Delhi");
  const [alertCount, setAlertCount] = useState(3);

  useEffect(() => {
    document.title = "National Air Quality Monitoring System | CPCB";
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <Dashboard selectedCity={selectedCity} setSelectedCity={setSelectedCity} />;
      case "map": return <MapPage selectedCity={selectedCity} setSelectedCity={setSelectedCity} />;
      case "trends": return <TrendsPage selectedCity={selectedCity} />;
      case "forecast": return <ForecastPage selectedCity={selectedCity} />;
      case "alerts": return <AlertsPage selectedCity={selectedCity} setAlertCount={setAlertCount} />;
      default: return <Dashboard selectedCity={selectedCity} setSelectedCity={setSelectedCity} />;
    }
  };

  return (
    <div className="app-root">
      {/* Top Government Header Bar */}
      <div className="gov-top-bar">
        <span>AI-Powered Urban Environmental Decision Intelligence Platform</span>
        <span></span>
      </div>

      {/* Main Header */}
      <header className="main-header">
        <div className="header-left">
          <div className="emblem-container">
            <div className="emblem-circle">
              <span className="emblem-icon">🏛️</span>
            </div>
          </div>
          <div className="header-titles">
            <h1 className="header-title">AI-Powered Urban Environmental Decision Intelligence Platform</h1>
            <p className="header-subtitle">Central Pollution Control Board (CPCB) | Real-Time AQI Data</p>
          </div>
        </div>
        <div className="header-right">
          <div className="header-actions">
            <button className="header-btn" title="Reports">📋 Reports</button>
            <button className="header-btn" title="Settings">⚙️ Settings</button>
            <div className="alert-bell" onClick={() => setActivePage("alerts")}>
              <span>🔔</span>
              {alertCount > 0 && <span className="alert-badge">{alertCount}</span>}
            </div>
            <div className="user-avatar">👤</div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="main-nav">
        <div className="nav-inner">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.id === "alerts" && alertCount > 0 && (
                <span className="nav-badge">{alertCount}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Page Content */}
      <main className="main-content">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="main-footer">
        <div className="footer-inner">
          <div>
            <strong>Central Pollution Control Board (CPCB)</strong> 
          </div>
          <div>
            Data Sources: CPCB Ground Stations | IMD Weather Data | ISRO Bhuvan Satellite
          </div>
          <div>
            Last Updated: {new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
          </div>
        </div>
      </footer>
    </div>
  );
}