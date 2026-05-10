'use client'
import { useState, useEffect, createContext, useContext } from 'react'

export type Lang = 'en'|'hi'|'bn'|'te'|'ta'|'mr'|'gu'|'kn'|'ml'|'or'|'pa'|'zh'|'es'|'ar'|'pt'|'ru'|'ja'|'fr'|'de'|'ko'|'id'

export const LANGUAGES: { code: Lang; label: string; flag: string; name: string }[] = [
  { code: 'en', label: 'English',    flag: '🇬🇧', name: 'English'    },
  { code: 'hi', label: 'हिन्दी',      flag: '🇮🇳', name: 'Hindi'      },
  { code: 'bn', label: 'বাংলা',       flag: '🇮🇳', name: 'Bengali'    },
  { code: 'te', label: 'తెలుగు',      flag: '🇮🇳', name: 'Telugu'     },
  { code: 'ta', label: 'தமிழ்',       flag: '🇮🇳', name: 'Tamil'      },
  { code: 'mr', label: 'मराठी',       flag: '🇮🇳', name: 'Marathi'    },
  { code: 'gu', label: 'ગુજરાતી',     flag: '🇮🇳', name: 'Gujarati'   },
  { code: 'kn', label: 'ಕನ್ನಡ',       flag: '🇮🇳', name: 'Kannada'    },
  { code: 'ml', label: 'മലയാളം',      flag: '🇮🇳', name: 'Malayalam'  },
  { code: 'or', label: 'ଓଡ଼ିଆ',       flag: '🇮🇳', name: 'Odia'       },
  { code: 'pa', label: 'ਪੰਜਾਬੀ',      flag: '🇮🇳', name: 'Punjabi'    },
  { code: 'zh', label: '中文',         flag: '🇨🇳', name: 'Chinese'    },
  { code: 'es', label: 'Español',     flag: '🇪🇸', name: 'Spanish'    },
  { code: 'ar', label: 'العربية',     flag: '🇸🇦', name: 'Arabic'     },
  { code: 'pt', label: 'Português',   flag: '🇧🇷', name: 'Portuguese' },
  { code: 'ru', label: 'Русский',     flag: '🇷🇺', name: 'Russian'    },
  { code: 'ja', label: '日本語',       flag: '🇯🇵', name: 'Japanese'   },
  { code: 'fr', label: 'Français',    flag: '🇫🇷', name: 'French'     },
  { code: 'de', label: 'Deutsch',     flag: '🇩🇪', name: 'German'     },
  { code: 'ko', label: '한국어',       flag: '🇰🇷', name: 'Korean'     },
  { code: 'id', label: 'Indonesia',   flag: '🇮🇩', name: 'Indonesian' },
]

export const translations: Record<Lang, Record<string, string>> = {
  en: {
    subtitle: 'ICU Early Warning System — Powered by ML',
    live: 'Live', patients: 'Patients', predictRisk: 'Predict Risk',
    predicting: 'Predicting...', backendLive: 'Backend Live',
    pinging: 'Pinging...', reconnecting: 'Reconnecting',
    disclaimer: '⚠️ Demo Only — BioSignal uses simulated patient data trained on MIMIC-IV. Not intended for clinical use. Do not use for real medical decisions.',
    clickPredict: 'Click', toRunML: 'to run ML analysis',
    lightgbm: 'LightGBM model with SHAP explainability',
    tab_dashboard: 'ML Dashboard', tab_analyzer: 'Report Analyzer',
    tab_heatmap: 'Heatmap', tab_timeline: 'Timeline',
    tab_fluid: 'Fluid Balance', tab_shift: 'Shift Report',
    tab_model: 'Model Stats', tab_export: 'Export',
    tab_sepsis: 'Sepsis', tab_apache: 'APACHE II',
    chooseLanguage: 'Choose Language',
  },
  hi: {
    subtitle: 'ICU अर्ली वार्निंग सिस्टम — ML द्वारा संचालित',
    live: 'सक्रिय', patients: 'मरीज़', predictRisk: 'जोखिम पहचानें',
    predicting: 'विश्लेषण हो रहा है...', backendLive: 'सर्वर सक्रिय',
    pinging: 'जुड़ रहा है...', reconnecting: 'पुनः जुड़ रहा है',
    disclaimer: '⚠️ केवल डेमो — BioSignal MIMIC-IV डेटा पर प्रशिक्षित है। चिकित्सा निर्णयों के लिए उपयोग न करें।',
    clickPredict: 'क्लिक करें', toRunML: 'ML विश्लेषण चलाने के लिए',
    lightgbm: 'SHAP व्याख्या के साथ LightGBM मॉडल',
    tab_dashboard: 'ML डैशबोर्ड', tab_analyzer: 'रिपोर्ट विश्लेषक',
    tab_heatmap: 'हीटमैप', tab_timeline: 'टाइमलाइन',
    tab_fluid: 'द्रव संतुलन', tab_shift: 'शिफ्ट रिपोर्ट',
    tab_model: 'मॉडल आँकड़े', tab_export: 'निर्यात',
    tab_sepsis: 'Sepsis', tab_apache: 'APACHE II',
    chooseLanguage: 'भाषा चुनें',
  },
  bn: {
    subtitle: 'ICU আর্লি ওয়ার্নিং সিস্টেম — ML দ্বারা চালিত',
    live: 'সক্রিয়', patients: 'রোগী', predictRisk: 'ঝুঁকি পূর্বাভাস',
    predicting: 'বিশ্লেষণ চলছে...', backendLive: 'সার্ভার সক্রিয়',
    pinging: 'সংযোগ হচ্ছে...', reconnecting: 'পুনরায় সংযোগ',
    disclaimer: '⚠️ শুধুমাত্র ডেমো — BioSignal MIMIC-IV ডেটায় প্রশিক্ষিত। চিকিৎসা সিদ্ধান্তের জন্য ব্যবহার করবেন না।',
    clickPredict: 'ক্লিক করুন', toRunML: 'ML বিশ্লেষণ চালাতে',
    lightgbm: 'SHAP ব্যাখ্যা সহ LightGBM মডেল',
    tab_dashboard: 'ML ড্যাশবোর্ড', tab_analyzer: 'রিপোর্ট বিশ্লেষক',
    tab_heatmap: 'হিটম্যাপ', tab_timeline: 'টাইমলাইন',
    tab_fluid: 'তরল ভারসাম্য', tab_shift: 'শিফট রিপোর্ট',
    tab_model: 'মডেল পরিসংখ্যান', tab_export: 'রপ্তানি',
    tab_sepsis: 'Sepsis', tab_apache: 'APACHE II',
    chooseLanguage: 'ভাষা বেছে নিন',
  },
  te: {
    subtitle: 'ICU ముందస్తు హెచ్చరిక వ్యవస్థ — ML ఆధారిత',
    live: 'సక్రియం', patients: 'రోగులు', predictRisk: 'ప్రమాదం అంచనా',
    predicting: 'విశ్లేషణ జరుగుతోంది...', backendLive: 'సర్వర్ సక్రియం',
    pinging: 'కనెక్ట్ అవుతోంది...', reconnecting: 'మళ్ళీ కనెక్ట్',
    disclaimer: '⚠️ డెమో మాత్రమే — BioSignal MIMIC-IV డేటాపై శిక్షణ పొందింది. వైద్య నిర్ణయాలకు వినియోగించవద్దు।',
    clickPredict: 'క్లిక్ చేయండి', toRunML: 'ML విశ్లేషణ అమలు చేయడానికి',
    lightgbm: 'SHAP వివరణతో LightGBM మోడల్',
    tab_dashboard: 'ML డాష్‌బోర్డ్', tab_analyzer: 'రిపోర్ట్ విశ్లేషకుడు',
    tab_heatmap: 'హీట్‌మ్యాప్', tab_timeline: 'టైమ్‌లైన్',
    tab_fluid: 'ద్రవ సమతుల్యత', tab_shift: 'షిఫ్ట్ రిపోర్ట్',
    tab_model: 'మోడల్ గణాంకాలు', tab_export: 'ఎగుమతి',
    tab_sepsis: 'Sepsis', tab_apache: 'APACHE II',
    chooseLanguage: 'భాష ఎంచుకోండి',
  },
  ta: {
    subtitle: 'ICU முன்கூட்டிய எச்சரிக்கை அமைப்பு — ML மூலம்',
    live: 'செயல்பாட்டில்', patients: 'நோயாளிகள்', predictRisk: 'ஆபத்து கணிப்பு',
    predicting: 'பகுப்பாய்வு நடக்கிறது...', backendLive: 'சேவையகம் செயல்பாட்டில்',
    pinging: 'இணைக்கிறது...', reconnecting: 'மீண்டும் இணைக்கிறது',
    disclaimer: '⚠️ டெமோ மட்டுமே — BioSignal MIMIC-IV தரவில் பயிற்சி பெற்றது. மருத்துவ முடிவுகளுக்கு பயன்படுத்தாதீர்கள்.',
    clickPredict: 'கிளிக் செய்யுங்கள்', toRunML: 'ML பகுப்பாய்வு இயக்க',
    lightgbm: 'SHAP விளக்கத்துடன் LightGBM மாதிரி',
    tab_dashboard: 'ML டாஷ்போர்டு', tab_analyzer: 'அறிக்கை பகுப்பாய்வி',
    tab_heatmap: 'வெப்பவரைபடம்', tab_timeline: 'காலவரிசை',
    tab_fluid: 'திரவ சமநிலை', tab_shift: 'ஷிஃப்ட் அறிக்கை',
    tab_model: 'மாதிரி புள்ளிவிவரம்', tab_export: 'ஏற்றுமதி',
    tab_sepsis: 'Sepsis', tab_apache: 'APACHE II',
    chooseLanguage: 'மொழியை தேர்ந்தெடுங்கள்',
  },
  mr: {
    subtitle: 'ICU पूर्व चेतावणी प्रणाली — ML द्वारे चालित',
    live: 'सक्रिय', patients: 'रुग्ण', predictRisk: 'धोका अंदाज करा',
    predicting: 'विश्लेषण होत आहे...', backendLive: 'सर्व्हर सक्रिय',
    pinging: 'जोडत आहे...', reconnecting: 'पुन्हा जोडत आहे',
    disclaimer: '⚠️ केवळ डेमो — BioSignal MIMIC-IV डेटावर प्रशिक्षित आहे. वैद्यकीय निर्णयांसाठी वापरू नका.',
    clickPredict: 'क्लिक करा', toRunML: 'ML विश्लेषण चालवण्यासाठी',
    lightgbm: 'SHAP स्पष्टीकरणासह LightGBM मॉडेल',
    tab_dashboard: 'ML डॅशबोर्ड', tab_analyzer: 'अहवाल विश्लेषक',
    tab_heatmap: 'हीटमॅप', tab_timeline: 'टाइमलाइन',
    tab_fluid: 'द्रव संतुलन', tab_shift: 'शिफ्ट अहवाल',
    tab_model: 'मॉडेल आकडेवारी', tab_export: 'निर्यात',
    tab_sepsis: 'Sepsis', tab_apache: 'APACHE II',
    chooseLanguage: 'भाषा निवडा',
  },
  gu: {
    subtitle: 'ICU અર્લી વોર્નિંગ સિસ્ટમ — ML દ્વારા સંચાલિત',
    live: 'સક્રિય', patients: 'દર્દીઓ', predictRisk: 'જોખમ આગાહી',
    predicting: 'વિશ્લેષણ થઈ રહ્યું છે...', backendLive: 'સર્વર સક્રિય',
    pinging: 'જોડાઈ રહ્યું છે...', reconnecting: 'ફરીથી જોડાઈ રહ્યું છે',
    disclaimer: '⚠️ માત્ર ડેમો — BioSignal MIMIC-IV ડેટા પર તાલીમ પામ્યું છે. તબીબી નિર્ણયો માટે ઉપયોગ કરશો નહીં.',
    clickPredict: 'ક્લિક કરો', toRunML: 'ML વિશ્લેષણ ચલાવવા',
    lightgbm: 'SHAP સ્પષ્ટીકરણ સાથે LightGBM મોડેલ',
    tab_dashboard: 'ML ડેશબોર્ડ', tab_analyzer: 'રિપોર્ટ વિશ્લેષક',
    tab_heatmap: 'હીટમેપ', tab_timeline: 'ટાઈમલાઈન',
    tab_fluid: 'પ્રવાહી સંતુલન', tab_shift: 'શિફ્ટ રિપોર્ટ',
    tab_model: 'મોડેલ આંકડા', tab_export: 'નિકાસ',
    tab_sepsis: 'Sepsis', tab_apache: 'APACHE II',
    chooseLanguage: 'ભાષા પસંદ કરો',
  },
  kn: {
    subtitle: 'ICU ಮುಂಚಿನ ಎಚ್ಚರಿಕೆ ವ್ಯವಸ್ಥೆ — ML ಆಧಾರಿತ',
    live: 'ಸಕ್ರಿಯ', patients: 'ರೋಗಿಗಳು', predictRisk: 'ಅಪಾಯ ಮುನ್ಸೂಚನೆ',
    predicting: 'ವಿಶ್ಲೇಷಣೆ ನಡೆಯುತ್ತಿದೆ...', backendLive: 'ಸರ್ವರ್ ಸಕ್ರಿಯ',
    pinging: 'ಸಂಪರ್ಕಿಸುತ್ತಿದೆ...', reconnecting: 'ಮರು ಸಂಪರ್ಕ',
    disclaimer: '⚠️ ಡೆಮೋ ಮಾತ್ರ — BioSignal MIMIC-IV ಡೇಟಾದಲ್ಲಿ ತರಬೇತಿ ಪಡೆದಿದೆ. ವೈದ್ಯಕೀಯ ನಿರ್ಧಾರಗಳಿಗೆ ಬಳಸಬೇಡಿ.',
    clickPredict: 'ಕ್ಲಿಕ್ ಮಾಡಿ', toRunML: 'ML ವಿಶ್ಲೇಷಣೆ ಚಲಾಯಿಸಲು',
    lightgbm: 'SHAP ವಿವರಣೆಯೊಂದಿಗೆ LightGBM ಮಾದರಿ',
    tab_dashboard: 'ML ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', tab_analyzer: 'ವರದಿ ವಿಶ್ಲೇಷಕ',
    tab_heatmap: 'ಹೀಟ್‌ಮ್ಯಾಪ್', tab_timeline: 'ಟೈಮ್‌ಲೈನ್',
    tab_fluid: 'ದ್ರವ ಸಮತೋಲನ', tab_shift: 'ಶಿಫ್ಟ್ ವರದಿ',
    tab_model: 'ಮಾದರಿ ಅಂಕಿಅಂಶ', tab_export: 'ರಫ್ತು',
    tab_sepsis: 'Sepsis', tab_apache: 'APACHE II',
    chooseLanguage: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
  },
  or: {
    subtitle: 'ICU ପୂର୍ବ ସତର୍କ ସଂକେତ — ML ଦ୍ୱାରା ଚାଳିତ',
    live: 'ସକ୍ରିୟ', patients: 'ରୋଗୀ', predictRisk: 'ବିପଦ ଆଗୁଆ ଜାଣ',
    predicting: 'ବିଶ୍ଳେଷଣ ହେଉଛି...', backendLive: 'ସର୍ଭର ସକ୍ରିୟ',
    pinging: 'ସଂଯୋଗ ହେଉଛି...', reconnecting: 'ପୁଣି ସଂଯୋଗ',
    disclaimer: '⚠️ ଡେମୋ ମାତ୍ର — BioSignal MIMIC-IV ତଥ୍ୟ ଉପରେ ତାଲିମ ପ୍ରାପ୍ତ। ଚିକିତ୍ସା ନିଷ୍ପତ୍ତି ପାଇଁ ବ୍ୟବହାର କରନ୍ତୁ ନାହିଁ।',
    clickPredict: 'କ୍ଲିକ୍ କରନ୍ତୁ', toRunML: 'ML ବିଶ୍ଳେଷଣ ଚଲାଇବାକୁ',
    lightgbm: 'SHAP ସ୍ପଷ୍ଟୀକରଣ ସହ LightGBM ମଡେଲ',
    tab_dashboard: 'ML ଡ୍ୟାସବୋର୍ଡ', tab_analyzer: 'ରିପୋର୍ଟ ବିଶ୍ଳେଷକ',
    tab_heatmap: 'ହୀଟମ୍ୟାପ', tab_timeline: 'ଟାଇମଲାଇନ',
    tab_fluid: 'ତରଳ ସନ୍ତୁଳନ', tab_shift: 'ଶିଫ୍ଟ ରିପୋର୍ଟ',
    tab_model: 'ମଡେଲ ପରିସଂଖ୍ୟାନ', tab_export: 'ରପ୍ତାନି',
    tab_sepsis: 'Sepsis', tab_apache: 'APACHE II',
    chooseLanguage: 'ଭାଷା ବାଛନ୍ତୁ',
  },
  pa: {
    subtitle: 'ICU ਅਰਲੀ ਵਾਰਨਿੰਗ ਸਿਸਟਮ — ML ਦੁਆਰਾ ਚਾਲਿਤ',
    live: 'ਸਰਗਰਮ', patients: 'ਮਰੀਜ਼', predictRisk: 'ਖਤਰਾ ਪਛਾਣੋ',
    predicting: 'ਵਿਸ਼ਲੇਸ਼ਣ ਹੋ ਰਿਹਾ ਹੈ...', backendLive: 'ਸਰਵਰ ਸਰਗਰਮ',
    pinging: 'ਜੁੜ ਰਿਹਾ ਹੈ...', reconnecting: 'ਦੁਬਾਰਾ ਜੁੜ ਰਿਹਾ ਹੈ',
    disclaimer: '⚠️ ਸਿਰਫ਼ ਡੈਮੋ — BioSignal MIMIC-IV ਡੇਟਾ ਤੇ ਸਿੱਖਿਅਤ ਹੈ। ਡਾਕਟਰੀ ਫ਼ੈਸਲਿਆਂ ਲਈ ਨਾ ਵਰਤੋ।',
    clickPredict: 'ਕਲਿੱਕ ਕਰੋ', toRunML: 'ML ਵਿਸ਼ਲੇਸ਼ਣ ਚਲਾਉਣ ਲਈ',
    lightgbm: 'SHAP ਵਿਆਖਿਆ ਨਾਲ LightGBM ਮਾਡਲ',
    tab_dashboard: 'ML ਡੈਸ਼ਬੋਰਡ', tab_analyzer: 'ਰਿਪੋਰਟ ਵਿਸ਼ਲੇਸ਼ਕ',
    tab_heatmap: 'ਹੀਟਮੈਪ', tab_timeline: 'ਟਾਈਮਲਾਈਨ',
    tab_fluid: 'ਤਰਲ ਸੰਤੁਲਨ', tab_shift: 'ਸ਼ਿਫਟ ਰਿਪੋਰਟ',
    tab_model: 'ਮਾਡਲ ਅੰਕੜੇ', tab_export: 'ਨਿਰਯਾਤ',
    tab_sepsis: 'Sepsis', tab_apache: 'APACHE II',
    chooseLanguage: 'ਭਾਸ਼ਾ ਚੁਣੋ',
  },
  zh: {
    subtitle: 'ICU 早期预警系统 — ML 驱动',
    live: '在线', patients: '患者', predictRisk: '预测风险',
    predicting: '分析中...', backendLive: '服务器在线',
    pinging: '连接中...', reconnecting: '重新连接',
    disclaimer: '⚠️ 仅供演示 — BioSignal 基于 MIMIC-IV 数据训练，不适用于临床决策。',
    clickPredict: '点击', toRunML: '运行 ML 分析',
    lightgbm: '基于 SHAP 可解释性的 LightGBM 模型',
    tab_dashboard: 'ML 仪表板', tab_analyzer: '报告分析',
    tab_heatmap: '热力图', tab_timeline: '时间轴',
    tab_fluid: '液体平衡', tab_shift: '班次报告',
    tab_model: '模型统计', tab_export: '导出',
    tab_sepsis: 'Sepsis', tab_apache: 'APACHE II',
    chooseLanguage: '选择语言',
  },
  es: {
    subtitle: 'Sistema de Alerta Temprana ICU — Impulsado por ML',
    live: 'En vivo', patients: 'Pacientes', predictRisk: 'Predecir riesgo',
    predicting: 'Analizando...', backendLive: 'Servidor activo',
    pinging: 'Conectando...', reconnecting: 'Reconectando',
    disclaimer: '⚠️ Solo demo — BioSignal usa datos simulados entrenados en MIMIC-IV. No usar para decisiones clínicas.',
    clickPredict: 'Haz clic', toRunML: 'para ejecutar análisis ML',
    lightgbm: 'Modelo LightGBM con explicabilidad SHAP',
    tab_dashboard: 'Panel ML', tab_analyzer: 'Analizador de informes',
    tab_heatmap: 'Mapa de calor', tab_timeline: 'Cronología',
    tab_fluid: 'Balance de fluidos', tab_shift: 'Informe de turno',
    tab_model: 'Estadísticas del modelo', tab_export: 'Exportar',
    tab_sepsis: 'Sepsis', tab_apache: 'APACHE II',
    chooseLanguage: 'Elegir idioma',
  },
  ar: {
    subtitle: 'نظام الإنذار المبكر للعناية المركزة — مدعوم بالذكاء الاصطناعي',
    live: 'مباشر', patients: 'المرضى', predictRisk: 'توقع الخطر',
    predicting: 'جارٍ التحليل...', backendLive: 'الخادم نشط',
    pinging: 'جارٍ الاتصال...', reconnecting: 'إعادة الاتصال',
    disclaimer: '⚠️ عرض توضيحي فقط — BioSignal مدرب على بيانات MIMIC-IV. لا تستخدمه للقرارات الطبية.',
    clickPredict: 'انقر', toRunML: 'لتشغيل تحليل ML',
    lightgbm: 'نموذج LightGBM مع قابلية تفسير SHAP',
    tab_dashboard: 'لوحة ML', tab_analyzer: 'محلل التقارير',
    tab_heatmap: 'خريطة الحرارة', tab_timeline: 'الجدول الزمني',
    tab_fluid: 'توازن السوائل', tab_shift: 'تقرير الوردية',
    tab_model: 'إحصائيات النموذج', tab_export: 'تصدير',
    tab_sepsis: 'Sepsis', tab_apache: 'APACHE II',
    chooseLanguage: 'اختر اللغة',
  },
  pt: {
    subtitle: 'Sistema de Alerta Precoce ICU — Alimentado por ML',
    live: 'Ao vivo', patients: 'Pacientes', predictRisk: 'Prever risco',
    predicting: 'Analisando...', backendLive: 'Servidor ativo',
    pinging: 'Conectando...', reconnecting: 'Reconectando',
    disclaimer: '⚠️ Apenas demonstração — BioSignal usa dados simulados treinados no MIMIC-IV. Não use para decisões médicas.',
    clickPredict: 'Clique', toRunML: 'para executar análise ML',
    lightgbm: 'Modelo LightGBM com explicabilidade SHAP',
    tab_dashboard: 'Painel ML', tab_analyzer: 'Analisador de relatórios',
    tab_heatmap: 'Mapa de calor', tab_timeline: 'Linha do tempo',
    tab_fluid: 'Balanço de fluidos', tab_shift: 'Relatório de turno',
    tab_model: 'Estatísticas do modelo', tab_export: 'Exportar',
    tab_sepsis: 'Sepsis', tab_apache: 'APACHE II',
    chooseLanguage: 'Escolher idioma',
  },
  ru: {
    subtitle: 'Система раннего предупреждения ICU — на основе ML',
    live: 'В эфире', patients: 'Пациенты', predictRisk: 'Предсказать риск',
    predicting: 'Анализ...', backendLive: 'Сервер активен',
    pinging: 'Подключение...', reconnecting: 'Переподключение',
    disclaimer: '⚠️ Только демо — BioSignal обучен на данных MIMIC-IV. Не использовать для медицинских решений.',
    clickPredict: 'Нажмите', toRunML: 'для запуска анализа ML',
    lightgbm: 'Модель LightGBM с объяснимостью SHAP',
    tab_dashboard: 'Панель ML', tab_analyzer: 'Анализатор отчётов',
    tab_heatmap: 'Тепловая карта', tab_timeline: 'Хронология',
    tab_fluid: 'Баланс жидкости', tab_shift: 'Отчёт смены',
    tab_model: 'Статистика модели', tab_export: 'Экспорт',
    tab_sepsis: 'Sepsis', tab_apache: 'APACHE II',
    chooseLanguage: 'Выбрать язык',
  },
  ja: {
    subtitle: 'ICU 早期警告システム — ML 搭載',
    live: 'ライブ', patients: '患者', predictRisk: 'リスク予測',
    predicting: '分析中...', backendLive: 'サーバー稼働中',
    pinging: '接続中...', reconnecting: '再接続中',
    disclaimer: '⚠️ デモのみ — BioSignal は MIMIC-IV データで学習。医療判断には使用しないでください。',
    clickPredict: 'クリック', toRunML: 'ML 分析を実行するには',
    lightgbm: 'SHAP 解釈可能性を備えた LightGBM モデル',
    tab_dashboard: 'ML ダッシュボード', tab_analyzer: 'レポート分析',
    tab_heatmap: 'ヒートマップ', tab_timeline: 'タイムライン',
    tab_fluid: '水分バランス', tab_shift: 'シフトレポート',
    tab_model: 'モデル統計', tab_export: 'エクスポート',
    tab_sepsis: 'Sepsis', tab_apache: 'APACHE II',
    chooseLanguage: '言語を選択',
  },
  fr: {
    subtitle: 'Système d\'alerte précoce ICU — Propulsé par ML',
    live: 'En direct', patients: 'Patients', predictRisk: 'Prédire le risque',
    predicting: 'Analyse en cours...', backendLive: 'Serveur actif',
    pinging: 'Connexion...', reconnecting: 'Reconnexion',
    disclaimer: '⚠️ Démo uniquement — BioSignal utilise des données simulées entraînées sur MIMIC-IV. Ne pas utiliser pour des décisions médicales.',
    clickPredict: 'Cliquez', toRunML: 'pour lancer l\'analyse ML',
    lightgbm: 'Modèle LightGBM avec explicabilité SHAP',
    tab_dashboard: 'Tableau ML', tab_analyzer: 'Analyseur de rapports',
    tab_heatmap: 'Carte thermique', tab_timeline: 'Chronologie',
    tab_fluid: 'Bilan hydrique', tab_shift: 'Rapport de garde',
    tab_model: 'Statistiques du modèle', tab_export: 'Exporter',
    tab_sepsis: 'Sepsis', tab_apache: 'APACHE II',
    chooseLanguage: 'Choisir la langue',
  },
  de: {
    subtitle: 'ICU Frühwarnsystem — ML-gestützt',
    live: 'Live', patients: 'Patienten', predictRisk: 'Risiko vorhersagen',
    predicting: 'Wird analysiert...', backendLive: 'Server aktiv',
    pinging: 'Verbinde...', reconnecting: 'Verbinde erneut',
    disclaimer: '⚠️ Nur Demo — BioSignal verwendet simulierte Patientendaten aus MIMIC-IV. Nicht für klinische Entscheidungen verwenden.',
    clickPredict: 'Klicken Sie', toRunML: 'um ML-Analyse zu starten',
    lightgbm: 'LightGBM-Modell mit SHAP-Erklärbarkeit',
    tab_dashboard: 'ML-Dashboard', tab_analyzer: 'Berichtsanalysator',
    tab_heatmap: 'Heatmap', tab_timeline: 'Zeitachse',
    tab_fluid: 'Flüssigkeitsbilanz', tab_shift: 'Schichtbericht',
    tab_model: 'Modellstatistiken', tab_export: 'Exportieren',
    tab_sepsis: 'Sepsis', tab_apache: 'APACHE II',
    chooseLanguage: 'Sprache wählen',
  },
  ko: {
    subtitle: 'ICU 조기 경보 시스템 — ML 기반',
    live: '라이브', patients: '환자', predictRisk: '위험 예측',
    predicting: '분석 중...', backendLive: '서버 활성',
    pinging: '연결 중...', reconnecting: '재연결 중',
    disclaimer: '⚠️ 데모 전용 — BioSignal은 MIMIC-IV 데이터로 학습되었습니다. 의료 결정에 사용하지 마세요.',
    clickPredict: '클릭', toRunML: 'ML 분석 실행',
    lightgbm: 'SHAP 설명 가능성을 갖춘 LightGBM 모델',
    tab_dashboard: 'ML 대시보드', tab_analyzer: '보고서 분석기',
    tab_heatmap: '히트맵', tab_timeline: '타임라인',
    tab_fluid: '수분 균형', tab_shift: '교대 보고서',
    tab_model: '모델 통계', tab_export: '내보내기',
    tab_sepsis: 'Sepsis', tab_apache: 'APACHE II',
    chooseLanguage: '언어 선택',
  },
  id: {
    subtitle: 'Sistem Peringatan Dini ICU — Didukung ML',
    live: 'Langsung', patients: 'Pasien', predictRisk: 'Prediksi Risiko',
    predicting: 'Menganalisis...', backendLive: 'Server Aktif',
    pinging: 'Menghubungkan...', reconnecting: 'Menghubungkan ulang',
    disclaimer: '⚠️ Hanya demo — BioSignal menggunakan data simulasi yang dilatih pada MIMIC-IV. Tidak untuk keputusan medis.',
    clickPredict: 'Klik', toRunML: 'untuk menjalankan analisis ML',
    lightgbm: 'Model LightGBM dengan keterbacaan SHAP',
    tab_dashboard: 'Dasbor ML', tab_analyzer: 'Penganalisis Laporan',
    tab_heatmap: 'Peta Panas', tab_timeline: 'Linimasa',
    tab_fluid: 'Keseimbangan Cairan', tab_shift: 'Laporan Giliran',
    tab_model: 'Statistik Model', tab_export: 'Ekspor',
    tab_sepsis: 'Sepsis', tab_apache: 'APACHE II',
    chooseLanguage: 'Pilih Bahasa',
  },
}

export const LanguageContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: 'en', setLang: () => {} })
export const useLang = () => useContext(LanguageContext)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem('biosignal-lang') as Lang
    if (saved && translations[saved]) { setLangState(saved); return }
    const bl = navigator.language.toLowerCase()
    if (bl.startsWith('hi')) setLangState('hi')
    else if (bl.startsWith('bn')) setLangState('bn')
    else if (bl.startsWith('te')) setLangState('te')
    else if (bl.startsWith('ta')) setLangState('ta')
    else if (bl.startsWith('mr')) setLangState('mr')
    else if (bl.startsWith('gu')) setLangState('gu')
    else if (bl.startsWith('kn')) setLangState('kn')
    else if (bl.startsWith('ml')) setLangState('ml')
    else if (bl.startsWith('or') || bl.startsWith('od')) setLangState('or')
    else if (bl.startsWith('pa')) setLangState('pa')
    else if (bl.startsWith('zh')) setLangState('zh')
    else if (bl.startsWith('es')) setLangState('es')
    else if (bl.startsWith('ar')) setLangState('ar')
    else if (bl.startsWith('pt')) setLangState('pt')
    else if (bl.startsWith('ru')) setLangState('ru')
    else if (bl.startsWith('ja')) setLangState('ja')
    else if (bl.startsWith('fr')) setLangState('fr')
    else if (bl.startsWith('de')) setLangState('de')
    else if (bl.startsWith('ko')) setLangState('ko')
    else if (bl.startsWith('id')) setLangState('id')
  }, [])

  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem('biosignal-lang', l) }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export default function LanguageToggle() {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const current = LANGUAGES.find(l => l.code === lang)!
  const t = translations[lang]

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 bg-gray-900 border border-gray-700 hover:border-gray-500 text-gray-300 text-xs px-3 py-1.5 rounded-lg transition-all">
        <span>{current.flag} {current.label}</span>
        <span className="text-gray-500">▾</span>
      </button>
      {open && (
        <div className="absolute right-0 top-9 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden z-50 w-48 shadow-2xl max-h-80 overflow-y-auto">
          <div className="px-3 py-2 border-b border-gray-800">
            <p className="text-xs text-gray-500">{t.chooseLanguage}</p>
          </div>
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => { setLang(l.code); setOpen(false) }}
              className={`w-full text-left px-4 py-2 text-xs transition-all flex items-center gap-2 ${lang === l.code ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
              <span>{l.flag}</span>
              <span>{l.label}</span>
              <span className={`ml-auto text-xs ${lang === l.code ? 'text-blue-200' : 'text-gray-600'}`}>{l.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
