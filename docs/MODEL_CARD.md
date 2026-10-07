# BioSignal model card

> **Research / demo model. Not a medical device. Not validated for clinical use.**
> This card separates what can be **verified from the files in this repository** from what is **only reported and cannot be reproduced**.

## 1. Summary

| | |
|---|---|
| Task | Binary classification: risk score for "patient deterioration" from vital-sign window statistics |
| Estimator | LightGBM `LGBMClassifier` |
| File | `backend/models/biosignal_model.pkl` (SHA-256 starts with `13288e74e510`) |
| Inputs | 20 features: mean, std, min and max of heart rate, SpO2, systolic BP, diastolic BP, respiratory rate |
| Output | `risk_score` in [0, 1], `risk_level` LOW / MEDIUM / HIGH, top-5 SHAP factors |
| Serving | FastAPI (`backend/main.py`), thresholds in `backend/risk.py` |

## 2. Verified facts (checked by `backend/tests/test_model_info.py`)

These come from the model file itself and are re-checked automatically; they are recorded in `backend/models/model_info.json`.

- 200 trees, `learning_rate = 0.05`, `max_depth = 6`, `num_leaves = 31`, `min_child_samples = 20`
- `class_weight = "balanced"`, `random_state = 42`
- 20 input features, in the order given in `backend/models/feature_cols.json`
- The pickle was written with **scikit-learn 1.6.1**; `backend/requirements.txt` pins that version and a test fails if another version is used to load it

## 3. Training data

**Reported:** the MIMIC-IV Clinical Database Demo v2.2 (open access, ODbL v1.0).

**Verifiable about that dataset** (counted from the public demo files): 100 patients, 140 ICU stays, about 12,400 ICU hours, and 15 hospital deaths among 128 ICU admissions.

**Not known (the training code is not available):**
- how a "window" was defined (length, stride, how missing values were handled)
- the definition of the positive label ("deterioration") and the prediction horizon
- how the vital-sign item IDs were selected and cleaned

The figures quoted in earlier versions of the README and dashboard (11,021 windows, 8,816 training windows) are consistent with a random 80/20 split of 11,021 windows (`ceil(0.2 x 11,021) = 2,205` test windows), but the pipeline that produced them cannot be reproduced from this repository.

## 4. Evaluation

**Reported:** ROC-AUC of about 0.71 on a held-out test set. The dashboard's model-statistics screen shows fixed values; it does not compute them from the model.

**Not verified.** In particular:
- If the split was made **per window** (as the 80/20 figures suggest), windows from the same patient can appear in both training and test data. This usually makes the reported score **optimistic**. A patient-level split (all windows of a patient on one side) is the appropriate protocol.
- No confidence interval, calibration analysis, external validation or subgroup analysis exists.
- With about 100 patients in total, any single performance number is very uncertain.

## 5. How to read the output

- `risk_score` comes from a model trained with `class_weight = "balanced"`. It is a **ranking score, not a calibrated probability**: a score of 0.80 does not mean an 80 % chance of deterioration.
- The thresholds (`>= 0.4` MEDIUM, `>= 0.7` HIGH) are conventions, not values tuned on validation data.
- SHAP values explain **how the model behaves**, not what causes deterioration. They should not be read as clinical reasoning.

## 6. Intended use and limitations

**Intended use:** demonstration, education, and as a starting point for engineering work.

**Not for:** clinical decision-making, triage, or any use involving real patients.

Known limitations:
- tiny, single-centre, historical dataset (ICU patients of one US hospital)
- inputs are summary statistics over a window; the application derives min / max / std from a single reading in the Report Analyzer, so its output there is only indicative
- no handling of missing signals, device artefacts or measurement units other than those listed in `backend/schemas.py`
- the bedside scores in the dashboard (NEWS2, qSOFA, SOFA, APACHE II) are separate, rule-based calculators and are **not** produced by this model

## 7. Provenance and reproducibility

- The original training code and notebook are not part of this repository and could not be recovered. The model therefore cannot currently be rebuilt from source.
- `backend/models/model_info.json` and `backend/tests/test_model_info.py` pin the exact file that is deployed.
- To replace the model: train it with code that is committed to this repository, run `python scripts/inspect_model.py` in `backend/`, update sections 1-4 and the changelog below, and use a **patient-level** split with confidence intervals.

## 8. Changelog

| Date | Change |
|---|---|
| 2026-10 | Model card added; model file unchanged. Provenance check and tests added. |
