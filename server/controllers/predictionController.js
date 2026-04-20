const axios = require("axios");
const ML_API_URL = process.env.ML_API_URL || "http://localhost:5001";

// ─── POST /api/predict ───────────────────────────────────────────────────────
const predict = async (req, res) => {
  try {
    const body = req.body;
    if (!body.State_UT_Name || !body.Year) {
      return res.status(400).json({
        success: false,
        error: "State_UT_Name and Year are required fields",
      });
    }

    const response = await axios.post(`${ML_API_URL}/api/predict`, body, {
      timeout: 15000,
    });

    res.json(response.data);
  } catch (err) {
    const msg = err.response?.data?.error || err.message;
    res.status(500).json({ success: false, error: `ML API: ${msg}` });
  }
};

// ─── POST /api/predict/forecast ──────────────────────────────────────────────
const forecast = async (req, res) => {
  try {
    const { State_UT_Name, base_data, years } = req.body;
    if (!State_UT_Name) {
      return res.status(400).json({ success: false, error: "State_UT_Name is required" });
    }

    const response = await axios.post(
      `${ML_API_URL}/api/predict/forecast`,
      { State_UT_Name, base_data, years },
      { timeout: 20000 }
    );

    res.json(response.data);
  } catch (err) {
    const msg = err.response?.data?.error || err.message;
    res.status(500).json({ success: false, error: `ML API: ${msg}` });
  }
};

// ─── GET /api/predict/metrics ────────────────────────────────────────────────
const getMetrics = async (req, res) => {
  try {
    const response = await axios.get(`${ML_API_URL}/api/metrics`, { timeout: 10000 });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { predict, forecast, getMetrics };
