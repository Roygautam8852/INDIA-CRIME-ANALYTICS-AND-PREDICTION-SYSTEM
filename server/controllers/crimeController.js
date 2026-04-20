const Crime = require("../models/Crime");

// Helper to build match filter from query
const buildMatch = (query) => {
  const { year, state, region, zone, category } = query;
  const match = {};
  if (year)     match.Year = Number(year);
  if (state)    match.State_UT_Name = new RegExp(state, "i");
  if (region)   match.Region = new RegExp(region, "i");
  if (zone)     match.Zone = new RegExp(zone, "i");
  if (category) match.Crime_Category = new RegExp(category, "i");
  return match;
};

// ─── GET /api/crimes ─────────────────────────────────────────────────────────
const getCrimes = async (req, res) => {
  try {
    const { limit = 100, page = 1 } = req.query;
    const filter = buildMatch(req.query);
    const skip = (Number(page) - 1) * Number(limit);
    
    const [data, total] = await Promise.all([
      Crime.find(filter).skip(skip).limit(Number(limit)).lean(),
      Crime.countDocuments(filter),
    ]);

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── GET /api/states ─────────────────────────────────────────────────────────
const getStates = async (req, res) => {
  try {
    const match = buildMatch(req.query);
    const data = await Crime.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$State_UT_Name",
          Region: { $first: "$Region" },
          Zone: { $first: "$Zone" },
          avgCrimeRate: { $avg: "$Crime_Rate_Per_1L" },
          totalIPC: { $sum: "$IPC_Crimes" },
          totalSLL: { $sum: "$SLL_Crimes" },
          totalCognizable: { $sum: "$Total_Cognizable_Crimes" },
          avgWomenCrimes: { $avg: "$Crimes_Against_Women" },
          totalCyber: { $sum: "$Cyber_Crimes" },
          totalRape: { $sum: "$Rape_Cases" },
          totalKidnapping: { $sum: "$Kidnapping_Cases" },
          totalMurder: { $sum: "$Murder_Sec302" },
          avgConviction: { $avg: "$Conviction_Rate_Pct" },
          avgChargesheeting: { $avg: "$Chargesheeting_Rate_Pct" },
          avgPoliceStrength: { $avg: "$Police_Strength" },
          records: { $sum: 1 },
        },
      },
      { $sort: { totalCognizable: -1 } },
    ]);

    res.json({
      success: true,
      count: data.length,
      data: data.map((d) => ({
        state: d._id,
        region: d.Region,
        zone: d.Zone,
        avgCrimeRate: Math.round(d.avgCrimeRate * 100) / 100,
        totalIPC: d.totalIPC,
        totalSLL: d.totalSLL,
        totalCognizable: d.totalCognizable,
        avgWomenCrimes: Math.round(d.avgWomenCrimes),
        totalCyber: d.totalCyber,
        totalRape: d.totalRape,
        totalKidnapping: d.totalKidnapping,
        totalMurder: d.totalMurder,
        avgConviction: Math.round(d.avgConviction * 100) / 100,
        avgChargesheeting: Math.round(d.avgChargesheeting * 100) / 100,
        avgPoliceStrength: Math.round(d.avgPoliceStrength),
        records: d.records,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── GET /api/trends ─────────────────────────────────────────────────────────
const getTrends = async (req, res) => {
  try {
    const match = buildMatch(req.query);
    const data = await Crime.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$Year",
          totalCognizable: { $sum: "$Total_Cognizable_Crimes" },
          totalIPC: { $sum: "$IPC_Crimes" },
          totalSLL: { $sum: "$SLL_Crimes" },
          totalWomen: { $sum: "$Crimes_Against_Women" },
          totalCyber: { $sum: "$Cyber_Crimes" },
          totalRape: { $sum: "$Rape_Cases" },
          totalKidnapping: { $sum: "$Kidnapping_Cases" },
          totalMurder: { $sum: "$Murder_Sec302" },
          totalDowry: { $sum: "$Dowry_Deaths" },
          totalDomestic: { $sum: "$Domestic_Violence" },
          avgCrimeRate: { $avg: "$Crime_Rate_Per_1L" },
          avgConviction: { $avg: "$Conviction_Rate_Pct" },
          avgChargesheeting: { $avg: "$Chargesheeting_Rate_Pct" },
          states: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: data.map((d) => ({
        year: d._id,
        totalCognizable: d.totalCognizable,
        totalIPC: d.totalIPC,
        totalSLL: d.totalSLL,
        totalWomen: d.totalWomen,
        totalCyber: d.totalCyber,
        totalRape: d.totalRape,
        totalKidnapping: d.totalKidnapping,
        totalMurder: d.totalMurder,
        totalDowry: d.totalDowry,
        totalDomestic: d.totalDomestic,
        avgCrimeRate: Math.round(d.avgCrimeRate * 100) / 100,
        avgConviction: Math.round(d.avgConviction * 100) / 100,
        avgChargesheeting: Math.round(d.avgChargesheeting * 100) / 100,
        stateCount: d.states,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── GET /api/women ──────────────────────────────────────────────────────────
const getWomenSafety = async (req, res) => {
  try {
    const match = buildMatch(req.query);
    const data = await Crime.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$State_UT_Name",
          Region: { $first: "$Region" },
          Zone: { $first: "$Zone" },
          totalWomen: { $sum: "$Crimes_Against_Women" },
          totalRape: { $sum: "$Rape_Cases" },
          totalKidnapping: { $sum: "$Kidnapping_Cases" },
          totalDowry: { $sum: "$Dowry_Deaths" },
          totalDomestic: { $sum: "$Domestic_Violence" },
          avgCrimeRate: { $avg: "$Crime_Rate_Per_1L" },
        },
      },
      { $sort: { totalWomen: -1 } },
    ]);

    res.json({
      success: true,
      count: data.length,
      data: data.map((d) => ({
        state: d._id,
        region: d.Region,
        zone: d.Zone,
        totalWomen: d.totalWomen,
        totalRape: d.totalRape,
        totalKidnapping: d.totalKidnapping,
        totalDowry: d.totalDowry,
        totalDomestic: d.totalDomestic,
        avgCrimeRate: Math.round(d.avgCrimeRate * 100) / 100,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── GET /api/overview ───────────────────────────────────────────────────────
const getOverview = async (req, res) => {
  try {
    const match = buildMatch(req.query);
    const [totals, topStates, topWomenCrimes, yearlyData, distinctFields] = await Promise.all([
      Crime.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalCognizable: { $sum: "$Total_Cognizable_Crimes" },
            totalIPC: { $sum: "$IPC_Crimes" },
            totalWomen: { $sum: "$Crimes_Against_Women" },
            totalCyber: { $sum: "$Cyber_Crimes" },
            avgCrimeRate: { $avg: "$Crime_Rate_Per_1L" },
            avgConviction: { $avg: "$Conviction_Rate_Pct" },
          },
        },
      ]),
      Crime.aggregate([
        { $match: match },
        { $group: { _id: "$State_UT_Name", total: { $sum: "$Total_Cognizable_Crimes" } } },
        { $sort: { total: -1 } },
        { $limit: 10 },
      ]),
      Crime.aggregate([
        { $match: match },
        { $group: { _id: "$State_UT_Name", total: { $sum: "$Crimes_Against_Women" } } },
        { $sort: { total: -1 } },
        { $limit: 10 },
      ]),
      Crime.aggregate([
        { $match: match },
        { $group: { _id: "$Year", total: { $sum: "$Total_Cognizable_Crimes" } } },
        { $sort: { _id: 1 } },
      ]),
      Crime.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            states: { $addToSet: "$State_UT_Name" },
            years: { $addToSet: "$Year" },
          },
        },
        {
          $project: {
            _id: 0,
            stateCount: { $size: "$states" },
            yearCount: { $size: "$years" },
          },
        },
      ]),
    ]);

    const t = totals[0] || {};
    const d = distinctFields[0] || { stateCount: 0, yearCount: 0 };

    res.json({
      success: true,
      summary: {
        totalCognizableCrimes: t.totalCognizable || 0,
        totalIPCCrimes: t.totalIPC || 0,
        totalWomenCrimes: t.totalWomen || 0,
        totalCyberCrimes: t.totalCyber || 0,
        avgCrimeRate: Math.round((t.avgCrimeRate || 0) * 100) / 100,
        avgConvictionRate: Math.round((t.avgConviction || 0) * 100) / 100,
        stateCount: d.stateCount,
        yearCount: d.yearCount,
      },
      topCrimeStates: topStates.map((s) => ({ state: s._id, total: s.total })),
      topWomenCrimeStates: topWomenCrimes.map((s) => ({ state: s._id, total: s.total })),
      yearlyTrend: yearlyData.map((y) => ({ year: y._id, total: y.total })),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── GET /api/filters ────────────────────────────────────────────────────────
const getFilters = async (req, res) => {
  try {
    const [years, states, regions, zones, categories] = await Promise.all([
      Crime.distinct("Year"),
      Crime.distinct("State_UT_Name"),
      Crime.distinct("Region"),
      Crime.distinct("Zone"),
      Crime.distinct("Crime_Category"),
    ]);

    res.json({
      success: true,
      years: years.sort((a, b) => a - b),
      states: states.sort(),
      regions: regions.sort(),
      zones: zones.sort(),
      categories: categories.sort(),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getCrimes, getStates, getTrends, getWomenSafety, getOverview, getFilters };
