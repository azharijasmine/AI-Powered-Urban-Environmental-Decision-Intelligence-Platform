// Sample AQI Data for Indian Cities - Simulates CPCB Dataset
export const cityAQIData = {
  Delhi: {
    location: "Delhi",
    latitude: 28.6139,
    longitude: 77.2090,
    AQI: 182,
    PM25: 105,
    PM10: 175,
    NO2: 62,
    SO2: 18,
    CO: 1.2,
    temperature: 28,
    humidity: 55,
    windSpeed: 4,
    rainfall: 0,
    pressure: 1012,
    aod: 0.65,
    timestamp: new Date().toISOString(),
  },
  Mumbai: {
    location: "Mumbai",
    latitude: 19.0760,
    longitude: 72.8777,
    AQI: 124,
    PM25: 68,
    PM10: 112,
    NO2: 45,
    SO2: 12,
    CO: 0.9,
    temperature: 32,
    humidity: 78,
    windSpeed: 12,
    rainfall: 2,
    pressure: 1008,
    aod: 0.42,
    timestamp: new Date().toISOString(),
  },
  Chennai: {
    location: "Chennai",
    latitude: 13.0827,
    longitude: 80.2707,
    AQI: 165,
    PM25: 78,
    PM10: 135,
    NO2: 32,
    SO2: 10,
    CO: 0.7,
    temperature: 34,
    humidity: 70,
    windSpeed: 8,
    rainfall: 0,
    pressure: 1010,
    aod: 0.38,
    timestamp: new Date().toISOString(),
  },
  Kolkata: {
    location: "Kolkata",
    latitude: 22.5726,
    longitude: 88.3639,
    AQI: 210,
    PM25: 128,
    PM10: 198,
    NO2: 74,
    SO2: 22,
    CO: 1.5,
    temperature: 30,
    humidity: 82,
    windSpeed: 3,
    rainfall: 0,
    pressure: 1009,
    aod: 0.72,
    timestamp: new Date().toISOString(),
  },
  Bangalore: {
    location: "Bangalore",
    latitude: 12.9716,
    longitude: 77.5946,
    AQI: 88,
    PM25: 42,
    PM10: 78,
    NO2: 28,
    SO2: 8,
    CO: 0.5,
    temperature: 26,
    humidity: 62,
    windSpeed: 10,
    rainfall: 5,
    pressure: 915,
    aod: 0.28,
    timestamp: new Date().toISOString(),
  },
  Hyderabad: {
    location: "Hyderabad",
    latitude: 17.3850,
    longitude: 78.4867,
    AQI: 142,
    PM25: 75,
    PM10: 118,
    NO2: 38,
    SO2: 14,
    CO: 0.8,
    temperature: 31,
    humidity: 58,
    windSpeed: 7,
    rainfall: 0,
    pressure: 1005,
    aod: 0.45,
    timestamp: new Date().toISOString(),
  },
  Pune: {
    location: "Pune",
    latitude: 18.5204,
    longitude: 73.8567,
    AQI: 96,
    PM25: 48,
    PM10: 88,
    NO2: 30,
    SO2: 9,
    CO: 0.6,
    temperature: 29,
    humidity: 60,
    windSpeed: 9,
    rainfall: 1,
    pressure: 943,
    aod: 0.32,
    timestamp: new Date().toISOString(),
  },
  Ahmedabad: {
    location: "Ahmedabad",
    latitude: 23.0225,
    longitude: 72.5714,
    AQI: 195,
    PM25: 115,
    PM10: 168,
    NO2: 55,
    SO2: 20,
    CO: 1.3,
    temperature: 35,
    humidity: 40,
    windSpeed: 5,
    rainfall: 0,
    pressure: 1006,
    aod: 0.58,
    timestamp: new Date().toISOString(),
  },
  Jaipur: {
    location: "Jaipur",
    latitude: 26.9124,
    longitude: 75.7873,
    AQI: 155,
    PM25: 85,
    PM10: 142,
    NO2: 40,
    SO2: 15,
    CO: 1.0,
    temperature: 36,
    humidity: 35,
    windSpeed: 6,
    rainfall: 0,
    pressure: 1003,
    aod: 0.50,
    timestamp: new Date().toISOString(),
  },
  Lucknow: {
    location: "Lucknow",
    latitude: 26.8467,
    longitude: 80.9462,
    AQI: 238,
    PM25: 145,
    PM10: 220,
    NO2: 82,
    SO2: 28,
    CO: 1.8,
    temperature: 27,
    humidity: 68,
    windSpeed: 2,
    rainfall: 0,
    pressure: 1007,
    aod: 0.80,
    timestamp: new Date().toISOString(),
  },
};

// Generate historical data for 30 days
export const generateHistoricalData = (city, days = 30) => {
  const baseData = cityAQIData[city] || cityAQIData.Delhi;
  const data = [];
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const variation = (Math.random() - 0.5) * 40;
    const windEffect = Math.random() > 0.7 ? -20 : 0;
    const rainEffect = Math.random() > 0.85 ? -30 : 0;

    data.push({
      date: date.toISOString().split("T")[0],
      AQI: Math.max(10, Math.round(baseData.AQI + variation + windEffect + rainEffect)),
      PM25: Math.max(5, Math.round(baseData.PM25 + variation * 0.6)),
      PM10: Math.max(8, Math.round(baseData.PM10 + variation * 0.8)),
      NO2: Math.max(5, Math.round(baseData.NO2 + variation * 0.3)),
      SO2: Math.max(2, Math.round(baseData.SO2 + variation * 0.2)),
      CO: Math.max(0.1, parseFloat((baseData.CO + variation * 0.01).toFixed(2))),
      temperature: Math.round(baseData.temperature + (Math.random() - 0.5) * 6),
      humidity: Math.round(Math.min(100, Math.max(20, baseData.humidity + (Math.random() - 0.5) * 20))),
      windSpeed: Math.max(0, Math.round(baseData.windSpeed + (Math.random() - 0.5) * 8)),
    });
  }
  return data;
};

// Forecast prediction algorithm (simulates Random Forest)
export const generateForecast = (city) => {
  const baseData = cityAQIData[city] || cityAQIData.Delhi;
  const forecast = [];

  let currentAQI = baseData.AQI;
  const windFactor = baseData.windSpeed > 10 ? -0.15 : baseData.windSpeed < 5 ? 0.12 : 0;
  const humidityFactor = baseData.humidity > 70 ? 0.08 : -0.05;
  const tempFactor = baseData.temperature > 33 ? 0.06 : -0.02;

  const labels = ["Today", "Tomorrow", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const trendFactor = 1 + windFactor + humidityFactor + tempFactor;
    const noise = (Math.random() - 0.5) * 15;
    currentAQI = Math.max(10, Math.round(currentAQI * trendFactor + noise));

    forecast.push({
      label: labels[i],
      date: date.toISOString().split("T")[0],
      AQI: currentAQI,
      status: getAQIStatus(currentAQI),
      PM25: Math.round(currentAQI * 0.55),
      temperature: Math.round(baseData.temperature + (Math.random() - 0.5) * 4),
      windSpeed: Math.max(0, Math.round(baseData.windSpeed + (Math.random() - 0.5) * 5)),
    });
  }
  return forecast;
};

export const getAQIStatus = (aqi) => {
  if (aqi <= 50) return { label: "Good", color: "#22c55e", bg: "#dcfce7", textColor: "#166534" };
  if (aqi <= 100) return { label: "Satisfactory", color: "#84cc16", bg: "#f7fee7", textColor: "#3f6212" };
  if (aqi <= 200) return { label: "Moderate", color: "#f59e0b", bg: "#fffbeb", textColor: "#92400e" };
  if (aqi <= 300) return { label: "Poor", color: "#f97316", bg: "#fff7ed", textColor: "#9a3412" };
  if (aqi <= 400) return { label: "Very Poor", color: "#ef4444", bg: "#fef2f2", textColor: "#991b1b" };
  return { label: "Hazardous", color: "#7f1d1d", bg: "#fef2f2", textColor: "#450a0a" };
};

export const getHealthRecommendation = (aqi) => {
  if (aqi <= 50) return {
    icon: "😊",
    title: "Air Quality: Good",
    message: "Air quality is satisfactory. Outdoor activities are completely safe for all groups.",
    tips: ["Enjoy outdoor activities freely", "Keep windows open for fresh air", "Ideal for exercise and sports"],
    severity: "good",
  };
  if (aqi <= 100) return {
    icon: "🙂",
    title: "Air Quality: Satisfactory",
    message: "Air quality is acceptable. Some pollutants may be a concern for sensitive individuals.",
    tips: ["Sensitive people should consider reducing prolonged outdoor exertion", "Children and elderly should monitor symptoms", "Generally safe for most people"],
    severity: "satisfactory",
  };
  if (aqi <= 200) return {
    icon: "😷",
    title: "Air Quality: Moderate",
    message: "Members of sensitive groups may experience health effects. General public less likely to be affected.",
    tips: ["Avoid prolonged outdoor exercise", "People with asthma should carry inhaler", "Consider wearing N95 mask outdoors"],
    severity: "moderate",
  };
  if (aqi <= 300) return {
    icon: "⚠️",
    title: "Air Quality: Poor",
    message: "Health effects may be experienced by everyone. Sensitive groups may face serious effects.",
    tips: ["Wear mask (N95/N99) when going outside", "Limit outdoor activities to essential ones", "Use air purifiers indoors", "Keep windows and doors closed"],
    severity: "poor",
  };
  if (aqi <= 400) return {
    icon: "🚨",
    title: "Air Quality: Very Poor",
    message: "Health warnings — everyone may experience serious health effects.",
    tips: ["Avoid all outdoor activities", "Wear high-quality mask if going out is necessary", "Run air purifier continuously", "Seek medical attention if experiencing symptoms"],
    severity: "very-poor",
  };
  return {
    icon: "☠️",
    title: "Air Quality: Hazardous",
    message: "EMERGENCY CONDITIONS — entire population affected. Health alert: everyone may experience serious effects.",
    tips: ["Stay indoors — do NOT go outside", "Seal windows and doors", "Use air purifier on highest setting", "Call emergency services if experiencing breathing difficulty"],
    severity: "hazardous",
  };
};

export const pollutionSources = [
  { name: "Anand Vihar Bus Terminal", lat: 28.6469, lng: 77.3160, type: "traffic", intensity: 9 },
  { name: "Narela Industrial Area", lat: 28.8555, lng: 77.0924, type: "industrial", intensity: 8 },
  { name: "Badarpur Thermal Plant", lat: 28.5021, lng: 77.3202, type: "industrial", intensity: 10 },
  { name: "Okhla Construction Zone", lat: 28.5311, lng: 77.2682, type: "construction", intensity: 6 },
  { name: "Haryana Crop Burning Zone", lat: 29.0588, lng: 76.0856, type: "cropBurning", intensity: 8 },
  { name: "Gurgaon Industrial Sector", lat: 28.4595, lng: 77.0266, type: "industrial", intensity: 7 },
  { name: "NH-8 Traffic Corridor", lat: 28.5745, lng: 77.1603, type: "traffic", intensity: 7 },
  { name: "Wazirpur Industrial Area", lat: 28.6977, lng: 77.1621, type: "industrial", intensity: 8 },
];