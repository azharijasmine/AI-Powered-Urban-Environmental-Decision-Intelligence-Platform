// forecastRoutes.js
const express = require("express");
const router = express.Router();
const { getForecast } = require("../controllers/forecastController");
router.get("/:city", getForecast);
module.exports = router;