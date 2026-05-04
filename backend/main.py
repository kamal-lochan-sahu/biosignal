from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import json
import numpy as np
import pandas as pd
import shap

app = FastAPI(title="BioSignal API")

# CORS — frontend se connect hone ke liye
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model load karo
model = joblib.load("models/biosignal_model.pkl")
with open("models/feature_cols.json") as f:
    feature_cols = json.load(f)

explainer = shap.TreeExplainer(model)

# Input schema
class VitalsInput(BaseModel):
    heart_rate_mean: float
    heart_rate_std: float
    heart_rate_min: float
    heart_rate_max: float
    spo2_mean: float
    spo2_std: float
    spo2_min: float
    spo2_max: float
    bp_systolic_mean: float
    bp_systolic_std: float
    bp_systolic_min: float
    bp_systolic_max: float
    bp_diastolic_mean: float
    bp_diastolic_std: float
    bp_diastolic_min: float
    bp_diastolic_max: float
    respiratory_rate_mean: float
    respiratory_rate_std: float
    respiratory_rate_min: float
    respiratory_rate_max: float

@app.get("/")
def root():
    return {"status": "BioSignal API running"}

@app.post("/predict")
def predict(vitals: VitalsInput):
    # Input DataFrame banao
    input_data = pd.DataFrame([{
        "Heart Rate_mean": vitals.heart_rate_mean,
        "Heart Rate_std": vitals.heart_rate_std,
        "Heart Rate_min": vitals.heart_rate_min,
        "Heart Rate_max": vitals.heart_rate_max,
        "SpO2_mean": vitals.spo2_mean,
        "SpO2_std": vitals.spo2_std,
        "SpO2_min": vitals.spo2_min,
        "SpO2_max": vitals.spo2_max,
        "BP Systolic_mean": vitals.bp_systolic_mean,
        "BP Systolic_std": vitals.bp_systolic_std,
        "BP Systolic_min": vitals.bp_systolic_min,
        "BP Systolic_max": vitals.bp_systolic_max,
        "BP Diastolic_mean": vitals.bp_diastolic_mean,
        "BP Diastolic_std": vitals.bp_diastolic_std,
        "BP Diastolic_min": vitals.bp_diastolic_min,
        "BP Diastolic_max": vitals.bp_diastolic_max,
        "Respiratory Rate_mean": vitals.respiratory_rate_mean,
        "Respiratory Rate_std": vitals.respiratory_rate_std,
        "Respiratory Rate_min": vitals.respiratory_rate_min,
        "Respiratory Rate_max": vitals.respiratory_rate_max,
    }])

    # Prediction
    prob = model.predict_proba(input_data)[0][1]
    risk_level = "HIGH" if prob > 0.7 else "MEDIUM" if prob > 0.4 else "LOW"

    # SHAP values
    shap_vals = explainer.shap_values(input_data)
    if isinstance(shap_vals, list):
        shap_vals = shap_vals[1]
    
    shap_dict = dict(zip(feature_cols, shap_vals[0].tolist()))
    top_factors = sorted(shap_dict.items(), key=lambda x: abs(x[1]), reverse=True)[:5]

    return {
        "risk_score": round(float(prob), 4),
        "risk_level": risk_level,
        "top_factors": [{"feature": k, "impact": round(v, 4)} for k, v in top_factors]
    }