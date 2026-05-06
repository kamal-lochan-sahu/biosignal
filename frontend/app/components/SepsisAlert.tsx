'use client'
import { useState } from 'react'
import { AlertTriangle, ShieldCheck } from 'lucide-react'

interface SepsisInput {
  suspected_infection: boolean
  resp_rate: number
  altered_mentation: boolean
  sbp: number
  temp: number
  heart_rate: number
  wbc: number
  lactate: number
}

function calcSepsis(v: SepsisInput) {
  if (!v.suspected_infection) return { level: 'none', qsofa: 0, sirs: 0 }

  // qSOFA
  let qsofa = 0
  if (v.resp_rate >= 22) qsofa++
  if (v.altered_mentation) qsofa++
  if (v.sbp <= 100) qsofa++

  // SIRS
  let sirs = 0
  if (v.temp < 36 || v.temp > 38) sirs++
  if (v.heart_rate > 90) sirs++
  if (v.resp_rate > 20) sirs++
  if (v.wbc < 4 || v.wbc > 12) sirs++

  const sepsis = qsofa >= 2 || sirs >= 2
  const septicShock = sepsis && v.sbp < 90 && v.lactate > 2

  return {
    level: septicShock ? 'shock' : qsofa >= 2 ? 'sepsis' : sirs >= 2 ? 'sirs' : 'watch',
    qsofa, sirs
  }
}

export default function SepsisAlert() {
  const [vals, setVals] = useState<SepsisInput>({
    suspected_infection: true,
    resp_rate: 20,
    altered_mentation: false,
    sbp: 110,
    temp: 38.5,
    heart_rate: 95,
    wbc: 13,
    lactate: 1.5,
  })

  const { level, qsofa, sirs } = calcSepsis(vals)

  const levelConfig = {
    shock: { label: 'SEPTIC SHOCK', color: 'text-red-300', bg: 'bg-red-950 border-red-700', action: 'IMMEDIATE — ICU admission, vasopressors, cultures, broad-spectrum antibiotics' },
    sepsis: { label: 'SEPSIS', color: 'text-orange-300', bg: 'bg-orange-950 border-orange-700', action: 'URGENT — Blood cultures, IV antibiotics within 1hr, IV fluids' },
    sirs: { label: 'SIRS CRITERIA MET', color: 'text-yellow-300', bg: 'bg-yellow-950 border-yellow-700', action: 'MONITOR — Investigate source of infection, repeat assessment' },
    watch: { label: 'LOW SUSPICION', color: 'text-green-300', bg: 'bg-green-950 border-green-700', action: 'Continue routine monitoring' },
    none: { label: 'NO INFECTION SUSPECTED', color: 'text-gray-300', bg: 'bg-gray-900 border-gray-700', action: 'No sepsis workup indicated' },
  }

  const cfg = levelConfig[level as keyof typeof levelConfig]

  return (
    <div className="space-y-4">
      <div className={`border rounded-xl p-4 ${cfg.bg}`}>
        <div className="flex items-center gap-3">
          {level === 'none' || level === 'watch'
            ? <ShieldCheck className={`w-8 h-8 ${cfg.color}`} />
            : <AlertTriangle className={`w-8 h-8 ${cfg.color} animate-pulse`} />}
          <div>
            <p className={`text-lg font-black ${cfg.color}`}>{cfg.label}</p>
            <p className={`text-xs mt-0.5 ${cfg.color} opacity-80`}>{cfg.action}</p>
          </div>
        </div>
        <div className="flex gap-6 mt-3">
          <div className="text-center">
            <p className="text-xs text-gray-400">qSOFA</p>
            <p className={`text-2xl font-bold ${qsofa >= 2 ? 'text-red-400' : 'text-white'}`}>{qsofa}/3</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">SIRS</p>
            <p className={`text-2xl font-bold ${sirs >= 2 ? 'text-orange-400' : 'text-white'}`}>{sirs}/4</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Suspected Infection?</span>
          <button onClick={() => setVals(p => ({ ...p, suspected_infection: !p.suspected_infection }))}
            className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${vals.suspected_infection ? 'bg-red-700 text-white' : 'bg-gray-700 text-gray-400'}`}>
            {vals.suspected_infection ? 'YES' : 'NO'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Respiratory Rate (/min)', key: 'resp_rate', min: 8, max: 40, step: 1 },
          { label: 'BP Systolic (mmHg)', key: 'sbp', min: 60, max: 200, step: 1 },
          { label: 'Temperature (°C)', key: 'temp', min: 34, max: 41, step: 0.1 },
          { label: 'Heart Rate (bpm)', key: 'heart_rate', min: 40, max: 160, step: 1 },
          { label: 'WBC (×10³/μL)', key: 'wbc', min: 1, max: 30, step: 0.5 },
          { label: 'Lactate (mmol/L)', key: 'lactate', min: 0.5, max: 8, step: 0.1 },
        ].map(f => (
          <div key={f.key} className="bg-gray-900 rounded-lg p-3">
            <label className="text-xs text-gray-400">{f.label}</label>
            <div className="flex items-center gap-2 mt-1">
              <input type="range" min={f.min} max={f.max} step={f.step}
                value={vals[f.key as keyof SepsisInput] as number}
                onChange={e => setVals(p => ({ ...p, [f.key]: parseFloat(e.target.value) }))}
                className="flex-1 accent-red-500" />
              <span className="text-white font-bold text-sm w-10 text-right">
                {Number(vals[f.key as keyof SepsisInput]).toFixed(f.step < 1 ? 1 : 0)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Altered Mentation / Confusion?</span>
          <button onClick={() => setVals(p => ({ ...p, altered_mentation: !p.altered_mentation }))}
            className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${vals.altered_mentation ? 'bg-red-700 text-white' : 'bg-gray-700 text-gray-400'}`}>
            {vals.altered_mentation ? 'YES' : 'NO'}
          </button>
        </div>
      </div>
    </div>
  )
}
