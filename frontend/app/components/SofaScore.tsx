'use client'
import { useState, type CSSProperties } from 'react'
import { calculateSofa, SOFA_MORTALITY_NOTE, type SofaInput, type VasopressorLevel } from '@/lib/scores'

interface Props { initialVitals?: { bp_systolic_mean: number; bp_diastolic_mean: number } }

type NumericKey = 'pao2Fio2' | 'platelets' | 'bilirubin' | 'map' | 'gcs' | 'creatinine' | 'urineOutputMl'

const FIELDS: { label: string; key: NumericKey; min: number; max: number; step: number }[] = [
  { label: 'PaO\u2082/FiO\u2082 Ratio', key: 'pao2Fio2', min: 50, max: 500, step: 10 },
  { label: 'Platelets (\u00d710\u00b3/\u03bcL)', key: 'platelets', min: 5, max: 400, step: 5 },
  { label: 'Bilirubin (mg/dL)', key: 'bilirubin', min: 0.1, max: 15, step: 0.1 },
  { label: 'MAP (mmHg)', key: 'map', min: 40, max: 120, step: 1 },
  { label: 'GCS Score', key: 'gcs', min: 3, max: 15, step: 1 },
  { label: 'Creatinine (mg/dL)', key: 'creatinine', min: 0.3, max: 8, step: 0.1 },
  { label: 'Urine output (mL/day)', key: 'urineOutputMl', min: 0, max: 3000, step: 50 },
]

const ICONS: Record<string, string> = {
  respiratory: '\ud83e\udec1', coagulation: '\ud83e\ude78', liver: '\ud83e\udec0',
  cardiovascular: '\u2764\ufe0f', neurological: '\ud83e\udde0', renal: '\ud83e\uded8',
}

const VASOPRESSOR_OPTIONS: { value: VasopressorLevel; label: string }[] = [
  { value: 'none', label: 'No vasopressor' },
  { value: 'low', label: 'Dopamine \u22645 or dobutamine (any dose)' },
  { value: 'medium', label: 'Dopamine 5\u201315, or epi / norepi \u22640.1' },
  { value: 'high', label: 'Dopamine >15, or epi / norepi >0.1' },
]

function getScoreColor(score: number) {
  if (score >= 3) return 'var(--clr-critical)'
  if (score >= 2) return 'var(--clr-warning)'
  if (score >= 1) return 'var(--clr-info, #3b82f6)'
  return 'var(--clr-success)'
}

function getTotalTokens(total: number) {
  if (total >= 11) return { color: 'var(--clr-critical)', dim: 'var(--critical-dim)', border: 'var(--critical-border)' }
  if (total >= 3)  return { color: 'var(--clr-warning)',  dim: 'var(--warning-dim)',  border: 'var(--warning-border)' }
  return               { color: 'var(--clr-success)',  dim: 'var(--success-dim)',  border: 'var(--success-border)' }
}

const cardStyle: CSSProperties = {
  background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '12px 14px',
}
const labelStyle: CSSProperties = { fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)' }

export default function SofaScore({ initialVitals }: Props) {
  const map = initialVitals ? Math.round((initialVitals.bp_systolic_mean + 2 * initialVitals.bp_diastolic_mean) / 3) : 75
  const [vals, setVals] = useState<Required<SofaInput>>({
    pao2Fio2: 350, respiratorySupport: false, platelets: 180, bilirubin: 1.0, map,
    vasopressor: 'none', gcs: 15, creatinine: 1.0, urineOutputMl: 1500,
  })
  const { total, mortalityBand, parameters } = calculateSofa(vals)
  const tk = getTotalTokens(total)

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
          <p title={SOFA_MORTALITY_NOTE} style={{ fontSize: '13px', fontWeight: 600, color: tk.color, marginTop: '6px', fontFamily: 'var(--font-body)' }}>Approx. ICU mortality: {mortalityBand}</p>
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
          {parameters.map(p => (
            <div key={p.organ} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px', width: '20px' }}>{ICONS[p.organ]}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', width: '110px', flexShrink: 0 }}>{p.label}</span>
              <div style={{ flex: 1, height: '5px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(p.score / 4) * 100}%`, background: getScoreColor(p.score), borderRadius: '3px', transition: 'width 0.5s ease', boxShadow: p.score > 0 ? `0 0 6px ${getScoreColor(p.score)}` : 'none' }} />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '150px', textAlign: 'right', fontFamily: 'var(--font-data)' }}>{p.display}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, width: '20px', textAlign: 'right', fontFamily: 'var(--font-data)', color: getScoreColor(p.score) }}>{p.score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {FIELDS.map(f => (
          <div key={f.key} style={cardStyle}>
            <label style={labelStyle}>{f.label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
              <input type="range" min={f.min} max={f.max} step={f.step}
                value={vals[f.key]}
                onChange={e => setVals(p => ({ ...p, [f.key]: parseFloat(e.target.value) }))}
                style={{ flex: 1, accentColor: 'var(--clr-primary)' }} />
              <span style={{ fontFamily: 'var(--font-data)', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', minWidth: '40px', textAlign: 'right' }}>
                {vals[f.key].toFixed(f.step < 1 ? 1 : 0)}
              </span>
            </div>
          </div>
        ))}

        {/* Respiratory support (needed for respiration scores 3 and 4) */}
        <label style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <input type="checkbox" checked={vals.respiratorySupport}
            onChange={e => setVals(p => ({ ...p, respiratorySupport: e.target.checked }))}
            style={{ accentColor: 'var(--clr-primary)' }} />
          <span style={labelStyle}>Mechanical ventilation / respiratory support</span>
        </label>

        {/* Vasopressors (doses in \u00b5g/kg/min) */}
        <div style={cardStyle}>
          <label style={labelStyle}>{'Vasopressor (\u00b5g/kg/min)'}</label>
          <select value={vals.vasopressor}
            onChange={e => setVals(p => ({ ...p, vasopressor: e.target.value as VasopressorLevel }))}
            style={{ width: '100%', marginTop: '8px', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '6px 8px', fontSize: '12px' }}>
            {VASOPRESSOR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}
