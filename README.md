# 🫀 BioSignal — ICU Patient Deterioration Prediction

<div align="center">

**Early-warning dashboard with a machine-learning risk model**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-biosignal--puce.vercel.app-blue?style=for-the-badge&logo=vercel)](https://biosignal-puce.vercel.app)
[![Backend API](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render)](https://biosignal-api.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Dataset](https://img.shields.io/badge/Dataset-MIMIC--IV%20Demo-red?style=for-the-badge)](https://physionet.org/content/mimic-iv-demo/2.2/)

</div>

---

## What is BioSignal?

BioSignal is a research / portfolio prototype that shows how vital-sign data can be turned into an early-warning view for ICU patients. A LightGBM model predicts the risk of deterioration from vital-sign statistics, SHAP explains each prediction, and the dashboard adds common bedside scores (NEWS2, qSOFA, SOFA, APACHE II) next to it.

> ⚠️ **Disclaimer:** This is **not a medical device** and is **not intended for clinical use**. The model is trained on a small public demo dataset, several screens use simulated data, and the clinical scores are simplified implementations. Never use it to make decisions about real patients.

---

## Features

| Module | Description |
|---|---|
| **ML Risk Prediction** | LightGBM risk score with SHAP explanation (FastAPI `/predict`) |
| **NEWS2 / SOFA / APACHE II** | Client-side score calculators (simplified, see limitations) |
| **Sepsis screen** | qSOFA + SIRS criteria |
| **Patient heatmap / cards** | Risk-coloured overview of the 4 demo patients |
| **Report Analyzer** | Manual entry or CSV upload → ML risk + NEWS2 + qSOFA + MAP, downloadable report |
| **Shift report / Export** | Handover text and CSV/JSON export |
| **Model stats** | Metrics, ROC curve and feature importance (static values, see limitations) |
| **Platform** | 21 UI languages, installable PWA manifest, responsive layout, backend keep-alive ping |

---

## Tech stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Recharts, Framer Motion
- **Backend:** Python, FastAPI, LightGBM, SHAP, scikit-learn, pandas
- **Hosting:** Vercel (frontend), Render (backend)

---

## Data and model

- **Dataset:** [MIMIC-IV Clinical Database Demo v2.2](https://physionet.org/content/mimic-iv-demo/2.2/) — an openly available subset of **100 patients** (the full MIMIC-IV needs credentialed access and is not used). Licensed under the [ODbL v1.0](https://opendatacommons.org/licenses/odbl/1-0/). Please cite PhysioNet and MIMIC-IV when you reuse it.
- **Features (20):** mean / std / min / max of heart rate, SpO₂, systolic BP, diastolic BP and respiratory rate over a window.
- **Training windows (reported, not reproducible):** 11,021 windows (8,816 train / remainder test), ROC-AUC about 0.71 on a held-out set. The training code is not available, so these figures cannot be re-checked; see the [model card](docs/MODEL_CARD.md) for what is and is not known.
- The data is not stored in this repository. Download it with:

```bash
./scripts/download_mimic_demo.sh
```

---

## Getting started

**Prerequisites:** Node.js 20+, Python 3.11+ (3.11 is used in deployment), npm.

```bash
git clone https://github.com/kamal-lochan-sahu/biosignal.git
cd biosignal
```

**Backend** (http://localhost:8000):

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend** (http://localhost:3000):

```bash
cd frontend
npm install
npm run dev
```

---

## Project structure

```
biosignal/
├── frontend/              # Next.js app
│   ├── app/
│   │   ├── components/    # 19 UI components
│   │   ├── globals.css    # design tokens and animations
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/               # api client, risk helpers
│   └── public/
├── backend/               # FastAPI service
│   ├── main.py
│   ├── models/            # trained LightGBM model + feature list
│   ├── scripts/           # model provenance (inspect_model.py)
│   ├── tests/             # pytest suite
│   └── requirements.txt
├── docs/                  # model card
├── scripts/               # helper scripts (data download)
├── render.yaml
└── vercel.json
```

---

## Tests and CI

```bash
# frontend: clinical score unit tests (NEWS2, qSOFA, MAP, SOFA, APACHE II)
cd frontend && npm test

# backend: API, validation and risk-threshold tests (uses the real model)
cd backend && pip install -r requirements-dev.txt && pytest
```

GitHub Actions runs the type check, tests and production build for the frontend and the tests for the backend on every push and pull request.

**Backend configuration:** `CORS_ORIGINS` (comma-separated list of allowed browser origins; defaults to the deployed frontend and localhost).

---

## Known limitations

- Trained on 100 demo patients only; ROC-AUC 0.71 is modest and not clinically validated.
- The original training code is not available, so the model cannot be rebuilt from source. The model card lists what is verified and what is only reported.
- Model-stats charts use hard-coded values, the patient timeline is templated and the vitals chart is simulated.
- Report Analyzer derives std/min/max from a single reading, so its ML output is only indicative.
- NEWS2, SOFA and APACHE II follow the published tables and are unit-tested, but stay educational implementations (for example SpO2 Scale 2 cannot be selected in the UI and the APACHE II A-aDO2 assumes sea level).
- No authentication or rate limiting yet.

These items are tracked as the next engineering steps.

---

## Live deployment

| Service | URL |
|---|---|
| Frontend | [biosignal-puce.vercel.app](https://biosignal-puce.vercel.app) |
| Backend API | [biosignal-api.onrender.com](https://biosignal-api.onrender.com) (free tier, may need a moment to wake up) |

---

## Author

**Kamal Lochan Sahu** · GitHub: [@kamal-lochan-sahu](https://github.com/kamal-lochan-sahu)

## License

[MIT](LICENSE) © 2025 Kamal Lochan Sahu
