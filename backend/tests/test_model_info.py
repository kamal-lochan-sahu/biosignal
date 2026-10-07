"""Model provenance: models/model_info.json must describe the model file that is actually shipped.

If this test fails, the model file was replaced. Run `python scripts/inspect_model.py` and update
docs/MODEL_CARD.md (training data, evaluation, changelog) before committing the new model.
"""
import json
from pathlib import Path

import joblib

from scripts.inspect_model import FEATURES_PATH, INFO_PATH, MODEL_PATH, sha256_of
from schemas import FEATURE_COLUMNS

INFO = json.loads(INFO_PATH.read_text(encoding="utf-8"))


def test_model_file_matches_the_recorded_hash():
    assert sha256_of(MODEL_PATH) == INFO["sha256"]
    assert MODEL_PATH.stat().st_size == INFO["size_bytes"]


def test_model_parameters_match_the_recorded_values():
    model = joblib.load(MODEL_PATH)
    assert type(model).__name__ == INFO["estimator"]
    assert model.get_params() == INFO["params"]
    assert int(model.booster_.num_trees()) == INFO["n_trees"]
    assert int(model.n_features_in_) == INFO["n_features"]


def test_recorded_features_match_the_api_schema():
    assert INFO["feature_columns"] == json.loads(FEATURES_PATH.read_text(encoding="utf-8"))
    assert INFO["feature_columns"] == FEATURE_COLUMNS
    assert len(INFO["feature_columns"]) == INFO["n_features"]


def test_card_exists_next_to_the_backend():
    card = Path(__file__).resolve().parents[2] / "docs" / "MODEL_CARD.md"
    assert card.exists(), "docs/MODEL_CARD.md is missing"
    assert INFO["sha256"][:12] in card.read_text(encoding="utf-8"), "model card does not mention the current model hash"
