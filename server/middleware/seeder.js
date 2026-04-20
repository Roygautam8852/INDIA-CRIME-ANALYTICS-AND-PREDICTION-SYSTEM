/**
 * Crime data seeder
 * Reads the Excel dataset and inserts/upserts into MongoDB
 */
const mongoose = require("mongoose");
const XLSX = require("xlsx");
const path = require("path");
require("dotenv").config();

const Crime = require("../models/Crime");

const DATASET_PATH = path.join(__dirname, "../../crime_dataset_of_india.xlsx");

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/crime_predictor";

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Read Excel
    const wb = XLSX.readFile(DATASET_PATH);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws);
    console.log(`📂 Loaded ${rows.length} rows from Excel`);

    // Drop existing
    await Crime.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Map rows → model fields
    const docs = rows.map((r) => ({
      Year: Number(r["Year"]) || 0,
      State_UT_Name: r["State_UT_Name"] || "",
      Region: r["Region"] || "",
      State_or_UT: r["State_or_UT"] || "",
      Zone: r["Zone"] || "",
      Crime_Category: r["Crime_Category"] || "",
      Development_Index: r["Development_Index"] || "",
      Police_Zone_Grade: r["Police_Zone_Grade"] || "",
      Population_Lakhs: Number(r["Population_Lakhs"]) || 0,
      Area_SqKm: Number(r["Area_SqKm"]) || 0,
      IPC_Crimes: Number(r["IPC_Crimes"]) || 0,
      SLL_Crimes: Number(r["SLL_Crimes"]) || 0,
      Total_Cognizable_Crimes: Number(r["Total_Cognizable_Crimes"]) || 0,
      Crime_Rate_Per_1L: Number(r["Crime_Rate_Per_1L"]) || 0,
      Crimes_Against_Women: Number(r["Crimes_Against_Women"]) || 0,
      Rape_Cases: Number(r["Rape_Cases"]) || 0,
      Kidnapping_Cases: Number(r["Kidnapping_Cases"]) || 0,
      Dowry_Deaths: Number(r["Dowry_Deaths"]) || 0,
      Domestic_Violence: Number(r["Domestic_Violence"]) || 0,
      Cyber_Crimes: Number(r["Cyber_Crimes"]) || 0,
      Murder_Sec302: Number(r["Murder_Sec302"]) || 0,
      Attempt_Murder: Number(r["Attempt_Murder"]) || 0,
      Robbery_Dacoity: Number(r["Robbery_Dacoity"]) || 0,
      Chargesheeting_Rate_Pct: Number(r["Chargesheeting_Rate_Pct"]) || 0,
      Conviction_Rate_Pct: Number(r["Conviction_Rate_Pct"]) || 0,
      Police_Strength: Number(r["Police_Strength"]) || 0,
      Pct_Change_vs_PrevYear: Number(r["Pct_Change_vs_PrevYear"]) || 0,
    }));

    // Batch insert
    const batchSize = 500;
    for (let i = 0; i < docs.length; i += batchSize) {
      await Crime.insertMany(docs.slice(i, i + batchSize));
      console.log(`   Inserted batch ${Math.ceil((i + 1) / batchSize)}`);
    }

    console.log(`✅ Seeded ${docs.length} records successfully`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
}

seed();
