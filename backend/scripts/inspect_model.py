#!/usr/bin/env python3
"""Record verifiable facts about the shipped model.

Run it from the backend folder whenever models/biosignal_model.pkl is replaced:

    python scripts/inspect_model.py

It writes two files from the model itself:
  - backend/models/model_info.json   (hash, parameters, features, feature importance)
  - frontend/lib/model-info.json     (the subset the dashboard shows, e.g. feature importance)

tests/test_model_info.py and tests/test_frontend_model_info.py fail if the model file and these
files disagree, which keeps docs/MODEL_CARD.md and the dashboard honest: they can only describe the
model that is actually deployed.
"""
import hashlib
import json
from pathlib import Path

import joblib

BACKEND_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BACKEND_DIR / "models" / "biosignal_model.pkl"
FEATURES_PATH = BACKEND_DIR / "models" / "feature_cols.json"
INFO_PATH = BACKEND_DIR / "models" / "model_info.json"
FRONTEND_INFO_PATH = BACKEND_DIR.parent / "frontend" / "lib" / "model-info.json"


def sha256_of(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest()


def build_info() -> dict:
    model = joblib.load(MODEL_PATH)
    columns = json.loads(FEATURES_PATH.read_text(encoding="utf-8"))
    booster = model.booster_
    gain = booster.feature_importance(importance_type="gain")
    split = booster.feature_importance(importance_type="split")
    total_gain = float(gain.sum())
    return {
        "model_file": "models/biosignal_model.pkl",
        "sha256": sha256_of(MODEL_PATH),
        "size_bytes": MODEL_PATH.stat().st_size,
        "estimator": type(model).__name__,
        "n_trees": int(booster.num_trees()),
        "n_features": int(model.n_features_in_),
        "classes": [int(c) for c in model.classes_],
        "feature_columns": columns,
        "feature_importance_gain": {c: round(float(g) / total_gain, 6) for c, g in zip(columns, gain)},
        "feature_importance_split": {c: int(s) for c, s in zip(columns, split)},
        "params": model.get_params(),
    }


def build_frontend_info(info: dict) -> dict:
    """The subset of model_info.json that the dashboard displays (feature importance ranked by gain share)."""
    params = info["params"]
    ranked = sorted(info["feature_importance_gain"].items(), key=lambda item: (-item[1], item[0]))
    return {
        "estimator": info["estimator"],
        "sha256Prefix": info["sha256"][:12],
        "nTrees": info["n_trees"],
        "nFeatures": info["n_features"],
        "learningRate": params["learning_rate"],
        "maxDepth": params["max_depth"],
        "classWeight": params["class_weight"],
        "randomState": params["random_state"],
        "featureImportanceGain": [{"feature": name, "share": share} for name, share in ranked],
    }


def main() -> None:
    info = build_info()
    INFO_PATH.write_text(json.dumps(info, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    FRONTEND_INFO_PATH.parent.mkdir(parents=True, exist_ok=True)
    FRONTEND_INFO_PATH.write_text(json.dumps(build_frontend_info(info), indent=2) + "\n", encoding="utf-8")
    print(f"wrote {INFO_PATH.relative_to(BACKEND_DIR.parent)}  (sha256 {info['sha256'][:12]}...)")
    print(f"wrote {FRONTEND_INFO_PATH.relative_to(BACKEND_DIR.parent)}")


if __name__ == "__main__":
    main()
