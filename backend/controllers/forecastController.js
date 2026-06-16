const { getAQIStatus } = require("./aqiController");

// Simulate Random Forest + ARIMA ensemble prediction
const generateForecast = (baseAQI, weather) => {
  const { windSpeed = 8, humidity = 60, temperature = 30, rainfall = 0 } = weather;

  // Feature weights (simulating trained RF model)
  const windFactor = windSpeed > 15 ? -0.18 : windSpeed > 10 ? -0.10 : windSpeed < 3 ? 0.15 : 0.02;
  const humidityFactor = humidity > 80 ? 0.10 : humidity > 60 ? 0.03 : -0.04;
  const tempFactor = temperature > 35 ? 0.08 : temperature > 30 ? 0.03 : -0.02;
  const rainFactor = rainfall > 10 ? -0.22 : rainfall > 5 ? -0.12 : rainfall > 0 ? -0.06 : 0;

  const labels = ["Today", "Tomorrow", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
  const forecast = [];
  let currentAQI = baseAQI;

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const trendFactor = 1 + windFactor + humidityFactor + tempFactor + rainFactor;
    const noise = (Math.random() - 0.5) * 12;
    currentAQI = Math.max(10, Math.round(currentAQI * trendFactor + noise));

    forecast.push({
      label: labels[i],
      date: date.toISOString().split("T")[0],
      AQI: currentAQI,
      PM25: Math.round(currentAQI * 0.55),
      status: getAQIStatus(currentAQI),
      temperature: Math.round(temperature + (Math.random() - 0.5) * 4),
      windSpeed: Math.max(0, Math.round(windSpeed + (Math.random() - 0.5) * 5)),
      confidence: Math.round(90 - i * 5),
    });
  }
  return forecast;
};

exports.getForecast = async (req, res) => {
  const { city } = req.params;
  const weather = {
    windSpeed: parseFloat(req.query.windSpeed) || 8,
    humidity: parseFloat(req.query.humidity) || 60,
    temperature: parseFloat(req.query.temperature) || 30,
    rainfall: parseFloat(req.query.rainfall) || 0,
  };
  const baseAQI = parseFloat(req.query.aqi) || 150;

  const forecast = generateForecast(baseAQI, weather);

  res.json({
    city,
    generatedAt: new Date().toISOString(),
    modelVersion: "RF-ARIMA-2.1",
    weatherInputs: weather,
    predictions: forecast,
  });
};