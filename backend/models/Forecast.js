const mongoose = require("mongoose");

const ForecastSchema = new mongoose.Schema({
  location: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now },
  modelVersion: { type: String, default: "RF-ARIMA-2.1" },
  predictions: [{
    date: String,
    label: String,
    AQI: Number,
    PM25: Number,
    status: String,
    temperature: Number,
    windSpeed: Number,
    confidence: Number,
  }],
});

module.exports = mongoose.model("Forecast", ForecastSchema);