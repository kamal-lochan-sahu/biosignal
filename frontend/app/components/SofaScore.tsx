'use client'
import { useState } from 'react'

interface SofaValues { pao2_fio2: number; platelets: number; bilirubin: number; map: number; gcs: number; creatinine: number }
interface Props { initialVitals?: { bp_systolic_mean: number; bp_diastolic_mean: number } }

function calcSofa(v: SofaValues) {
  let resp = 0
  if (v.pao2_fio2 < 100) resp = 4; else if (v.pao2_fio2 < 200) resp = 3; else if (v.pao2_fio2 < 300) resp = 2; else if (v.pao2_fio2 < 400) resp = 1
  let coag = 0
  if (v.platelets < 20) coag = 4; else if (v.platelets < 50) coag = 3; else if (v.platelets < 100) coag = 2; else if (v.platelets < 150) coag = 1
  let liver = 0
  if (v.bilirubin >= 12) liver = 4; else if (v.bilirubin >= 6) liver = 3; else if (v.bilirubin >= 2) liver = 2; else if (v.bilirubin >= 1.2) liver = 1
  const cardio = v.map < 70 ? 1 : 0
  let neuro = 0
  if (v.gcs < 6) neuro = 4; else if (v.gcs < 10) neuro = 3; else if (v.gcs < 13) neuro = 2; else if (v.gcs < 15) neuro = 1
  let renal = 0
  if (v.creatinine >= 5) renal = 4; else if (v.creatinine >= 3.5) renal = 3; else if (v.creatinine >= 2) renal = 2; else if (v.creatinine >= 1.2) renal = 1
  const total = resp + coag + liver + cardio + neuro + renal
  const mortality = total <= 1 ? '<10%' : total <= 3 ? '~10%' : total <= 5 ? '~20%' : total <= 7 ? '~40%' : total <= 9 ? '~60%' : '>80%'
  return { total, mortality, breakdown: [
    { organ: 'Respiration', icon: '🫁', label: `PaO₂/FiO₂: ${v.pao2_fio2}`, score: resp },
    { organ: 'Coagulation', icon: '🩸', label: `Platelets: ${v.platelets}K`, score: coag },
    { organ: 'Liver',       icon: '🫀', label: `Bilirubin: ${v.bilirubin} mg/dL`, score: liver },
    { organ: 'Cardiovascular', icon: '❤️', label: `MAP: ${v.map} mmHg`, score: cardio },
    { organ: 'Neurological', icon: '🧠', label: `GCS: ${v.gcs}`, score: neuro },
    { organ: 'Renal',       icon: '🫘', label: `Creatinine: ${v.creatinine} mg/dL`, score: renal },
  ]}
}

function getScoreColor(score: number) {
  if (score >= 3) return 'var(--clr-critical)'
  if (score >= 2) return 'var(--clr-warning)'
  if (score >= 1) return 'var(--clr-info, #3b82f6)'
  return 'var(--clr-success)'
}

function getTotalTokens(total: number) {
  if (total >= 11) return { color: 'var(--clr-critical)', dim: 'var(--critical-dim)', border: 'var(--critical-border)' }
  if (total >= 7)  return { color: 'var(--clr-warning)',  dim: 'var(--warning-dim)',  border: 'var(--warning-border)' }
  if (total >= 3)  return { color: 'var(--clr-warning)',  dim: 'var(--warning-dim)',  border: 'var(--warning-border)' }
  return               { color: 'var(--clr-success)',  dim: 'var(--success-dim)',  border: 'var(--success-border)' }
}

export default function SofaScore({ initialVitals }: Props) {
  const map = initialVitals ? Math.round((initialVitals.bp_systolic_mean + 2 * initialVitals.bp_diastolic_mean) / 3) : 75
  const [vals, setVals] = useState<SofaValues>({ pao2_fio2: 350, platelets: 180, bilirubin: 1.0, map, gcs: 15, creatinine: 1.0 })
  const { total, mortality, breakdown } = calcSofa(vals)
  const tk = getTotalTokens(total)
  const fields = [
    { label: 'PaO₂/FiO₂ Ratio', key: 'pao2_fio2', min: 50, max: 500, step: 10 },
    { label: 'Platelets (×10³/μL)', key: 'platelets', min: 5, max: 400, step: 5 },
    { label: 'Bilirubin (mg/dL)', key: 'bilirubin', min: 0.1, max: 15, step: 0.1 },
    { label: 'MAP (mmHg)', key: 'map', min: 40, max: 120, step: 1 },
    { label: 'GCS Score', key: 'gcs', min: 3, max: 15, step: 1 },
    { label: 'Creatinine (mg/dL)', key: 'creatinine', min: 0.3, max: 8, step: 0.1 },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Score Header */}
      <div style={{ background: tk.dim, border: `1px solid ${tk.border}`, borderRadius: '14px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>SOFA Total Score</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '56px', fontWeight: 700, color: tk.color, lineHeight: 1 }}>{total}</span>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '16px', color: 'var(--text-muted)' }}>/24</span>
          </div>
          <p style={{ fontSize: '13px', fontWeight: 600, color: tk.color, marginTop: '6px', fontFamily: 'var(--font-body)' }}>Est. Mortality: {mortality}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)' }}>Sequential Organ</p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)' }}>Failure Assessment</p>
        </div>
      </div>
      {/* Organ Breakdown */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px' }}>
        <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '14px' }}>Organ Breakdown</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {breakdown.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px', width: '20px' }}>{b.icon}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', width: '110px', flexShrink: 0 }}>{b.organ}</span>
              <div style={{ flex: 1, height: '5px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(b.score / 4) * 100}%`, background: getScoreColor(b.score), borderRadius: '3px', transition: 'width 0.5s ease', boxShadow: b.score > 0 ? `0 0 6px ${getScoreColor(b.score)}` : 'none' }} />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '120px', textAlign: 'right', fontFamily: 'var(--font-data)' }}>{b.label}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, width: '20px', textAlign: 'right', fontFamily: 'var(--font-data)', color: getScoreColor(b.score) }}>{b.score}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {fields.map(f => (
          <div key={f.key} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '12px 14px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)' }}>{f.label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
              <input type="range" min={f.min} max={f.max} step={f.step}
                value={vals[f.key as keyof SofaValues]}
                onChange={e => setVals(p => ({ ...p, [f.key]: parseFloat(e.target.value) }))}
                style={{ flex: 1, accentColor: 'var(--clr-primary)' }} />
              <span style={{ fontFamily: 'var(--font-data)', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', minWidth: '40px', textAlign: 'right' }}>
                {Number(vals[f.key as keyof SofaValues]).toFixed(f.step < 1 ? 1 : 0)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
