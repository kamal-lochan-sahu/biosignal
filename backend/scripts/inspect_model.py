#!/usr/bin/env python3
"""Record verifiable facts about the shipped model in backend/models/model_info.json.

Run it from the backend folder whenever models/biosignal_model.pkl is replaced:

    python scripts/inspect_model.py

tests/test_model_info.py fails if the model file and model_info.json disagree, which keeps
docs/MODEL_CARD.md honest: the card can only describe the model that is actually deployed.
"""
import hashlib
import json
from pathlib import Path

import joblib

BACKEND_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BACKEND_DIR / "models" / "biosignal_model.pkl"
FEATURES_PATH = BACKEND_DIR / "models" / "feature_cols.json"
INFO_PATH = BACKEND_DIR / "models" / "model_info.json"


def sha256_of(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest()


def build_info() -> dict:
    model = joblib.load(MODEL_PATH)
    return {
        "model_file": "models/biosignal_model.pkl",
        "sha256": sha256_of(MODEL_PATH),
        "size_bytes": MODEL_PATH.stat().st_size,
        "estimator": type(model).__name__,
        "n_trees": int(model.booster_.num_trees()),
        "n_features": int(model.n_features_in_),
        "classes": [int(c) for c in model.classes_],
        "feature_columns": json.loads(FEATURES_PATH.read_text(encoding="utf-8")),
        "params": model.get_params(),
    }


def main() -> None:
    info = build_info()
    INFO_PATH.write_text(json.dumps(info, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(f"wrote {INFO_PATH.relative_to(BACKEND_DIR)}  (sha256 {info['sha256'][:12]}...)")


if __name__ == "__main__":
    main()
