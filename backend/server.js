const express  = require("express");
const cors     = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const aqiRoutes = require("./routes/aqiRoutes");

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/api/aqi", aqiRoutes);
app.get("/", (req, res) => res.json({ message: "Air Quality Monitor API running" }));

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/airquality";
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.warn("MongoDB not connected (using sample data):", err.message));

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));