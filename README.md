# 🫀 BioSignal — ICU Patient Deterioration Prediction

<div align="center">

**Early Warning System powered by Machine Learning**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-biosignal--puce.vercel.app-blue?style=for-the-badge&logo=vercel)](https://biosignal-puce.vercel.app)
[![Backend API](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render)](https://biosignal-api.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Dataset](https://img.shields.io/badge/Dataset-MIMIC--IV-red?style=for-the-badge)](https://physionet.org/content/mimiciv/)
[![UI](https://img.shields.io/badge/UI-v2.0%20Medical%20Grade-8b5cf6?style=for-the-badge)](https://biosignal-puce.vercel.app)

*Predicting ICU patient deterioration before it becomes critical — because every second counts.*

</div>

---

## 🧠 What is BioSignal?

BioSignal is a production-grade clinical decision support tool that analyzes real-time patient vitals and predicts the risk of ICU deterioration using machine learning trained on **MIMIC-IV** — the world's most prestigious real ICU patient dataset.

Built to demonstrate how ML can assist ICU clinicians in identifying high-risk patients early, before deterioration becomes irreversible. The interface follows a custom medical-grade design system inspired by real ICU monitoring equipment.

> ⚠️ **Disclaimer:** This is a research portfolio project, not a certified medical device. Not intended for clinical use.

---

## 🎨 v2.0 — Medical-Grade UI Upgrade

The frontend was rebuilt with a dedicated design system rather than default Tailwind styling:

- **Custom color tokens** — deep navy backgrounds, cyan/green/amber/red semantic risk colors, purple for ML/AI elements
- **Typography system** — Outfit (display), DM Sans (body), IBM Plex Mono (clinical data/numbers)
- **Animated SVG risk gauge** — glowing arc with tick marks, dynamic color by risk level
- **Micro-interactions** — pulsing critical alerts, animated score counters, hover states on patient cards
- **Custom Recharts theming** — dark-mode tooltips, reference lines, staggered line animations
- **QA-tested with Gemini CLI + Playwright MCP** across desktop/tablet/mobile — scored **9/10** overall, **8.5/10** design

---

## ✨ Features

### Clinical Scoring Modules (12)
| Module | Description |
|---|---|
| 🔴 **ML Risk Prediction** | LightGBM model predicts deterioration risk (next 6h) with SHAP explainability |
| 📋 **NEWS2** | National Early Warning Score 2 — NHS standard deterioration screening |
| ❤️ **SOFA** | Sequential Organ Failure Assessment — 6 organ systems, mortality estimate |
| 🚨 **Sepsis Detector** | qSOFA + SIRS criteria with septic shock detection |
| 📊 **APACHE II** | Acute Physiology and Chronic Health Evaluation — full clinical calculator |
| 🗺️ **Patient Heatmap** | Risk-colored grid view across all patients |
| ⏱️ **Patient Timeline** | Chronological event log with intervention tracking |
| 💧 **Fluid Balance** | Intake/output tracking with running net balance |
| 📝 **Shift Report** | Auto-generated ICU handover report, downloadable |
| 📈 **Model Stats** | ROC curve, feature importance, precision/recall metrics |
| 📤 **Export** | CSV/JSON export of patient data + predictions |
| 🔬 **Report Analyzer** | Manual entry or CSV upload → auto-computes ML risk + NEWS2 + qSOFA + MAP for *any* patient, not just the 4 demo profiles, with a full downloadable clinical report |

### Platform Features
| Feature | Description |
|---|---|
| 🌐 **21-Language Support** | English + 10 Indian + 10 world languages, IP-based auto-detection |
| 📱 **PWA Ready** | Installable on mobile, works offline |
| 💓 **ECG Entry Animation** | Animated ECG draw on load |
| 🔔 **Backend KeepAlive** | Auto-ping every 10 min + UptimeRobot monitoring — backend always warm |
| 🔗 **OG Meta Tags** | Rich LinkedIn/Twitter preview cards with custom SVG |
| 📲 **Fully Responsive** | Horizontal-scroll tab nav and stacked layouts tested down to 390px |

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 16** (App Router, Turbopack)
- **TypeScript** — full type safety
- **Tailwind CSS v4** — utility-first styling + custom design tokens
- **Recharts** — data visualization (line charts, radial gauges, bar charts)
- **Framer Motion** — animations and transitions
- **Lucide React** — icon system
- **Google Fonts** — Outfit, DM Sans, IBM Plex Mono
- **PWA** — manifest + service worker

### Backend
- **Python** + **FastAPI**
- **LightGBM** — gradient-boosted ML model
- **SHAP** — model explainability
- **MIMIC-IV** dataset — real ICU patient data (PhysioNet)
- **Render** — cloud deployment

### DevOps & QA
- **Vercel** — frontend hosting + auto-deploy on push
- **GitHub** — version control
- **Render** — backend hosting
- **Gemini CLI + Playwright MCP** — automated cross-device QA testing and live deployment audits

---

## 📊 Dataset — MIMIC-IV

This project uses **MIMIC-IV** (Medical Information Mart for Intensive Care), the gold standard real-world ICU dataset:

- 📍 Hosted on [PhysioNet](https://physionet.org/content/mimiciv/)
- 🏥 ~300,000 ICU admissions from Beth Israel Deaconess Medical Center
- 🔐 Access requires free registration + CITI ethics training
- 📈 Features: heart rate, SpO2, blood pressure, respiratory rate, temperature, GCS score
- 🔢 11,021 engineered training windows, ROC-AUC 0.71

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20+
- Python 3.12+
- npm

### Frontend (Local)

```bash
git clone https://github.com/kamal-lochan-sahu/biosignal.git
cd biosignal/frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Backend (Local)

```bash
cd biosignal/backend
pip install -r requirements.txt
uvicorn main:app --reload
```

API runs at [http://localhost:8000](http://localhost:8000)

---

## 📁 Project Structure

```
biosignal/
├── frontend/                  # Next.js app
│   ├── app/
│   │   ├── components/        # 16 UI components (design-system based)
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── risk-utils.ts
│   │   ├── globals.css        # Design tokens (colors, fonts, animations)
│   │   ├── page.tsx
│   │   └── layout.tsx
│   └── public/
├── backend/                   # FastAPI + ML model
│   ├── main.py
│   └── requirements.txt
├── vercel.json
└── render.yaml
```

---

## 🌐 Live Deployment

| Service | URL | Status |
|---|---|---|
| Frontend | [biosignal-puce.vercel.app](https://biosignal-puce.vercel.app) | ✅ Live |
| Backend API | [biosignal-api.onrender.com](https://biosignal-api.onrender.com) | ✅ Live |

---

## 🌍 Supported Languages

**Indian:** Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada, Malayalam, Odia, Punjabi

**World:** Spanish, French, German, Japanese, Chinese, Arabic, Portuguese, Russian, Korean, Italian

---

## 👤 Author

**Kamal Lochan Sahu**
- 📍 Berhampur, Odisha, India
- 🎯 Goal: IT/Robotics Ausbildung in Germany 🇩🇪
- 🐙 GitHub: [@kamal-lochan-sahu](https://github.com/kamal-lochan-sahu)

---

## 📄 License

[MIT](LICENSE) © 2025 Kamal Lochan Sahu

---

<div align="center">

*Built with ❤️ as part of a production-grade ML portfolio*

**⭐ Star this repo if you find it useful!**

</div>
