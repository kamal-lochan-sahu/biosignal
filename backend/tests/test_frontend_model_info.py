"""The dashboard's model statistics come from frontend/lib/model-info.json, generated from the model."""
import json

import pytest

from scripts.inspect_model import FRONTEND_INFO_PATH, INFO_PATH, build_frontend_info

INFO = json.loads(INFO_PATH.read_text(encoding="utf-8"))


def test_frontend_copy_is_in_sync_with_the_backend_record():
    assert FRONTEND_INFO_PATH.exists(), "frontend/lib/model-info.json is missing - run python scripts/inspect_model.py"
    assert json.loads(FRONTEND_INFO_PATH.read_text(encoding="utf-8")) == build_frontend_info(INFO)


def test_importance_shares_cover_every_feature_and_sum_to_one():
    shares = INFO["feature_importance_gain"]
    assert sorted(shares) == sorted(INFO["feature_columns"])
    assert sum(shares.values()) == pytest.approx(1.0, abs=1e-3)
    assert all(value >= 0 for value in shares.values())


def test_frontend_importance_is_ranked_from_highest_to_lowest():
    ranked = json.loads(FRONTEND_INFO_PATH.read_text(encoding="utf-8"))["featureImportanceGain"]
    shares = [item["share"] for item in ranked]
    assert shares == sorted(shares, reverse=True)
