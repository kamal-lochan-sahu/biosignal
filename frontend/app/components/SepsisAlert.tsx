'use client'
import { useState } from 'react'
import { AlertTriangle, ShieldCheck } from 'lucide-react'

// ── Types & Logic (unchanged) ─────────────────────────────────────────────
interface SepsisInput {
  suspected_infection: boolean; resp_rate: number; altered_mentation: boolean
  sbp: number; temp: number; heart_rate: number; wbc: number; lactate: number
}
interface Props {
  initialVitals?: { respiratory_rate_mean: number; bp_systolic_mean: number; heart_rate_mean: number }
}

function calcSepsis(v: SepsisInput) {
  if (!v.suspected_infection) return { level: 'none', qsofa: 0, sirs: 0 }
  let qsofa = 0
  if (v.resp_rate >= 22) qsofa++
  if (v.altered_mentation) qsofa++
  if (v.sbp <= 100) qsofa++
  let sirs = 0
  if (v.temp < 36 || v.temp > 38) sirs++
  if (v.heart_rate > 90) sirs++
  if (v.resp_rate > 20) sirs++
  if (v.wbc < 4 || v.wbc > 12) sirs++
  const sepsis      = qsofa >= 2 || sirs >= 2
  const septicShock = sepsis && v.sbp < 90 && v.lactate > 2
  return { level: septicShock ? 'shock' : qsofa >= 2 ? 'sepsis' : sirs >= 2 ? 'sirs' : 'watch', qsofa, sirs }
}

const LEVEL_CFG = {
  shock:  { label: 'SEPTIC SHOCK',         color: 'var(--clr-critical)', dim: 'var(--critical-dim)', border: 'var(--critical-border)', action: 'IMMEDIATE — ICU admission, vasopressors, cultures, broad-spectrum antibiotics', pulse: true  },
  sepsis: { label: 'SEPSIS',               color: 'var(--clr-critical)', dim: 'var(--critical-dim)', border: 'var(--critical-border)', action: 'URGENT — Blood cultures, IV antibiotics within 1hr, IV fluids',                  pulse: true  },
  sirs:   { label: 'SIRS CRITERIA MET',    color: 'var(--clr-warning)',  dim: 'var(--warning-dim)',  border: 'var(--warning-border)',  action: 'MONITOR — Investigate source of infection, repeat assessment',                    pulse: false },
  watch:  { label: 'LOW SUSPICION',        color: 'var(--clr-success)',  dim: 'var(--success-dim)',  border: 'var(--success-border)',  action: 'Continue routine monitoring',                                                     pulse: false },
  none:   { label: 'NO INFECTION SUSPECTED',color:'var(--text-secondary)',dim:'var(--bg-elevated)',  border: 'var(--border-subtle)',   action: 'No sepsis workup indicated',                                                       pulse: false },
}

// ── Component ─────────────────────────────────────────────────────────────
export default function SepsisAlert({ initialVitals }: Props) {
  const [vals, setVals] = useState<SepsisInput>({
    suspected_infection: true,
    resp_rate:     initialVitals?.respiratory_rate_mean ?? 20,
    altered_mentation: false,
    sbp:           initialVitals?.bp_systolic_mean      ?? 110,
    temp:          38.5,
    heart_rate:    initialVitals?.heart_rate_mean       ?? 95,
    wbc:           13,
    lactate:       1.5,
  })

  const { level, qsofa, sirs } = calcSepsis(vals)
  const cfg = LEVEL_CFG[level as keyof typeof LEVEL_CFG]

  const sliders = [
    { label: 'Respiratory Rate (/min)', key: 'resp_rate',  min: 8,   max: 40,  step: 1   },
    { label: 'BP Systolic (mmHg)',      key: 'sbp',        min: 60,  max: 200, step: 1   },
    { label: 'Temperature (°C)',        key: 'temp',       min: 34,  max: 41,  step: 0.1 },
    { label: 'Heart Rate (bpm)',        key: 'heart_rate', min: 40,  max: 160, step: 1   },
    { label: 'WBC (×10³/μL)',           key: 'wbc',        min: 1,   max: 30,  step: 0.5 },
    { label: 'Lactate (mmol/L)',        key: 'lactate',    min: 0.5, max: 8,   step: 0.1 },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Alert Banner */}
      <div style={{
        background:   cfg.dim,
        border:       `1px solid ${cfg.border}`,
        borderRadius: '14px',
        padding:      '18px 22px',
        animation:    cfg.pulse ? 'pulse-critical 1.5s ease-in-out infinite' : undefined,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {level === 'none' || level === 'watch'
            ? <ShieldCheck size={32} style={{ color: cfg.color, flexShrink: 0 }} />
            : <AlertTriangle size={32} style={{ color: cfg.color, flexShrink: 0 }} />
          }
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: cfg.color, letterSpacing: '-0.3px' }}>
              {cfg.label}
            </p>
            <p style={{ fontSize: '12px', color: cfg.color, opacity: 0.8, marginTop: '3px', lineHeight: 1.4 }}>
              {cfg.action}
            </p>
          </div>
        </div>

        {/* qSOFA + SIRS scores */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          {[
            { label: 'qSOFA', value: qsofa, max: 3, critical: qsofa >= 2 },
            { label: 'SIRS',  value: sirs,  max: 4, critical: sirs >= 2  },
          ].map(({ label, value, max, critical }) => (
            <div key={label} style={{
              flex: 1, textAlign: 'center',
              background: critical ? 'rgba(255,71,87,0.08)' : 'var(--bg-elevated)',
              border: `1px solid ${critical ? 'var(--critical-border)' : 'var(--border-subtle)'}`,
              borderRadius: '10px', padding: '10px',
            }}>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)', letterSpacing: '1px', marginBottom: '4px' }}>{label}</p>
              <p style={{ fontFamily: 'var(--font-data)', fontSize: '28px', fontWeight: 700, color: critical ? 'var(--clr-critical)' : 'var(--text-primary)', lineHeight: 1 }}>
                {value}<span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/{max}</span>
              </p>
              {critical && (
                <p style={{ fontSize: '9px', color: 'var(--clr-critical)', fontFamily: 'var(--font-data)', marginTop: '4px', letterSpacing: '0.5px' }}>
                  ● CRITERIA MET
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Suspected Infection Toggle */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
        borderRadius: '10px', padding: '12px 16px',
      }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Suspected Infection?</span>
        <button onClick={() => setVals(p => ({ ...p, suspected_infection: !p.suspected_infection }))} style={{
          padding: '6px 16px', borderRadius: '100px', fontSize: '11px', fontWeight: 700,
          cursor: 'pointer', transition: 'all 0.15s', border: '1px solid', fontFamily: 'var(--font-data)',
          background:  vals.suspected_infection ? 'var(--critical-dim)' : 'var(--bg-elevated)',
          color:       vals.suspected_infection ? 'var(--clr-critical)' : 'var(--text-muted)',
          borderColor: vals.suspected_infection ? 'var(--critical-border)' : 'var(--border-subtle)',
        }}>
          {vals.suspected_infection ? '● YES' : '○ NO'}
        </button>
      </div>

      {/* Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {sliders.map(f => (
          <div key={f.key} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: '10px', padding: '12px 14px',
          }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)' }}>{f.label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
              <input type="range" min={f.min} max={f.max} step={f.step}
                value={vals[f.key as keyof SepsisInput] as number}
                onChange={e => setVals(p => ({ ...p, [f.key]: parseFloat(e.target.value) }))}
                style={{ flex: 1, accentColor: 'var(--clr-critical)', height: '4px' }}
              />
              <span style={{ fontFamily: 'var(--font-data)', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', minWidth: '36px', textAlign: 'right' }}>
                {Number(vals[f.key as keyof SepsisInput]).toFixed(f.step < 1 ? 1 : 0)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Altered Mentation Toggle */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
        borderRadius: '10px', padding: '12px 16px',
      }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Altered Mentation / Confusion?</span>
        <button onClick={() => setVals(p => ({ ...p, altered_mentation: !p.altered_mentation }))} style={{
          padding: '6px 16px', borderRadius: '100px', fontSize: '11px', fontWeight: 700,
          cursor: 'pointer', transition: 'all 0.15s', border: '1px solid', fontFamily: 'var(--font-data)',
          background:  vals.altered_mentation ? 'var(--critical-dim)' : 'var(--bg-elevated)',
          color:       vals.altered_mentation ? 'var(--clr-critical)' : 'var(--text-muted)',
          borderColor: vals.altered_mentation ? 'var(--critical-border)' : 'var(--border-subtle)',
        }}>
          {vals.altered_mentation ? '● YES' : '○ NO'}
        </button>
      </div>
    </div>
  )
}
