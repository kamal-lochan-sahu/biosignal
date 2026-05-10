'use client'
import { useState } from 'react'
import { Activity, ClipboardList, Heart, Users, Droplets, AlertTriangle, BarChart2, FileText, Download, Clock, Microscope } from 'lucide-react'
import PatientCard from '@/app/components/PatientCard'
import RiskGauge from '@/app/components/RiskGauge'
import SHAPExplainer from '@/app/components/SHAPExplainer'
import VitalsChart from '@/app/components/VitalsChart'
import AlertPanel from '@/app/components/AlertPanel'
import News2Score from '@/app/components/News2Score'
import SofaScore from '@/app/components/SofaScore'
import PatientHeatmap from '@/app/components/PatientHeatmap'
import PatientTimeline from '@/app/components/PatientTimeline'
import FluidBalance from '@/app/components/FluidBalance'
import SepsisAlert from '@/app/components/SepsisAlert'
import ApacheII from '@/app/components/ApacheII'
import ShiftReport from '@/app/components/ShiftReport'
import ModelPerformance from '@/app/components/ModelPerformance'
import ExportData from '@/app/components/ExportData'
import ReportAnalyzer from '@/app/components/ReportAnalyzer'
import { predictRisk } from '@/lib/api'
import LanguageToggle, { useLang, translations } from '@/app/components/LanguageToggle'
import type { PredictionResult } from '@/lib/api'

const PATIENTS = [
  { id: 'P001', name: 'Rajesh Kumar', age: 58, unit: 'Trauma SICU',
    vitals: { heart_rate_mean:112, heart_rate_std:6, heart_rate_min:100, heart_rate_max:128,
      spo2_mean:88, spo2_std:2, spo2_min:84, spo2_max:92,
      bp_systolic_mean:84, bp_systolic_std:4, bp_systolic_min:78, bp_systolic_max:92,
      bp_diastolic_mean:54, bp_diastolic_std:3, bp_diastolic_min:48, bp_diastolic_max:62,
      respiratory_rate_mean:29, respiratory_rate_std:4, respiratory_rate_min:24, respiratory_rate_max:36 } },
  { id: 'P002', name: 'Priya Sharma', age: 45, unit: 'Neuro SICU',
    vitals: { heart_rate_mean:88, heart_rate_std:4, heart_rate_min:80, heart_rate_max:96,
      spo2_mean:96, spo2_std:1, spo2_min:94, spo2_max:99,
      bp_systolic_mean:118, bp_systolic_std:5, bp_systolic_min:110, bp_systolic_max:128,
      bp_diastolic_mean:72, bp_diastolic_std:3, bp_diastolic_min:66, bp_diastolic_max:78,
      respiratory_rate_mean:16, respiratory_rate_std:2, respiratory_rate_min:14, respiratory_rate_max:20 } },
  { id: 'P003', name: 'Amit Das', age: 67, unit: 'Cardiac ICU',
    vitals: { heart_rate_mean:102, heart_rate_std:8, heart_rate_min:90, heart_rate_max:118,
      spo2_mean:92, spo2_std:2, spo2_min:88, spo2_max:95,
      bp_systolic_mean:94, bp_systolic_std:6, bp_systolic_min:86, bp_systolic_max:104,
      bp_diastolic_mean:60, bp_diastolic_std:4, bp_diastolic_min:54, bp_diastolic_max:68,
      respiratory_rate_mean:22, respiratory_rate_std:3, respiratory_rate_min:18, respiratory_rate_max:28 } },
  { id: 'P004', name: 'Sunita Patel', age: 34, unit: 'Neuro Stepdown',
    vitals: { heart_rate_mean:74, heart_rate_std:3, heart_rate_min:68, heart_rate_max:82,
      spo2_mean:98, spo2_std:1, spo2_min:96, spo2_max:100,
      bp_systolic_mean:122, bp_systolic_std:4, bp_systolic_min:116, bp_systolic_max:130,
      bp_diastolic_mean:76, bp_diastolic_std:3, bp_diastolic_min:70, bp_diastolic_max:82,
      respiratory_rate_mean:14, respiratory_rate_std:1, respiratory_rate_min:13, respiratory_rate_max:16 } },
]

function genChart(v: typeof PATIENTS[0]['vitals']) {
  return Array.from({ length: 12 }, (_, i) => ({
    time: `${i}h`,
    hr: Math.round(v.heart_rate_mean + (Math.random() - 0.5) * v.heart_rate_std * 4),
    spo2: Math.round(v.spo2_mean + (Math.random() - 0.5) * v.spo2_std * 2),
    rr: Math.round(v.respiratory_rate_mean + (Math.random() - 0.5) * v.respiratory_rate_std * 4),
    sbp: Math.round(v.bp_systolic_mean + (Math.random() - 0.5) * v.bp_systolic_std * 4),
  }))
}

type Tab = 'dashboard' | 'news2' | 'sofa' | 'heatmap' | 'timeline' | 'fluid' | 'sepsis' | 'apache' | 'shift' | 'model' | 'export' | 'analyzer'

const TABS: { id: Tab; label: string; icon: React.ElementType; global?: boolean }[] = [
  { id: 'dashboard', label: 'ML Dashboard', icon: Activity },
  { id: 'analyzer', label: 'Report Analyzer', icon: Microscope, global: true },
  { id: 'news2', label: 'NEWS2', icon: ClipboardList },
  { id: 'sofa', label: 'SOFA', icon: Heart },
  { id: 'heatmap', label: 'Heatmap', icon: Users, global: true },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'fluid', label: 'Fluid Balance', icon: Droplets },
  { id: 'sepsis', label: 'Sepsis', icon: AlertTriangle },
  { id: 'apache', label: 'APACHE II', icon: BarChart2 },
  { id: 'shift', label: 'Shift Report', icon: FileText, global: true },
  { id: 'model', label: 'Model Stats', icon: BarChart2, global: true },
  { id: 'export', label: 'Export', icon: Download, global: true },
]

export default function Dashboard() {
  const [selected, setSelected] = useState(PATIENTS[0])
  const [results, setResults] = useState<Record<string, PredictionResult>>({})
  const [loading, setLoading] = useState(false)
  const [chartData, setChartData] = useState(() => genChart(PATIENTS[0].vitals))
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  const { lang } = useLang()
  const t = translations[lang]
  const currentResult = results[selected.id]

  const handleSelect = (p: typeof PATIENTS[0]) => {
    setSelected(p)
    setChartData(genChart(p.vitals))
  }

  const handleSelectById = (id: string) => {
    const p = PATIENTS.find(p => p.id === id)
    if (p) { handleSelect(p); setActiveTab('dashboard') }
  }

  const handlePredict = async () => {
    setLoading(true)
    try {
      const result = await predictRisk(selected.vitals)
      setResults(prev => ({ ...prev, [selected.id]: result }))
    } catch {
      alert('API Error — Is backend running?')
    }
    setLoading(false)
  }

  const highRiskAlerts = Object.entries(results)
    .filter(([, r]) => r.risk_level === 'HIGH')
    .map(([id, r]) => {
      const p = PATIENTS.find(p => p.id === id)!
      return { name: p.name, score: r.risk_score, unit: p.unit }
    })

  const isGlobal = TABS.find(t => t.id === activeTab)?.global

  return (
    <div className="min-h-screen bg-gray-950 p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-600 p-2 rounded-lg flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <polyline points="2,20 7,20 11,8 15,32 18,14 21,24 25,4 29,34 32,16 35,20 38,20" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">BioSignal</h1>
          <p className="text-xs text-gray-400">ICU Early Warning System — Powered by ML</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">{t.live}</span>
          <LanguageToggle />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'}`}>
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {highRiskAlerts.length > 0 && (
        <div className="mb-4"><AlertPanel alerts={highRiskAlerts} /></div>
      )}

      {/* Global tabs — full width, no sidebar */}
      {isGlobal ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            {(() => { const t = TABS.find(t => t.id === activeTab)!; const Icon = t.icon; return <><Icon className="w-5 h-5 text-blue-400" />{t.label}</> })()}
          </h3>
          {activeTab === 'heatmap' && <PatientHeatmap patients={PATIENTS} results={results} onSelect={handleSelectById} />}
          {activeTab === 'shift' && <ShiftReport patients={PATIENTS} results={results} />}
          {activeTab === 'model' && <ModelPerformance />}
          {activeTab === 'export' && <ExportData patients={PATIENTS} results={results} />}
          {activeTab === 'analyzer' && <ReportAnalyzer />}
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4">
          {/* Patient List */}
          <div className="col-span-3 space-y-2">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Patients ({PATIENTS.length})
            </h2>
            {PATIENTS.map(p => (
              <PatientCard key={p.id}
                patient={{ ...p, ...(results[p.id] || {}) }}
                selected={selected.id === p.id}
                onClick={() => handleSelect(p)} />
            ))}
          </div>

          {/* Main Content */}
          <div className="col-span-9 space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">{selected.name}</h2>
                  <p className="text-sm text-gray-400">{selected.age} years • {selected.unit} • ID: {selected.id}</p>
                </div>
                {activeTab === 'dashboard' && (
                  <button onClick={handlePredict} disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-all">
                    {loading ? 'Predicting...' : 'Predict Risk'}
                  </button>
                )}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              {activeTab === 'dashboard' && (
                <>
                  {currentResult ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col items-center justify-center">
                          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Deterioration Risk (Next 6h)</h3>
                          <RiskGauge score={currentResult.risk_score} level={currentResult.risk_level} />
                        </div>
                        <SHAPExplainer factors={currentResult.top_factors} />
                      </div>
                      <VitalsChart data={chartData} />
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Activity className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                      <p className="text-gray-500">Click <span className="text-blue-400 font-semibold">Predict Risk</span> to run ML analysis</p>
                      <p className="text-xs text-gray-600 mt-1">LightGBM model with SHAP explainability</p>
                    </div>
                  )}
                </>
              )}
              {activeTab === 'news2' && <News2Score key={selected.id} initialVitals={selected.vitals} />}
              {activeTab === 'sofa' && <SofaScore key={selected.id} initialVitals={selected.vitals} />}
              {activeTab === 'timeline' && <PatientTimeline key={selected.id} patientName={selected.name} admitTime="2026-05-04 08:00" vitals={selected.vitals} />}
              {activeTab === 'fluid' && <FluidBalance key={selected.id} patientName={selected.name} />}
              {activeTab === 'sepsis' && <SepsisAlert key={selected.id} initialVitals={selected.vitals} />}
              {activeTab === 'apache' && <ApacheII key={selected.id} initialVitals={selected.vitals} initialAge={selected.age} />}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
