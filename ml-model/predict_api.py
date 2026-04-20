"""
India Crime Analytics - Flask ML Prediction API
Serves predictions from trained scikit-learn models
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import json
import numpy as np
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# ─── Load Models ─────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "saved_models")

print("Loading models...")
rf_model = joblib.load(os.path.join(MODEL_DIR, "random_forest_model.pkl"))
lr_model = joblib.load(os.path.join(MODEL_DIR, "linear_regression_model.pkl"))
scaler   = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))

with open(os.path.join(MODEL_DIR, "model_metadata.json")) as f:
    metadata = json.load(f)

FEATURE_COLS = metadata["feature_cols"]
le_dict = metadata["label_encoders"]
print("Models loaded successfully!")

def encode_input(data: dict) -> np.ndarray:
    """Encode a prediction request dict into a feature vector."""
    row = {}
    for col in FEATURE_COLS:
        if col.endswith("_enc"):
            orig = col[:-4]   # strip _enc suffix
            mapping = le_dict.get(orig, {}).get("mapping", {})
            val = str(data.get(orig, ""))
            # Default to 0 if unknown
            row[col] = mapping.get(val, 0)
        else:
            row[col] = float(data.get(col, 0))
    return np.array([[row[c] for c in FEATURE_COLS]])

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "models": list(metadata["models"].keys())})

@app.route("/api/metrics", methods=["GET"])
def model_metrics():
    return jsonify({
        "models": metadata["models"],
        "feature_importance": metadata["feature_importance"],
        "dataset_shape": metadata["dataset_shape"],
        "train_size": metadata["train_size"],
        "test_size": metadata["test_size"],
    })

@app.route("/api/predict", methods=["POST"])
def predict():
    """
    Expects JSON body:
    {
      "model": "random_forest" | "linear_regression",
      "Year": 2025,
      "State_UT_Name": "Maharashtra",
      "Region": "West",
      "Zone": "Western",
      "Crime_Category": "High",
      "Development_Index": "High",
      "Population_Lakhs": 1241,
      "Area_SqKm": 307713,
      "IPC_Crimes": 180000,
      "SLL_Crimes": 50000,
      ...
    }
    """
    try:
        body = request.get_json(force=True)
        model_choice = body.get("model", "random_forest")

        X = encode_input(body)

        if model_choice == "linear_regression":
            X_scaled = scaler.transform(X)
            prediction = float(lr_model.predict(X_scaled)[0])
        else:
            prediction = float(rf_model.predict(X)[0])

        return jsonify({
            "success": True,
            "model": model_choice,
            "predicted_total_cognizable_crimes": round(prediction),
            "input_features": {k: body.get(k) for k in [
                "Year", "State_UT_Name", "Region", "Zone",
                "Crime_Category", "Population_Lakhs",
            ]},
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/predict/forecast", methods=["POST"])
def forecast():
    """
    Forecast crime for multiple future years for a given state.
    Body: { "State_UT_Name": "...", "base_data": {...}, "years": [2026,2027,2028] }
    """
    try:
        body = request.get_json(force=True)
        base = body.get("base_data", {})
        years = body.get("years", list(range(2026, 2031)))

        results = []
        for yr in years:
            payload = {**base, "Year": yr}
            X = encode_input(payload)
            val = float(rf_model.predict(X)[0])
            results.append({"year": yr, "predicted": round(val)})

        return jsonify({"success": True, "forecast": results})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
