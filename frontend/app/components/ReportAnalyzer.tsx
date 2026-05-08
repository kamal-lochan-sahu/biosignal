'use client'
import { useState, useRef } from 'react'
import { Upload, FileText, Activity, AlertTriangle, CheckCircle, Loader } from 'lucide-react'
import { predictRisk } from '@/lib/api'

interface VitalsData {
  heart_rate: number
  spo2: number
  bp_systolic: number
  bp_diastolic: number
  respiratory_rate: number
  temperature: number
  age: number
  name: string
}

interface AnalysisResult {
  risk_score: number
  risk_level: string
  top_factors: { feature: string; impact: number }[]
  explanation: string
}

function parseCSVVitals(csv: string): VitalsData | null {
  try {
    const lines = csv.trim().split("\n")
    const data: Record<string, number | string> = {}
    const mappings: Record<string, string> = {
      "heart rate": "heart_rate", "hr": "heart_rate", "pulse": "heart_rate",
      "spo2": "spo2", "oxygen saturation": "spo2", "o2 sat": "spo2",
      "bp systolic": "bp_systolic", "sbp": "bp_systolic", "systolic": "bp_systolic",
      "bp diastolic": "bp_diastolic", "dbp": "bp_diastolic", "diastolic": "bp_diastolic",
      "respiratory rate": "respiratory_rate", "rr": "respiratory_rate", "resp rate": "respiratory_rate",
      "temperature": "temperature", "temp": "temperature",
      "age": "age", "name": "name", "patient": "name",
    }
    for (const line of lines) {
      const parts = line.split(",")
      if (parts.length < 2) continue
      const key = parts[0].trim().toLowerCase()
      const value = parts.slice(1).join(",").trim()
      const mapped = mappings[key]
      if (mapped) data[mapped] = mapped === "name" ? value : parseFloat(value)
    }
    return {
      heart_rate: (data.heart_rate as number) || 80,
      spo2: (data.spo2 as number) || 96,
      bp_systolic: (data.bp_systolic as number) || 120,
      bp_diastolic: (data.bp_diastolic as number) || 75,
      respiratory_rate: (data.respiratory_rate as number) || 16,
      temperature: (data.temperature as number) || 37.0,
      age: (data.age as number) || 50,
      name: (data.name as string) || "Patient",
    }
  } catch { return null }
}

function generateExplanation(vitals: VitalsData, result: { risk_score: number; risk_level: string; top_factors: { feature: string; impact: number }[] }): string {
  const pct = Math.round(result.risk_score * 100)
  const level = result.risk_level
  const issues: string[] = []

  if (vitals.heart_rate > 100) issues.push(`heart rate is high at ${vitals.heart_rate} bpm (normal: 60-100)`)
  if (vitals.heart_rate < 50) issues.push(`heart rate is very low at ${vitals.heart_rate} bpm`)
  if (vitals.spo2 < 95) issues.push(`oxygen level is low at ${vitals.spo2}% (normal: 95-100%)`)
  if (vitals.bp_systolic < 90) issues.push(`blood pressure is dangerously low at ${vitals.bp_systolic} mmHg`)
  if (vitals.bp_systolic > 160) issues.push(`blood pressure is very high at ${vitals.bp_systolic} mmHg`)
  if (vitals.respiratory_rate > 20) issues.push(`breathing rate is fast at ${vitals.respiratory_rate}/min (normal: 12-20)`)
  if (vitals.temperature > 38.5) issues.push(`temperature is high at ${vitals.temperature}°C — possible infection`)
  if (vitals.temperature < 36) issues.push(`temperature is low at ${vitals.temperature}°C — hypothermia risk`)

  const topFactor = result.top_factors[0]?.feature?.replace(/_/g, " ") || "vital signs"
  const issueText = issues.length > 0 ? `Concerning signs: The patient's ${issues.join("; ")}.

` : "Most vital signs are within acceptable range.

"

  if (level === "HIGH") {
    return `⚠️ HIGH RISK — ${pct}% chance of deterioration in next 6 hours.

` +
      issueText +
      `Most critical factor: ${topFactor}. This patient needs immediate medical attention. ` +
      `Nursing staff should notify the doctor right away and monitor continuously.

` +
      `Do not delay — every minute matters in ICU care.`
  } else if (level === "MEDIUM") {
    return `⚡ MEDIUM RISK — ${pct}% chance of deterioration in next 6 hours.

` +
      issueText +
      `Key factor to watch: ${topFactor}. Increase monitoring frequency. ` +
      `Inform the doctor if any values worsen. The situation needs attention but is manageable.

` +
      `Stay alert and check vitals more frequently than routine.`
  } else {
    return `✅ LOW RISK — ${pct}% chance of deterioration in next 6 hours.

` +
      `Vital signs are mostly within normal ranges. ` +
      `Continue routine monitoring as scheduled.

` +
      `The patient appears stable. Reassess if any symptoms change or patient reports discomfort.`
  }
}

const SAMPLE_CSV = `name, John Patient
age, 62
heart rate, 118
spo2, 87
bp systolic, 82
bp diastolic, 52
respiratory rate, 28
temperature, 38.8`

export default function ReportAnalyzer() {
  const [mode, setMode] = useState<"manual" | "csv">("manual")
  const [csvText, setCsvText] = useState("")
  const [vitals, setVitals] = useState<VitalsData>({
    name: "Test Patient", age: 60,
    heart_rate: 95, spo2: 94,
    bp_systolic: 105, bp_diastolic: 65,
    respiratory_rate: 22, temperature: 37.8,
  })
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [parseSuccess, setParseSuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setCsvText(text)
      const parsed = parseCSVVitals(text)
      if (parsed) { setVitals(parsed); setParseSuccess(true) }
    }
    reader.readAsText(file)
  }

  const handleCSVParse = () => {
    const parsed = parseCSVVitals(csvText)
    if (parsed) { setVitals(parsed); setParseSuccess(true); setError("") }
    else setError("Could not parse — check format")
  }

  const handleAnalyze = async () => {
    setLoading(true); setError(""); setResult(null)
    try {
      const s = (v: number) => v * 0.05
      const apiInput = {
        heart_rate_mean: vitals.heart_rate,
        heart_rate_std: s(vitals.heart_rate),
        heart_rate_min: vitals.heart_rate - s(vitals.heart_rate) * 2,
        heart_rate_max: vitals.heart_rate + s(vitals.heart_rate) * 2,
        spo2_mean: vitals.spo2,
        spo2_std: s(vitals.spo2),
        spo2_min: Math.max(vitals.spo2 - 3, 50),
        spo2_max: Math.min(vitals.spo2 + 2, 100),
        bp_systolic_mean: vitals.bp_systolic,
        bp_systolic_std: s(vitals.bp_systolic),
        bp_systolic_min: vitals.bp_systolic - s(vitals.bp_systolic) * 2,
        bp_systolic_max: vitals.bp_systolic + s(vitals.bp_systolic) * 2,
        bp_diastolic_mean: vitals.bp_diastolic,
        bp_diastolic_std: s(vitals.bp_diastolic),
        bp_diastolic_min: vitals.bp_diastolic - s(vitals.bp_diastolic) * 2,
        bp_diastolic_max: vitals.bp_diastolic + s(vitals.bp_diastolic) * 2,
        respiratory_rate_mean: vitals.respiratory_rate,
        respiratory_rate_std: s(vitals.respiratory_rate),
        respiratory_rate_min: Math.max(vitals.respiratory_rate - 3, 4),
        respiratory_rate_max: vitals.respiratory_rate + 3,
      }
      const mlResult = await predictRisk(apiInput)
      setResult({ ...mlResult, explanation: generateExplanation(vitals, mlResult) })
    } catch { setError("Analysis failed — make sure backend is running on port 8000") }
    setLoading(false)
  }

  const riskColor = result?.risk_level === "HIGH" ? "text-red-400" : result?.risk_level === "MEDIUM" ? "text-yellow-400" : "text-green-400"
  const riskBg = result?.risk_level === "HIGH" ? "bg-red-950/50 border-red-800" : result?.risk_level === "MEDIUM" ? "bg-yellow-950/50 border-yellow-800" : "bg-green-950/50 border-green-800"

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">Patient Report Analyzer</h3>
          <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded-full ml-auto">Free — No API Cost</span>
        </div>
        <p className="text-xs text-gray-400">Enter real patient vitals manually or upload a CSV — BioSignal ML will analyse and explain in simple language</p>
      </div>

      <div className="flex gap-2">
        {(["manual", "csv"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === m ? "bg-blue-600 text-white" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}>
            {m === "manual" ? <><FileText className="w-4 h-4" />Manual Entry</> : <><Upload className="w-4 h-4" />CSV Upload</>}
          </button>
        ))}
      </div>

      {mode === "manual" && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs text-gray-400">Patient Name</label>
              <input value={vitals.name} onChange={e => setVitals(p => ({ ...p, name: e.target.value }))}
                className="w-full mt-1 bg-gray-800 text-white text-sm rounded px-3 py-2 outline-none border border-gray-700 focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400">Age (years)</label>
              <input type="number" value={vitals.age} onChange={e => setVitals(p => ({ ...p, age: parseInt(e.target.value) || 0 }))}
                className="w-full mt-1 bg-gray-800 text-white text-sm rounded px-3 py-2 outline-none border border-gray-700 focus:border-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Heart Rate (bpm)", key: "heart_rate", normal: "60-100" },
              { label: "SpO2 (%)", key: "spo2", normal: "95-100" },
              { label: "BP Systolic (mmHg)", key: "bp_systolic", normal: "90-140" },
              { label: "BP Diastolic (mmHg)", key: "bp_diastolic", normal: "60-90" },
              { label: "Respiratory Rate (/min)", key: "respiratory_rate", normal: "12-20" },
              { label: "Temperature (°C)", key: "temperature", normal: "36-38" },
            ].map(f => (
              <div key={f.key} className="bg-gray-800 rounded-lg p-3">
                <label className="text-xs text-gray-400">{f.label}</label>
                <input type="number" step="0.1"
                  value={vitals[f.key as keyof VitalsData] as number}
                  onChange={e => setVitals(p => ({ ...p, [f.key]: parseFloat(e.target.value) || 0 }))}
                  className="w-full mt-1 bg-gray-700 text-white text-xl font-bold rounded px-2 py-1.5 outline-none border border-gray-600 focus:border-blue-500" />
                <p className="text-xs text-gray-600 mt-1">Normal: {f.normal}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === "csv" && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
          <div className="flex gap-2">
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm px-4 py-2 rounded-lg transition-all">
              <Upload className="w-4 h-4" /> Choose CSV File
            </button>
            <button onClick={() => { setCsvText(SAMPLE_CSV); setParseSuccess(false) }}
              className="text-xs text-blue-400 hover:text-blue-300 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700">
              Load Sample Data
            </button>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Format: key, value (one per line)</p>
            <textarea value={csvText} onChange={e => { setCsvText(e.target.value); setParseSuccess(false) }}
              placeholder={"name, Patient Name\nage, 65\nheart rate, 110\nspo2, 91\nbp systolic, 85\nbp diastolic, 55\nrespiratory rate, 26\ntemperature, 38.9"}
              rows={9}
              className="w-full bg-gray-800 text-white text-xs font-mono rounded-lg px-3 py-2 outline-none border border-gray-700 focus:border-blue-500 resize-none" />
          </div>
          <button onClick={handleCSVParse}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg transition-all">
            Parse Data
          </button>
          {parseSuccess && (
            <div className="bg-green-950/50 border border-green-800 rounded-lg p-3">
              <p className="text-xs text-green-400 font-semibold mb-2">✓ Parsed — {vitals.name}, Age {vitals.age}</p>
              <div className="grid grid-cols-3 gap-1 text-xs text-gray-300">
                <span>HR: {vitals.heart_rate} bpm</span>
                <span>SpO2: {vitals.spo2}%</span>
                <span>BP: {vitals.bp_systolic}/{vitals.bp_diastolic}</span>
                <span>RR: {vitals.respiratory_rate}/min</span>
                <span>Temp: {vitals.temperature}°C</span>
                <span>Age: {vitals.age}y</span>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <div className="bg-red-950/50 border border-red-800 rounded-lg p-3 text-red-400 text-sm">{error}</div>}

      <button onClick={handleAnalyze} disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-bold py-3 rounded-xl text-sm transition-all">
        {loading ? <><Loader className="w-4 h-4 animate-spin" />Analyzing...</> : <><Activity className="w-4 h-4" />Analyze Patient Risk</>}
      </button>

      {result && (
        <div className="space-y-4">
          <div className={`border rounded-xl p-5 ${riskBg}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">ML Risk Assessment — {vitals.name}</p>
                <p className={`text-5xl font-black mt-1 ${riskColor}`}>{Math.round(result.risk_score * 100)}%</p>
                <p className={`text-sm font-bold mt-1 ${riskColor}`}>{result.risk_level} RISK — Deterioration in Next 6 Hours</p>
              </div>
              {result.risk_level === "HIGH"
                ? <AlertTriangle className="w-14 h-14 text-red-400 animate-pulse" />
                : result.risk_level === "MEDIUM"
                ? <AlertTriangle className="w-14 h-14 text-yellow-400" />
                : <CheckCircle className="w-14 h-14 text-green-400" />}
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Top Risk Factors (SHAP)</p>
              {result.top_factors.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-300 w-44">{f.feature.replace(/_/g, " ")}</span>
                  <div className="flex-1 bg-black/30 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${f.impact > 0 ? "bg-red-400" : "bg-green-400"}`}
                      style={{ width: `${Math.min(Math.abs(f.impact) / 1.5 * 100, 100)}%` }} />
                  </div>
                  <span className={`text-xs font-bold w-14 text-right ${f.impact > 0 ? "text-red-300" : "text-green-300"}`}>
                    {f.impact > 0 ? "+" : ""}{f.impact.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-blue-400" />
              <p className="text-sm font-semibold text-white">Plain Language Explanation</p>
              <span className="text-xs text-gray-500 ml-auto">Patient: {vitals.name}, {vitals.age}y</span>
            </div>
            <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-line bg-gray-800 rounded-lg p-4">
              {result.explanation}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
