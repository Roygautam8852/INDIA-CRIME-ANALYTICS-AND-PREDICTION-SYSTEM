"""
India Crime Analytics - ML Training Script
Trains Random Forest and Linear Regression models to predict Total Cognizable Crimes
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import joblib
import json
import os
import warnings
warnings.filterwarnings('ignore')

# ─── Paths ──────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, "crime_dataset_of_india.xlsx")
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "saved_models")
os.makedirs(MODEL_DIR, exist_ok=True)

print("=" * 60)
print("  India Crime Analytics - Model Training")
print("=" * 60)

# ─── 1. Load Data ────────────────────────────────────────────────────────────
print("\n[1/7] Loading dataset...")
df = pd.read_excel(DATASET_PATH)
print(f"      Loaded {df.shape[0]} rows × {df.shape[1]} columns")

# ─── 2. Data Cleaning ────────────────────────────────────────────────────────
print("[2/7] Cleaning data...")
df = df.drop(columns=["S.No"], errors="ignore")

# Fill any missing numerics with median
num_cols = df.select_dtypes(include=np.number).columns
for col in num_cols:
    df[col].fillna(df[col].median(), inplace=True)

# Fill categorical with mode
cat_cols = df.select_dtypes(include="object").columns
for col in cat_cols:
    df[col].fillna(df[col].mode()[0], inplace=True)

print(f"      No nulls remaining: {df.isnull().sum().sum() == 0}")

# ─── 3. Feature Engineering ──────────────────────────────────────────────────
print("[3/7] Feature engineering...")

# Encode categorical features
le_dict = {}
encode_cols = ["State_UT_Name", "Region", "State_or_UT", "Zone",
               "Crime_Category", "Development_Index", "Police_Zone_Grade"]

for col in encode_cols:
    if col in df.columns:
        le = LabelEncoder()
        df[col + "_enc"] = le.fit_transform(df[col].astype(str))
        le_dict[col] = {
            "classes": le.classes_.tolist(),
            "mapping": {str(c): int(i) for i, c in enumerate(le.classes_)}
        }

# ─── 4. Feature Selection ────────────────────────────────────────────────────
print("[4/7] Selecting features...")

FEATURE_COLS = [
    "Year",
    "State_UT_Name_enc",
    "Region_enc",
    "Zone_enc",
    "Crime_Category_enc",
    "Development_Index_enc",
    "Population_Lakhs",
    "Area_SqKm",
    "IPC_Crimes",
    "SLL_Crimes",
    "Crimes_Against_Women",
    "Rape_Cases",
    "Kidnapping_Cases",
    "Dowry_Deaths",
    "Domestic_Violence",
    "Cyber_Crimes",
    "Murder_Sec302",
    "Attempt_Murder",
    "Robbery_Dacoity",
    "Chargesheeting_Rate_Pct",
    "Conviction_Rate_Pct",
    "Police_Strength",
    "Pct_Change_vs_PrevYear",
]

TARGET = "Total_Cognizable_Crimes"

# Only keep features that exist
FEATURE_COLS = [c for c in FEATURE_COLS if c in df.columns]
print(f"      Using {len(FEATURE_COLS)} features → target: {TARGET}")

X = df[FEATURE_COLS]
y = df[TARGET]

# ─── 5. Train / Test Split ───────────────────────────────────────────────────
print("[5/7] Splitting train/test (80/20)...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
print(f"      Train: {len(X_train)} rows | Test: {len(X_test)} rows")

# Scale for Linear Regression
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# ─── 6. Train Models ─────────────────────────────────────────────────────────
print("[6/7] Training models...")

# --- Linear Regression ---
lr = LinearRegression()
lr.fit(X_train_scaled, y_train)
y_pred_lr = lr.predict(X_test_scaled)
lr_metrics = {
    "r2": round(float(r2_score(y_test, y_pred_lr)), 4),
    "mae": round(float(mean_absolute_error(y_test, y_pred_lr)), 2),
    "rmse": round(float(np.sqrt(mean_squared_error(y_test, y_pred_lr))), 2),
}
print(f"      Linear Regression  → R²={lr_metrics['r2']}  MAE={lr_metrics['mae']}")

# --- Random Forest ---
rf = RandomForestRegressor(
    n_estimators=200,
    max_depth=15,
    min_samples_split=4,
    min_samples_leaf=2,
    n_jobs=-1,
    random_state=42,
)
rf.fit(X_train, y_train)
y_pred_rf = rf.predict(X_test)
rf_metrics = {
    "r2": round(float(r2_score(y_test, y_pred_rf)), 4),
    "mae": round(float(mean_absolute_error(y_test, y_pred_rf)), 2),
    "rmse": round(float(np.sqrt(mean_squared_error(y_test, y_pred_rf))), 2),
}
print(f"      Random Forest      → R²={rf_metrics['r2']}  MAE={rf_metrics['mae']}")

# Feature importance
feat_importance = dict(
    zip(FEATURE_COLS, [round(float(v), 6) for v in rf.feature_importances_])
)
feat_importance = dict(sorted(feat_importance.items(), key=lambda x: x[1], reverse=True))

# ─── 7. Save Artifacts ───────────────────────────────────────────────────────
print("[7/7] Saving models & metadata...")

joblib.dump(rf, os.path.join(MODEL_DIR, "random_forest_model.pkl"))
joblib.dump(lr, os.path.join(MODEL_DIR, "linear_regression_model.pkl"))
joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.pkl"))

metadata = {
    "feature_cols": FEATURE_COLS,
    "target": TARGET,
    "label_encoders": le_dict,
    "models": {
        "random_forest": rf_metrics,
        "linear_regression": lr_metrics,
    },
    "feature_importance": feat_importance,
    "train_size": len(X_train),
    "test_size": len(X_test),
    "dataset_shape": list(df.shape),
}

with open(os.path.join(MODEL_DIR, "model_metadata.json"), "w") as f:
    json.dump(metadata, f, indent=2)

print("\n" + "=" * 60)
print("  Training Complete!")
print("=" * 60)
print(f"  Best Model : Random Forest  (R²={rf_metrics['r2']})")
print(f"  MAE        : {rf_metrics['mae']:,.0f} crimes")
print(f"  Models saved to: {MODEL_DIR}")
print("=" * 60)
