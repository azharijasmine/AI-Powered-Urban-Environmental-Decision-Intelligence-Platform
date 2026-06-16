const express = require("express");
const router = express.Router();
const { getHistory } = require("../controllers/historyController");
router.get("/:city", getHistory);
module.exports = router;