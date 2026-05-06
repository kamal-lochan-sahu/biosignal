'use client'
import { useState } from 'react'

interface News2Input {
  respiratory_rate: number
  spo2: number
  on_oxygen: boolean
  bp_systolic: number
  heart_rate: number
  temperature: number
  consciousness: 'alert' | 'confused'
}

interface ScoreBreakdown {
  name: string
  value: string
  score: number
  max: number
}

function calcNews2(v: News2Input): { total: number; breakdown: ScoreBreakdown[] } {
  let rr = 0
  if (v.respiratory_rate < 12) rr = 3
  else if (v.respiratory_rate <= 20) rr = 0
  else if (v.respiratory_rate <= 24) rr = 2
  else rr = 3

  let spo2 = 0
  if (v.spo2 >= 97) spo2 = 3
  else if (v.spo2 >= 95) spo2 = 2
  else if (v.spo2 >= 93) spo2 = 1
  else spo2 = 0

  // NEWS2 Scale 2 for COPD patients (standard)
  let spo2Score = 0
  if (v.spo2 <= 83) spo2Score = 3
  else if (v.spo2 <= 85) spo2Score = 2
  else if (v.spo2 <= 87) spo2Score = 1
  else if (v.spo2 <= 92) spo2Score = 0
  else if (v.spo2 <= 94) spo2Score = v.on_oxygen ? 1 : 0
  else if (v.spo2 <= 96) spo2Score = v.on_oxygen ? 2 : 0
  else spo2Score = v.on_oxygen ? 3 : 0

  const o2 = v.on_oxygen ? 2 : 0

  let sbp = 0
  if (v.bp_systolic <= 90) sbp = 3
  else if (v.bp_systolic <= 100) sbp = 2
  else if (v.bp_systolic <= 110) sbp = 1
  else if (v.bp_systolic <= 219) sbp = 0
  else sbp = 3

  let hr = 0
  if (v.heart_rate <= 40) hr = 3
  else if (v.heart_rate <= 50) hr = 1
  else if (v.heart_rate <= 90) hr = 0
  else if (v.heart_rate <= 110) hr = 1
  else if (v.heart_rate <= 130) hr = 2
  else hr = 3

  let temp = 0
  if (v.temperature <= 35.0) temp = 3
  else if (v.temperature <= 36.0) temp = 1
  else if (v.temperature <= 38.0) temp = 0
  else if (v.temperature <= 39.0) temp = 1
  else temp = 2

  const consciousness = v.consciousness === 'confused' ? 3 : 0

  const total = rr + spo2Score + o2 + sbp + hr + temp + consciousness

  return {
    total,
    breakdown: [
      { name: 'Respiratory Rate', value: `${v.respiratory_rate}/min`, score: rr, max: 3 },
      { name: 'SpO2', value: `${v.spo2}%`, score: spo2Score, max: 3 },
      { name: 'Supplemental O2', value: v.on_oxygen ? 'Yes' : 'No', score: o2, max: 2 },
      { name: 'BP Systolic', value: `${v.bp_systolic} mmHg`, score: sbp, max: 3 },
      { name: 'Heart Rate', value: `${v.heart_rate} bpm`, score: hr, max: 3 },
      { name: 'Temperature', value: `${v.temperature}°C`, score: temp, max: 2 },
      { name: 'Consciousness', value: v.consciousness === 'alert' ? 'Alert' : 'Confused/CVPU', score: consciousness, max: 3 },
    ]
  }
}

function getRiskLevel(total: number) {
  if (total >= 7) return { label: 'HIGH', color: 'text-red-400', bg: 'bg-red-950/50 border-red-800', response: 'Continuous monitoring — Urgent clinical review' }
  if (total >= 5) return { label: 'MEDIUM', color: 'text-yellow-400', bg: 'bg-yellow-950/50 border-yellow-800', response: 'Increase frequency of monitoring' }
  return { label: 'LOW', color: 'text-green-400', bg: 'bg-green-950/50 border-green-800', response: 'Routine monitoring' }
}

interface Props {
  initialVitals?: {
    respiratory_rate_mean: number
    spo2_mean: number
    bp_systolic_mean: number
    heart_rate_mean: number
  }
}

export default function News2Score({ initialVitals }: Props) {
  const [vitals, setVitals] = useState<News2Input>({
    respiratory_rate: initialVitals?.respiratory_rate_mean ?? 18,
    spo2: initialVitals?.spo2_mean ?? 96,
    on_oxygen: false,
    bp_systolic: initialVitals?.bp_systolic_mean ?? 120,
    heart_rate: initialVitals?.heart_rate_mean ?? 80,
    temperature: 37.0,
    consciousness: 'alert',
  })

  const { total, breakdown } = calcNews2(vitals)
  const risk = getRiskLevel(total)

  const update = (key: keyof News2Input, value: number | boolean | string) =>
    setVitals(prev => ({ ...prev, [key]: value }))

  return (
    <div className="space-y-4">
      <div className={`border rounded-lg p-4 ${risk.bg}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">NEWS2 Total Score</p>
            <p className={`text-5xl font-bold mt-1 ${risk.color}`}>{total}</p>
            <p className={`text-sm font-semibold mt-1 ${risk.color}`}>{risk.label} RISK</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 max-w-48 text-right">{risk.response}</p>
            <p className="text-xs text-gray-500 mt-2">NHS Standard Protocol</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Respiratory Rate (/min)', key: 'respiratory_rate', min: 4, max: 60, step: 1 },
          { label: 'SpO2 (%)', key: 'spo2', min: 60, max: 100, step: 1 },
          { label: 'BP Systolic (mmHg)', key: 'bp_systolic', min: 60, max: 250, step: 1 },
          { label: 'Heart Rate (bpm)', key: 'heart_rate', min: 20, max: 200, step: 1 },
          { label: 'Temperature (°C)', key: 'temperature', min: 33, max: 42, step: 0.1 },
        ].map(field => (
          <div key={field.key} className="bg-gray-900 rounded-lg p-3">
            <label className="text-xs text-gray-400">{field.label}</label>
            <div className="flex items-center gap-2 mt-1">
              <input type="range" min={field.min} max={field.max} step={field.step}
                value={vitals[field.key as keyof News2Input] as number}
                onChange={e => update(field.key as keyof News2Input, parseFloat(e.target.value))}
                className="flex-1 accent-blue-500" />
              <span className="text-white font-bold text-sm w-12 text-right">
                {(vitals[field.key as keyof News2Input] as number).toFixed(field.step === 0.1 ? 1 : 0)}
              </span>
            </div>
          </div>
        ))}

        <div className="bg-gray-900 rounded-lg p-3">
          <label className="text-xs text-gray-400">Consciousness</label>
          <div className="flex gap-2 mt-2">
            {(['alert', 'confused'] as const).map(v => (
              <button key={v} onClick={() => update('consciousness', v)}
                className={`flex-1 py-1 rounded text-xs font-semibold transition-all ${
                  vitals.consciousness === v ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                {v === 'alert' ? 'Alert' : 'Confused'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-3 flex items-center justify-between">
        <span className="text-sm text-gray-300">On Supplemental Oxygen?</span>
        <button onClick={() => update('on_oxygen', !vitals.on_oxygen)}
          className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${
            vitals.on_oxygen ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
          {vitals.on_oxygen ? 'YES +2pts' : 'NO'}
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-500 uppercase tracking-wider">Score Breakdown</p>
        {breakdown.map((b, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-36">{b.name}</span>
            <div className="flex-1 bg-gray-800 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full transition-all duration-500 ${b.score > 1 ? 'bg-red-500' : b.score > 0 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${(b.score / b.max) * 100}%` }} />
            </div>
            <span className="text-xs text-gray-300 w-16 text-right">{b.value}</span>
            <span className={`text-xs font-bold w-6 text-right ${b.score > 1 ? 'text-red-400' : b.score > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
              +{b.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
