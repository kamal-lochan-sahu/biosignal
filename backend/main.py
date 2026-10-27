"""BioSignal API - ICU deterioration risk prediction.

Research / demo project, not a medical device and not intended for clinical use.
"""
import json
import math
import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import shap
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from config import load_settings
from ratelimit import SlidingWindowLimiter, client_ip
from risk import risk_level_for
from schemas import FEATURE_COLUMNS, PredictionResponse, TopFactor, VitalsInput, to_feature_row
from security import BodySizeLimitMiddleware, SecurityHeadersMiddleware

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "biosignal_model.pkl"
FEATURES_PATH = BASE_DIR / "models" / "feature_cols.json"

# Comma-separated list in the CORS_ORIGINS environment variable overrides these defaults.
DEFAULT_CORS_ORIGINS = "https://biosignal-puce.vercel.app,http://localhost:3000,http://127.0.0.1:3000"
TOP_FACTOR_COUNT = 5

settings = load_settings()


def allowed_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", DEFAULT_CORS_ORIGINS)
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


app = FastAPI(
    title="BioSignal API",
    version="0.3.0",
    description="ICU patient deterioration risk. Research / demo only - not a medical device.",
)

# Middleware order: the last one added is the outermost. CORS stays outermost so that 413 / 429 responses
# also carry CORS headers and the browser can read them.
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(BodySizeLimitMiddleware, max_bytes=settings.max_body_bytes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
    allow_methods=["GET", "HEAD", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

# --- Rate limiting (per client IP, plus a global cap as a safety net that does not depend on proxy set-up) ---
ip_limiter = SlidingWindowLimiter(settings.rate_limit_per_minute)
global_limiter = SlidingWindowLimiter(settings.global_rate_limit_per_minute)


def enforce_rate_limit(request: Request) -> None:
    for limiter, key in (
        (ip_limiter, client_ip(request, settings.trusted_proxy_count, settings.client_ip_header)),
        (global_limiter, "global"),
    ):
        allowed, retry_after = limiter.check(key)
        if not allowed:
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please retry shortly.",
                headers={"Retry-After": str(max(1, math.ceil(retry_after)))},
            )


# --- Model (loaded once at start-up; paths do not depend on the working directory) ---
model = joblib.load(MODEL_PATH)
feature_cols: list[str] = json.loads(FEATURES_PATH.read_text(encoding="utf-8"))
if sorted(feature_cols) != sorted(FEATURE_COLUMNS):
    raise RuntimeError("models/feature_cols.json does not match the features defined in schemas.py")
explainer = shap.TreeExplainer(model)


def positive_class_contributions(shap_values) -> list[float]:
    """First row of SHAP values for the positive class, across shap versions
    (list per class, 2-D array, or 3-D array [rows, features, classes])."""
    if isinstance(shap_values, list):
        shap_values = shap_values[1]
    values = np.asarray(shap_values)
    if values.ndim == 3:
        values = values[:, :, 1]
    return values[0].tolist()


@app.get("/")
@app.head("/")  # Render's health check sends HEAD /
def root():
    return {"status": "BioSignal API running"}


@app.get("/health")
@app.head("/health")
def health_check():
    return {"status": "ok"}


PROXY_HEADERS = ("x-forwarded-for", "x-forwarded-proto", "x-real-ip", "forwarded", "cf-connecting-ip", "true-client-ip", "x-client-ip")
SENSITIVE_HEADERS = {"authorization", "cookie", "proxy-authorization", "x-api-key"}


@app.get("/debug/client", include_in_schema=False)
def debug_client(request: Request):
    """Temporary diagnostic to pick the right proxy settings. Disabled (404) unless ENABLE_CLIENT_DEBUG is set.

    It only describes the caller's own request: the proxy headers it arrived with and the rate-limit key chosen
    for it. Header names are listed without values, except for the proxy headers above; credentials are never shown.
    """
    if not settings.enable_client_debug:
        raise HTTPException(status_code=404, detail="Not Found")
    headers = request.headers
    return {
        "chosen_key": client_ip(request, settings.trusted_proxy_count, settings.client_ip_header),
        "trusted_proxy_count": settings.trusted_proxy_count,
        "client_ip_header": settings.client_ip_header or None,
        "socket_host": request.client.host if request.client else None,
        "proxy_headers": {name: headers.get(name) for name in PROXY_HEADERS if name in headers},
        "header_names": sorted(name for name in headers.keys() if name not in SENSITIVE_HEADERS),
    }


@app.post("/predict", response_model=PredictionResponse, dependencies=[Depends(enforce_rate_limit)])
def predict(vitals: VitalsInput) -> PredictionResponse:
    frame = pd.DataFrame([to_feature_row(vitals)], columns=feature_cols)

    score = round(float(model.predict_proba(frame)[0][1]), 4)
    contributions = dict(zip(feature_cols, positive_class_contributions(explainer.shap_values(frame))))
    top = sorted(contributions.items(), key=lambda item: abs(item[1]), reverse=True)[:TOP_FACTOR_COUNT]

    return PredictionResponse(
        risk_score=score,
        risk_level=risk_level_for(score),
        top_factors=[TopFactor(feature=name, impact=round(value, 4)) for name, value in top],
    )
