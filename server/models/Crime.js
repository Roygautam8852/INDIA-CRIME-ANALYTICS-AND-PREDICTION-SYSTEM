const mongoose = require("mongoose");

const crimeSchema = new mongoose.Schema(
  {
    Year: { type: Number, required: true, index: true },
    State_UT_Name: { type: String, required: true, index: true },
    Region: { type: String },
    State_or_UT: { type: String },
    Zone: { type: String },
    Crime_Category: { type: String },
    Development_Index: { type: String },
    Police_Zone_Grade: { type: String },
    Population_Lakhs: { type: Number },
    Area_SqKm: { type: Number },
    IPC_Crimes: { type: Number },
    SLL_Crimes: { type: Number },
    Total_Cognizable_Crimes: { type: Number, index: true },
    Crime_Rate_Per_1L: { type: Number },
    Crimes_Against_Women: { type: Number },
    Rape_Cases: { type: Number },
    Kidnapping_Cases: { type: Number },
    Dowry_Deaths: { type: Number },
    Domestic_Violence: { type: Number },
    Cyber_Crimes: { type: Number },
    Murder_Sec302: { type: Number },
    Attempt_Murder: { type: Number },
    Robbery_Dacoity: { type: Number },
    Chargesheeting_Rate_Pct: { type: Number },
    Conviction_Rate_Pct: { type: Number },
    Police_Strength: { type: Number },
    Pct_Change_vs_PrevYear: { type: Number },
  },
  { timestamps: true }
);

// Compound index for common queries
crimeSchema.index({ Year: 1, State_UT_Name: 1 });
crimeSchema.index({ Region: 1, Year: 1 });

module.exports = mongoose.model("Crime", crimeSchema);
