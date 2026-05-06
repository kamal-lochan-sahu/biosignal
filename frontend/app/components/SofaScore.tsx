'use client'
import { useState } from 'react'

interface SofaValues {
  pao2_fio2: number
  platelets: number
  bilirubin: number
  map: number
  gcs: number
  creatinine: number
}

function calcSofa(v: SofaValues) {
  let resp = 0
  if (v.pao2_fio2 < 100) resp = 4
  else if (v.pao2_fio2 < 200) resp = 3
  else if (v.pao2_fio2 < 300) resp = 2
  else if (v.pao2_fio2 < 400) resp = 1

  let coag = 0
  if (v.platelets < 20) coag = 4
  else if (v.platelets < 50) coag = 3
  else if (v.platelets < 100) coag = 2
  else if (v.platelets < 150) coag = 1

  let liver = 0
  if (v.bilirubin >= 12) liver = 4
  else if (v.bilirubin >= 6) liver = 3
  else if (v.bilirubin >= 2) liver = 2
  else if (v.bilirubin >= 1.2) liver = 1

  let cardio = 0
  if (v.map < 70) cardio = 1

  let neuro = 0
  if (v.gcs < 6) neuro = 4
  else if (v.gcs < 10) neuro = 3
  else if (v.gcs < 13) neuro = 2
  else if (v.gcs < 15) neuro = 1

  let renal = 0
  if (v.creatinine >= 5) renal = 4
  else if (v.creatinine >= 3.5) renal = 3
  else if (v.creatinine >= 2) renal = 2
  else if (v.creatinine >= 1.2) renal = 1

  const total = resp + coag + liver + cardio + neuro + renal
  const mortality = total <= 1 ? '<10%' : total <= 3 ? '~10%' : total <= 5 ? '~20%' : total <= 7 ? '~40%' : total <= 9 ? '~60%' : '>80%'

  return {
    total, mortality,
    breakdown: [
      { organ: 'Respiration', label: `PaO2/FiO2: ${v.pao2_fio2}`, score: resp },
      { organ: 'Coagulation', label: `Platelets: ${v.platelets}K`, score: coag },
      { organ: 'Liver', label: `Bilirubin: ${v.bilirubin} mg/dL`, score: liver },
      { organ: 'Cardiovascular', label: `MAP: ${v.map} mmHg`, score: cardio },
      { organ: 'Neurological', label: `GCS: ${v.gcs}`, score: neuro },
      { organ: 'Renal', label: `Creatinine: ${v.creatinine} mg/dL`, score: renal },
    ]
  }
}

export default function SofaScore() {
  const [vals, setVals] = useState<SofaValues>({
    pao2_fio2: 350, platelets: 180, bilirubin: 1.0,
    map: 75, gcs: 15, creatinine: 1.0
  })
  const { total, mortality, breakdown } = calcSofa(vals)
  const color = total >= 11 ? 'text-red-400' : total >= 7 ? 'text-orange-400' : total >= 3 ? 'text-yellow-400' : 'text-green-400'
  const bg = total >= 11 ? 'bg-red-950/50 border-red-800' : total >= 7 ? 'bg-orange-950/50 border-orange-800' : total >= 3 ? 'bg-yellow-950/50 border-yellow-800' : 'bg-green-950/50 border-green-800'

  const fields = [
    { label: 'PaO2/FiO2 Ratio', key: 'pao2_fio2', min: 50, max: 500, step: 10 },
    { label: 'Platelets (×10³/μL)', key: 'platelets', min: 5, max: 400, step: 5 },
    { label: 'Bilirubin (mg/dL)', key: 'bilirubin', min: 0.1, max: 15, step: 0.1 },
    { label: 'MAP (mmHg)', key: 'map', min: 40, max: 120, step: 1 },
    { label: 'GCS Score', key: 'gcs', min: 3, max: 15, step: 1 },
    { label: 'Creatinine (mg/dL)', key: 'creatinine', min: 0.3, max: 8, step: 0.1 },
  ]

  return (
    <div className="space-y-4">
      <div className={`border rounded-lg p-4 ${bg}`}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">SOFA Total Score</p>
            <p className={`text-5xl font-bold mt-1 ${color}`}>{total}<span className="text-lg">/24</span></p>
            <p className={`text-sm font-semibold mt-1 ${color}`}>Estimated Mortality: {mortality}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Sequential Organ Failure Assessment</p>
            <p className="text-xs text-gray-500 mt-1">ICU Standard Protocol</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {fields.map(f => (
          <div key={f.key} className="bg-gray-900 rounded-lg p-3">
            <label className="text-xs text-gray-400">{f.label}</label>
            <div className="flex items-center gap-2 mt-1">
              <input type="range" min={f.min} max={f.max} step={f.step}
                value={vals[f.key as keyof SofaValues]}
                onChange={e => setVals(p => ({ ...p, [f.key]: parseFloat(e.target.value) }))}
                className="flex-1 accent-blue-500" />
              <span className="text-white font-bold text-sm w-12 text-right">
                {Number(vals[f.key as keyof SofaValues]).toFixed(f.step < 1 ? 1 : 0)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-500 uppercase tracking-wider">Organ Breakdown</p>
        {breakdown.map((b, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-32">{b.organ}</span>
            <div className="flex-1 bg-gray-800 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all duration-500 ${b.score >= 3 ? 'bg-red-500' : b.score >= 2 ? 'bg-yellow-500' : b.score >= 1 ? 'bg-blue-500' : 'bg-green-500'}`}
                style={{ width: `${(b.score / 4) * 100}%` }} />
            </div>
            <span className="text-xs text-gray-400 w-32 text-right">{b.label}</span>
            <span className={`text-xs font-bold w-4 ${b.score >= 3 ? 'text-red-400' : b.score >= 2 ? 'text-yellow-400' : b.score >= 1 ? 'text-blue-400' : 'text-green-400'}`}>{b.score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
