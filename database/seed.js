// database/seed.js
// Run: node database/seed.js
// Purpose: Seeds MongoDB with sample CPCB air quality data

const mongoose = require("mongoose");
require("dotenv").config({ path: "../backend/.env" });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/airqualitydb";

const AQISchema = new mongoose.Schema({
  location: String, latitude: Number, longitude: Number,
  AQI: Number, PM25: Number, PM10: Number, NO2: Number, SO2: Number, CO: Number,
  temperature: Number, humidity: Number, windSpeed: Number, rainfall: Number, pressure: Number,
  aod: Number, timestamp: { type: Date, default: Date.now }, source: { type: String, default: "CPCB" },
});

const AQIReading = mongoose.model("AQIReading", AQISchema);

const cities = [
  { location: "Delhi", latitude: 28.6139, longitude: 77.2090, baseAQI: 182, PM25: 105, PM10: 175, NO2: 62, SO2: 18, CO: 1.2, temperature: 28, humidity: 55, windSpeed: 4, rainfall: 0, pressure: 1012, aod: 0.65 },
  { location: "Mumbai", latitude: 19.0760, longitude: 72.8777, baseAQI: 124, PM25: 68, PM10: 112, NO2: 45, SO2: 12, CO: 0.9, temperature: 32, humidity: 78, windSpeed: 12, rainfall: 2, pressure: 1008, aod: 0.42 },
  { location: "Chennai", latitude: 13.0827, longitude: 80.2707, baseAQI: 165, PM25: 78, PM10: 135, NO2: 32, SO2: 10, CO: 0.7, temperature: 34, humidity: 70, windSpeed: 8, rainfall: 0, pressure: 1010, aod: 0.38 },
  { location: "Kolkata", latitude: 22.5726, longitude: 88.3639, baseAQI: 210, PM25: 128, PM10: 198, NO2: 74, SO2: 22, CO: 1.5, temperature: 30, humidity: 82, windSpeed: 3, rainfall: 0, pressure: 1009, aod: 0.72 },
  { location: "Bangalore", latitude: 12.9716, longitude: 77.5946, baseAQI: 88, PM25: 42, PM10: 78, NO2: 28, SO2: 8, CO: 0.5, temperature: 26, humidity: 62, windSpeed: 10, rainfall: 5, pressure: 915, aod: 0.28 },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await AQIReading.deleteMany({});
    console.log("🗑️  Cleared existing data");

    const records = [];
    const now = new Date();

    for (const city of cities) {
      // Generate 30 days of historical data
      for (let d = 30; d >= 0; d--) {
        const date = new Date(now);
        date.setDate(date.getDate() - d);
        const variation = (Math.random() - 0.5) * 40;
        records.push({
          location: city.location,
          latitude: city.latitude,
          longitude: city.longitude,
          AQI: Math.max(10, Math.round(city.baseAQI + variation)),
          PM25: Math.max(5, Math.round(city.PM25 + variation * 0.6)),
          PM10: Math.max(8, Math.round(city.PM10 + variation * 0.8)),
          NO2: Math.max(5, Math.round(city.NO2 + variation * 0.3)),
          SO2: Math.max(2, Math.round(city.SO2 + variation * 0.2)),
          CO: parseFloat(Math.max(0.1, city.CO + variation * 0.01).toFixed(2)),
          temperature: Math.round(city.temperature + (Math.random() - 0.5) * 6),
          humidity: Math.round(Math.min(100, Math.max(20, city.humidity + (Math.random() - 0.5) * 20))),
          windSpeed: Math.max(0, Math.round(city.windSpeed + (Math.random() - 0.5) * 8)),
          rainfall: city.rainfall,
          pressure: city.pressure,
          aod: parseFloat((city.aod + (Math.random() - 0.5) * 0.1).toFixed(2)),
          timestamp: date,
          source: "CPCB",
        });
      }
    }

    await AQIReading.insertMany(records);
    console.log(`✅ Seeded ${records.length} records across ${cities.length} cities`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
}

seed();