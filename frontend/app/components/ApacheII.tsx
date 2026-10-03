'use client'
import { useState, type CSSProperties } from 'react'
import { calculateApache2, type Apache2Input, type ApacheAdmission } from '@/lib/scores'

interface Props {
  initialVitals?: { heart_rate_mean: number; respiratory_rate_mean: number; bp_systolic_mean: number; bp_diastolic_mean: number }
  initialAge?: number
}

type NumericKey =
  | 'temperature' | 'map' | 'heartRate' | 'respiratoryRate' | 'fio2' | 'pao2' | 'paco2' | 'ph'
  | 'sodium' | 'potassium' | 'creatinine' | 'hematocrit' | 'wbc' | 'gcs' | 'age'

const FIELDS: { label: string; key: NumericKey; min: number; max: number; step: number }[] = [
  { label: 'Temperature (\u00b0C)', key: 'temperature', min: 28, max: 42, step: 0.1 },
  { label: 'MAP (mmHg)', key: 'map', min: 40, max: 180, step: 1 },
  { label: 'Heart Rate', key: 'heartRate', min: 20, max: 200, step: 1 },
  { label: 'Resp Rate', key: 'respiratoryRate', min: 4, max: 60, step: 1 },
  { label: 'FiO\u2082 (0.21\u20131.0)', key: 'fio2', min: 0.21, max: 1, step: 0.01 },
  { label: 'PaO\u2082 (mmHg)', key: 'pao2', min: 40, max: 150, step: 1 },
  { label: 'PaCO\u2082 (mmHg)', key: 'paco2', min: 15, max: 100, step: 1 },
  { label: 'pH', key: 'ph', min: 7.0, max: 7.8, step: 0.01 },
  { label: 'Sodium (mEq/L)', key: 'sodium', min: 100, max: 190, step: 1 },
  { label: 'Potassium (mEq/L)', key: 'potassium', min: 1, max: 8, step: 0.1 },
  { label: 'Creatinine (mg/dL)', key: 'creatinine', min: 0.3, max: 6, step: 0.1 },
  { label: 'Hematocrit (%)', key: 'hematocrit', min: 10, max: 70, step: 1 },
  { label: 'WBC (\u00d710\u00b3)', key: 'wbc', min: 0.5, max: 50, step: 0.5 },
  { label: 'GCS Score', key: 'gcs', min: 3, max: 15, step: 1 },
  { label: 'Age (years)', key: 'age', min: 16, max: 90, step: 1 },
]

const ADMISSION_OPTIONS: { value: ApacheAdmission; label: string }[] = [
  { value: 'nonoperative', label: 'Non-operative' },
  { value: 'emergency_postop', label: 'Emergency post-operative' },
  { value: 'elective_postop', label: 'Elective post-operative' },
]

function getTk(total: number) {
  if (total >= 25) return { color: 'var(--clr-critical)', dim: 'var(--critical-dim)', border: 'var(--critical-border)' }
  if (total >= 8)  return { color: 'var(--clr-warning)',  dim: 'var(--warning-dim)',  border: 'var(--warning-border)' }
  return               { color: 'var(--clr-success)',  dim: 'var(--success-dim)',  border: 'var(--success-border)' }
}

const cardStyle: CSSProperties = {
  background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '10px 12px',
}
const labelStyle: CSSProperties = { fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)', display: 'block' }

export default function ApacheII({ initialVitals, initialAge }: Props) {
  const derivedMap = initialVitals ? Math.round((initialVitals.bp_systolic_mean + 2 * initialVitals.bp_diastolic_mean) / 3) : 85
  const [vals, setVals] = useState<Apache2Input>({
    temperature: 37.5, map: derivedMap,
    heartRate: initialVitals?.heart_rate_mean ?? 88,
    respiratoryRate: initialVitals?.respiratory_rate_mean ?? 18,
    fio2: 0.21, pao2: 95, paco2: 40, ph: 7.38, sodium: 138, potassium: 4.0,
    creatinine: 1.1, acuteRenalFailure: false, hematocrit: 38, wbc: 9, gcs: 15,
    age: initialAge ?? 60, chronicHealth: false, admission: 'nonoperative',
  })
  const { total, mortalityPercent, acutePhysiology, agePoints, chronicPoints } = calculateApache2(vals)
  const tk = getTk(total)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Score Header */}
      <div style={{ background: tk.dim, border: `1px solid ${tk.border}`, borderRadius: '14px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>APACHE II Score</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '56px', fontWeight: 700, color: tk.color, lineHeight: 1 }}>{total}</span>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '16px', color: 'var(--text-muted)' }}>/71</span>
          </div>
          <p title="Base logistic model (-3.517 + 0.146 x score) without the diagnostic-category weight. Educational use only." style={{ fontSize: '13px', fontWeight: 600, color: tk.color, marginTop: '6px' }}>
            Approx. predicted mortality: {Math.round(mortalityPercent)}%
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          {([['Acute Physiology', acutePhysiology], ['Age Points', agePoints], ['Chronic Points', chronicPoints]] as [string, number][]).map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)' }}>{l}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-data)', fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
        {FIELDS.map(f => (
          <div key={f.key} style={cardStyle}>
            <label style={{ ...labelStyle, marginBottom: '6px' }}>{f.label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input type="range" min={f.min} max={f.max} step={f.step}
                value={vals[f.key]}
                onChange={e => setVals(p => ({ ...p, [f.key]: parseFloat(e.target.value) }))}
                style={{ flex: 1, accentColor: 'var(--clr-primary)' }} />
              <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', minWidth: '34px', textAlign: 'right' }}>
                {vals[f.key].toFixed(f.step < 0.1 ? 2 : f.step < 1 ? 1 : 0)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Clinical context (affects creatinine and chronic health points) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
        <label style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={vals.acuteRenalFailure}
            onChange={e => setVals(p => ({ ...p, acuteRenalFailure: e.target.checked }))}
            style={{ accentColor: 'var(--clr-primary)' }} />
          <span style={{ ...labelStyle, display: 'inline' }}>Acute renal failure (doubles creatinine points)</span>
        </label>
        <label style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={vals.chronicHealth}
            onChange={e => setVals(p => ({ ...p, chronicHealth: e.target.checked }))}
            style={{ accentColor: 'var(--clr-primary)' }} />
          <span style={{ ...labelStyle, display: 'inline' }}>Severe chronic organ insufficiency or immunocompromised</span>
        </label>
        <div style={cardStyle}>
          <label style={{ ...labelStyle, marginBottom: '6px' }}>Admission type</label>
          <select value={vals.admission}
            onChange={e => setVals(p => ({ ...p, admission: e.target.value as ApacheAdmission }))}
            style={{ width: '100%', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '6px 8px', fontSize: '12px' }}>
            {ADMISSION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}
