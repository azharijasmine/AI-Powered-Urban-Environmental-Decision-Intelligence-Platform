const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/aqiController");

router.get("/all",              ctrl.getAllCities);
router.get("/alerts/active",    ctrl.getAlerts);
router.get("/history/:city",    ctrl.getHistory);
router.get("/forecast/:city",   ctrl.getForecast);
router.get("/:city",            ctrl.getCityAQI);
router.post("/reverse-geocode", ctrl.reverseGeocode);

module.exports = router;