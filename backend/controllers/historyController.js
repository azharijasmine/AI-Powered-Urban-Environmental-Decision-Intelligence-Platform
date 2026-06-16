const AQIReading = require("../models/AQIReading");

// Generate mock historical data
const generateMockHistory = (city, days) => {
  const baseAQI = { Delhi: 182, Mumbai: 124, Chennai: 165, Kolkata: 210, Bangalore: 88 }[city] || 150;
  const data = [];
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const variation = (Math.random() - 0.5) * 40;
    const aqi = Math.max(10, Math.round(baseAQI + variation));
    data.push({
      date: date.toISOString().split("T")[0],
      location: city,
      AQI: aqi,
      PM25: Math.max(5, Math.round(aqi * 0.55 + (Math.random() - 0.5) * 10)),
      PM10: Math.max(8, Math.round(aqi * 0.85 + (Math.random() - 0.5) * 15)),
      NO2: Math.max(5, Math.round(aqi * 0.35 + (Math.random() - 0.5) * 8)),
      SO2: Math.max(2, Math.round(aqi * 0.12 + (Math.random() - 0.5) * 4)),
      temperature: Math.round(28 + (Math.random() - 0.5) * 8),
      humidity: Math.round(60 + (Math.random() - 0.5) * 30),
      windSpeed: Math.max(0, Math.round(8 + (Math.random() - 0.5) * 10)),
    });
  }
  return data;
};

exports.getHistory = async (req, res) => {
  const { city } = req.params;
  const days = parseInt(req.query.days) || 30;

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const data = await AQIReading.find({
      location: city,
      timestamp: { $gte: startDate },
    }).sort({ timestamp: 1 }).lean();

    if (!data.length) return res.json(generateMockHistory(city, days));
    res.json(data);
  } catch {
    res.json(generateMockHistory(city, days));
  }
};