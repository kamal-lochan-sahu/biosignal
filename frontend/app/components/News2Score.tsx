'use client'
import { useState } from 'react'
import { calculateNews2, NEWS2_LABELS, type News2Level } from '@/lib/scores'

// -- Adapter: UI state -> shared, verified scoring module (lib/scores) ----------
interface News2Input {
  respiratory_rate: number; spo2: number; on_oxygen: boolean
  bp_systolic: number; heart_rate: number; temperature: number
  consciousness: 'alert' | 'confused'
}
interface ScoreBreakdown { name: string; value: string; score: number; max: number }

function calcNews2(v: News2Input): { total: number; level: News2Level; response: string; breakdown: ScoreBreakdown[] } {
  const r = calculateNews2({
    respiratoryRate: v.respiratory_rate,
    spo2: v.spo2,
    onOxygen: v.on_oxygen,
    systolicBp: v.bp_systolic,
    heartRate: v.heart_rate,
    temperature: v.temperature,
    consciousness: v.consciousness === 'alert' ? 'alert' : 'cvpu',
  })
  return {
    total: r.total,
    level: r.level,
    response: r.response,
    breakdown: r.parameters.map(p => ({ name: p.label, value: p.display, score: p.score, max: p.max })),
  }
}

type LevelColors = { color: string; dim: string; border: string }
const OK:   LevelColors = { color: 'var(--clr-success)',  dim: 'var(--success-dim)',  border: 'var(--success-border)'  }
const WARN: LevelColors = { color: 'var(--clr-warning)',  dim: 'var(--warning-dim)',  border: 'var(--warning-border)'  }
const CRIT: LevelColors = { color: 'var(--clr-critical)', dim: 'var(--critical-dim)', border: 'var(--critical-border)' }
const LEVEL_COLORS: Record<News2Level, LevelColors> = {
  NORMAL: OK, LOW: OK, LOW_MEDIUM: WARN, MEDIUM: WARN, HIGH: CRIT,
}

function getRiskLevel(level: News2Level, response: string) {
  return { label: NEWS2_LABELS[level], response, ...LEVEL_COLORS[level] }
}

function getBarColor(score: number) {
  if (score >= 3) return 'var(--clr-critical)'
  if (score >= 1) return 'var(--clr-warning)'
  return 'var(--clr-success)'
}

interface Props {
  initialVitals?: { respiratory_rate_mean: number; spo2_mean: number; bp_systolic_mean: number; heart_rate_mean: number }
}

// ── Component ─────────────────────────────────────────────────────────────
export default function News2Score({ initialVitals }: Props) {
  const [vitals, setVitals] = useState<News2Input>({
    respiratory_rate: initialVitals?.respiratory_rate_mean ?? 18,
    spo2:             initialVitals?.spo2_mean             ?? 96,
    on_oxygen:        false,
    bp_systolic:      initialVitals?.bp_systolic_mean      ?? 120,
    heart_rate:       initialVitals?.heart_rate_mean       ?? 80,
    temperature:      37.0,
    consciousness:    'alert',
  })

  const { total, breakdown, level, response } = calcNews2(vitals)
  const risk = getRiskLevel(level, response)
  const update = (key: keyof News2Input, value: number | boolean | string) =>
    setVitals(prev => ({ ...prev, [key]: value }))

  const sliders = [
    { label: 'Respiratory Rate (/min)', key: 'respiratory_rate', min: 4,  max: 60,  step: 1   },
    { label: 'SpO₂ (%)',                key: 'spo2',             min: 60, max: 100, step: 1   },
    { label: 'BP Systolic (mmHg)',      key: 'bp_systolic',      min: 60, max: 250, step: 1   },
    { label: 'Heart Rate (bpm)',        key: 'heart_rate',       min: 20, max: 200, step: 1   },
    { label: 'Temperature (°C)',        key: 'temperature',      min: 33, max: 42,  step: 0.1 },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Score Header */}
      <div style={{
        background:   risk.dim,
        border:       `1px solid ${risk.border}`,
        borderRadius: '14px',
        padding:      '20px 24px',
        display:      'flex',
        justifyContent: 'space-between',
        alignItems:   'center',
      }}>
        <div>
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
            NEWS2 Total Score
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '56px', fontWeight: 700, color: risk.color, lineHeight: 1 }}>
              {total}
            </span>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '16px', color: 'var(--text-muted)' }}>/20</span>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            marginTop: '8px', padding: '4px 12px',
            background: risk.dim, border: `1px solid ${risk.border}`,
            borderRadius: '100px',
          }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: risk.color, boxShadow: `0 0 6px ${risk.color}` }} />
            <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', fontWeight: 600, color: risk.color, letterSpacing: '1px' }}>
              {risk.label}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right', maxWidth: '200px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{risk.response}</p>
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'var(--font-data)' }}>NHS Standard Protocol</p>
        </div>
      </div>

      {/* Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {sliders.map(field => (
          <div key={field.key} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: '10px', padding: '12px 14px',
          }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)' }}>
              {field.label}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
              <input type="range" min={field.min} max={field.max} step={field.step}
                value={vitals[field.key as keyof News2Input] as number}
                onChange={e => update(field.key as keyof News2Input, parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--clr-primary)', height: '4px' }}
              />
              <span style={{
                fontFamily: 'var(--font-data)', fontSize: '14px', fontWeight: 600,
                color: 'var(--text-primary)', minWidth: '40px', textAlign: 'right',
              }}>
                {(vitals[field.key as keyof News2Input] as number).toFixed(field.step === 0.1 ? 1 : 0)}
              </span>
            </div>
          </div>
        ))}

        {/* Consciousness */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '12px 14px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)' }}>Consciousness</label>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            {(['alert', 'confused'] as const).map(v => (
              <button key={v} onClick={() => update('consciousness', v)} style={{
                flex: 1, padding: '6px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s', border: '1px solid',
                background:  vitals.consciousness === v ? (v === 'alert' ? 'var(--success-dim)' : 'var(--critical-dim)') : 'var(--bg-elevated)',
                color:       vitals.consciousness === v ? (v === 'alert' ? 'var(--clr-success)' : 'var(--clr-critical)') : 'var(--text-muted)',
                borderColor: vitals.consciousness === v ? (v === 'alert' ? 'var(--success-border)' : 'var(--critical-border)') : 'var(--border-subtle)',
              }}>
                {v === 'alert' ? '✓ Alert' : '⚠ Confused'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* O2 Toggle */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
        borderRadius: '10px', padding: '12px 16px',
      }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>On Supplemental Oxygen?</span>
        <button onClick={() => update('on_oxygen', !vitals.on_oxygen)} style={{
          padding: '6px 16px', borderRadius: '100px', fontSize: '11px', fontWeight: 700,
          cursor: 'pointer', transition: 'all 0.15s', border: '1px solid',
          background:  vitals.on_oxygen ? 'var(--primary-dim)' : 'var(--bg-elevated)',
          color:       vitals.on_oxygen ? 'var(--clr-primary)' : 'var(--text-muted)',
          borderColor: vitals.on_oxygen ? 'var(--primary-border)' : 'var(--border-subtle)',
          fontFamily:  'var(--font-data)',
        }}>
          {vitals.on_oxygen ? '● ON  +2 pts' : '○ OFF'}
        </button>
      </div>

      {/* Breakdown */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '14px 16px' }}>
        <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
          Score Breakdown
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {breakdown.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', width: '140px', flexShrink: 0 }}>{b.name}</span>
              <div style={{ flex: 1, height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${(b.score / b.max) * 100}%`,
                  background: getBarColor(b.score), borderRadius: '2px',
                  transition: 'width 0.5s cubic-bezier(0.34,1.2,0.64,1)',
                  boxShadow: b.score > 0 ? `0 0 5px ${getBarColor(b.score)}` : 'none',
                }} />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', width: '70px', textAlign: 'right', fontFamily: 'var(--font-data)' }}>{b.value}</span>
              <span style={{ fontSize: '12px', fontWeight: 700, width: '28px', textAlign: 'right', fontFamily: 'var(--font-data)', color: getBarColor(b.score) }}>
                +{b.score}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
