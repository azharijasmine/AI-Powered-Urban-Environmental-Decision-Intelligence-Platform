const mongoose = require("mongoose");

const AQISchema = new mongoose.Schema({
  location: { type: String, required: true, index: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  AQI: { type: Number, required: true },
  PM25: { type: Number },
  PM10: { type: Number },
  NO2: { type: Number },
  SO2: { type: Number },
  CO: { type: Number },
  // Weather (IMD)
  temperature: { type: Number },
  humidity: { type: Number },
  windSpeed: { type: Number },
  rainfall: { type: Number },
  pressure: { type: Number },
  // Satellite (ISRO)
  aod: { type: Number },
  timestamp: { type: Date, default: Date.now },
  source: { type: String, default: "CPCB" },
});

// Index for time-series queries
AQISchema.index({ location: 1, timestamp: -1 });

module.exports = mongoose.model("AQIReading", AQISchema);