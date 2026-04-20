const express = require("express");
const router = express.Router();
const {
  getCrimes, getStates, getTrends, getWomenSafety, getOverview, getFilters,
} = require("../controllers/crimeController");
const { predict, forecast, getMetrics } = require("../controllers/predictionController");

// ─── Data Endpoints ───────────────────────────────────────────────────────────
router.get("/crimes",   getCrimes);
router.get("/states",   getStates);
router.get("/trends",   getTrends);
router.get("/women",    getWomenSafety);
router.get("/overview", getOverview);
router.get("/filters",  getFilters);

// ─── ML Prediction Endpoints ─────────────────────────────────────────────────
router.post("/predict",          predict);
router.post("/predict/forecast", forecast);
router.get("/predict/metrics",   getMetrics);

module.exports = router;
