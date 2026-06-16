const { getAQIStatus } = require("./aqiController");

const mockCities = [
  { location: "Delhi", AQI: 182 }, { location: "Mumbai", AQI: 124 },
  { location: "Chennai", AQI: 165 }, { location: "Kolkata", AQI: 210 },
  { location: "Bangalore", AQI: 88 }, { location: "Lucknow", AQI: 238 },
  { location: "Ahmedabad", AQI: 195 },
];

exports.getAlerts = async (req, res) => {
  const alerts = mockCities
    .filter((c) => c.AQI > 150)
    .map((c) => ({
      city: c.location,
      AQI: c.AQI,
      status: getAQIStatus(c.AQI),
      severity: c.AQI > 300 ? "hazardous" : c.AQI > 200 ? "high" : "moderate",
      message: c.AQI > 300
        ? `EMERGENCY: AQI ${c.AQI} — Stay indoors. Hazardous conditions.`
        : c.AQI > 200
        ? `WARNING: AQI ${c.AQI} — Avoid outdoor activities. Wear mask.`
        : `ADVISORY: AQI ${c.AQI} — Sensitive groups should limit outdoor exposure.`,
      timestamp: new Date().toISOString(),
    }));

  res.json({ count: alerts.length, alerts });
};