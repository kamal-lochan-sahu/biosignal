# 🫀 BioSignal — ICU Patient Deterioration Prediction

<div align="center">

**Early Warning System powered by Machine Learning**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-biosignal--puce.vercel.app-blue?style=for-the-badge&logo=vercel)](https://biosignal-puce.vercel.app)
[![Backend API](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render)](https://biosignal-api.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Dataset](https://img.shields.io/badge/Dataset-MIMIC--IV-red?style=for-the-badge)](https://physionet.org/content/mimiciv/)

*Predicting ICU patient deterioration before it becomes critical — because every second counts.*

</div>

---

## 🧠 What is BioSignal?

BioSignal is a production-grade clinical decision support tool that analyzes real-time patient vitals and predicts the risk of ICU deterioration using machine learning trained on **MIMIC-IV** — the world's most prestigious real ICU patient dataset.

Built to demonstrate how ML can assist ICU clinicians in identifying high-risk patients early, before deterioration becomes irreversible.

> ⚠️ **Disclaimer:** This is a research portfolio project, not a certified medical device. Not intended for clinical use.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔴 **Live Risk Prediction** | ML model predicts patient deterioration risk in real time |
| 📊 **ML Dashboard** | Visual risk gauges, patient cards, vitals timeline |
| 📋 **Report Analyzer** | Upload ICU reports — AI extracts vitals and predicts risk |
| 🌐 **21-Language Support** | English + 10 Indian + 10 world languages |
| 📱 **PWA Ready** | Installable on mobile, works offline |
| 💓 **ECG Entry Animation** | Animated ECG draw on load (2.5s) |
| 🔔 **Backend KeepAlive** | Auto-ping every 10 min — backend always warm |
| 🔗 **OG Meta Tags** | Rich LinkedIn/Twitter preview cards |

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 16** (App Router, Turbopack)
- **TypeScript** — full type safety
- **Tailwind CSS** — utility-first styling
- **Lucide React** — icon system
- **PWA** — manifest + service worker

### Backend
- **Python** + **FastAPI**
- **scikit-learn** — ML model (Random Forest / Gradient Boosting)
- **MIMIC-IV** dataset — real ICU patient data (PhysioNet)
- **Render** — cloud deployment

### DevOps
- **Vercel** — frontend hosting + auto-deploy on push
- **GitHub** — version control
- **Render** — backend hosting

---

## 📊 Dataset — MIMIC-IV

This project uses **MIMIC-IV** (Medical Information Mart for Intensive Care), the gold standard real-world ICU dataset:

- 📍 Hosted on [PhysioNet](https://physionet.org/content/mimiciv/)
- 🏥 ~300,000 ICU admissions from Beth Israel Deaconess Medical Center
- 🔐 Access requires free registration + CITI ethics training
- 📈 Features: heart rate, SpO2, blood pressure, respiratory rate, temperature, GCS score

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
biosignal/
├── frontend/                  # Next.js app
│   ├── app/
│   │   ├── components/        # UI components
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── risk-utils.ts
│   │   ├── page.tsx
│   │   └── layout.tsx
│   └── public/
├── backend/                   # FastAPI + ML model
│   ├── main.py
│   └── requirements.txt
├── vercel.json
└── render.yaml

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
