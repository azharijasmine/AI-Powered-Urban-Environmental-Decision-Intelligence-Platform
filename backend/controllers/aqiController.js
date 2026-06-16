// backend/controllers/aqiController.js
// All mock data is embedded here — NO external file imports needed

const mockData = {
  Delhi: { location:"Delhi", latitude:28.6139, longitude:77.2090, AQI:182, PM25:105, PM10:175, NO2:62, SO2:18, CO:1.2, temperature:28, humidity:55, windSpeed:4, rainfall:0, pressure:1012, aod:0.65, source:"CPCB" },
  Mumbai: { location:"Mumbai", latitude:19.0760, longitude:72.8777, AQI:124, PM25:68, PM10:112, NO2:45, SO2:12, CO:0.9, temperature:32, humidity:78, windSpeed:12, rainfall:2, pressure:1008, aod:0.42, source:"CPCB" },
  Chennai: { location:"Chennai", latitude:13.0827, longitude:80.2707, AQI:165, PM25:78, PM10:135, NO2:32, SO2:10, CO:0.7, temperature:34, humidity:70, windSpeed:8, rainfall:0, pressure:1010, aod:0.38, source:"CPCB" },
  Kolkata: { location:"Kolkata", latitude:22.5726, longitude:88.3639, AQI:210, PM25:128, PM10:198, NO2:74, SO2:22, CO:1.5, temperature:30, humidity:82, windSpeed:3, rainfall:0, pressure:1009, aod:0.72, source:"CPCB" },
  Bangalore: { location:"Bangalore", latitude:12.9716, longitude:77.5946, AQI:88, PM25:42, PM10:78, NO2:28, SO2:8, CO:0.5, temperature:26, humidity:62, windSpeed:10, rainfall:5, pressure:915, aod:0.28, source:"CPCB" },
  Hyderabad: { location:"Hyderabad", latitude:17.3850, longitude:78.4867, AQI:142, PM25:75, PM10:118, NO2:38, SO2:14, CO:0.8, temperature:31, humidity:58, windSpeed:7, rainfall:0, pressure:1005, aod:0.45, source:"CPCB" },
  Pune: { location:"Pune", latitude:18.5204, longitude:73.8567, AQI:96, PM25:48, PM10:88, NO2:30, SO2:9, CO:0.6, temperature:29, humidity:60, windSpeed:9, rainfall:1, pressure:943, aod:0.32, source:"CPCB" },
  Ahmedabad: { location:"Ahmedabad", latitude:23.0225, longitude:72.5714, AQI:195, PM25:115, PM10:168, NO2:55, SO2:20, CO:1.3, temperature:35, humidity:40, windSpeed:5, rainfall:0, pressure:1006, aod:0.58, source:"CPCB" },
  Jaipur: { location:"Jaipur", latitude:26.9124, longitude:75.7873, AQI:155, PM25:85, PM10:142, NO2:40, SO2:15, CO:1.0, temperature:36, humidity:35, windSpeed:6, rainfall:0, pressure:1003, aod:0.50, source:"CPCB" },
  Lucknow: { location:"Lucknow", latitude:26.8467, longitude:80.9462, AQI:238, PM25:145, PM10:220, NO2:82, SO2:28, CO:1.8, temperature:27, humidity:68, windSpeed:2, rainfall:0, pressure:1007, aod:0.80, source:"CPCB" },
};

exports.getAQIStatus = (aqi) => {
  if (aqi <= 50)  return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "Very Poor";
  return "Hazardous";
};

exports.getAllCities = async (req, res) => {
  try {
    const AQIReading = require("../models/AQIReading");
    const data = await AQIReading.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { _id: "$location", doc: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$doc" } },
    ]);
    if (!data.length) return res.json(Object.values(mockData));
    res.json(data);
  } catch {
    res.json(Object.values(mockData));
  }
};

exports.getCityAQI = async (req, res) => {
  const { city } = req.params;
  try {
    const AQIReading = require("../models/AQIReading");
    const data = await AQIReading.findOne({ location: city }).sort({ timestamp: -1 });
    if (!data) return res.json(mockData[city] || { error: "City not found" });
    res.json(data);
  } catch {
    res.json(mockData[city] || { error: "City not found" });
  }
};

exports.addReading = async (req, res) => {
  try {
    const AQIReading = require("../models/AQIReading");
    const reading = new AQIReading(req.body);
    await reading.save();
    res.status(201).json({ success: true, data: reading });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};