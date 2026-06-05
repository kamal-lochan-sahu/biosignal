'use client'
import { useState } from 'react'
import { PlusCircle, MinusCircle } from 'lucide-react'

interface Entry { label: string; amount: number; type: 'input' | 'output'; time: string }
interface Props { patientName?: string }

const inputStyle = {
  background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)',
  borderRadius: '6px', padding: '6px 10px', fontSize: '12px', outline: 'none', fontFamily: 'var(--font-body)',
}

export default function FluidBalance({ patientName }: Props) {
  const [entries, setEntries] = useState<Entry[]>([
    { label: 'IV NS 0.9%',      amount: 500, type: 'input',  time: '08:00' },
    { label: 'IV Medications',  amount: 150, type: 'input',  time: '09:00' },
    { label: 'Oral Intake',     amount: 200, type: 'input',  time: '10:00' },
    { label: 'Urine Output',    amount: 350, type: 'output', time: '08:00' },
    { label: 'Drain Output',    amount: 80,  type: 'output', time: '10:00' },
  ])
  const [form, setForm] = useState({ label: '', amount: 0, type: 'input' as 'input' | 'output', time: '12:00' })

  const totalIn  = entries.filter(e => e.type === 'input').reduce((s, e) => s + e.amount, 0)
  const totalOut = entries.filter(e => e.type === 'output').reduce((s, e) => s + e.amount, 0)
  const balance  = totalIn - totalOut

  const addEntry = () => {
    if (!form.label || !form.amount) return
    setEntries(p => [...p, { ...form }])
    setForm({ label: '', amount: 0, type: 'input', time: '12:00' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {patientName && (
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)' }}>
          Patient: <span style={{ color: 'var(--text-secondary)' }}>{patientName}</span> — 24h fluid tracking
        </p>
      )}

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        {[
          { label: 'Total Input',  value: totalIn,  color: 'var(--clr-primary)', dim: 'var(--primary-dim)', border: 'var(--primary-border)', sign: '' },
          { label: 'Total Output', value: totalOut, color: 'var(--clr-warning)', dim: 'var(--warning-dim)', border: 'var(--warning-border)', sign: '' },
          { label: 'Net Balance',  value: Math.abs(balance), color: balance >= 0 ? 'var(--clr-success)' : 'var(--clr-critical)', dim: balance >= 0 ? 'var(--success-dim)' : 'var(--critical-dim)', border: balance >= 0 ? 'var(--success-border)' : 'var(--critical-border)', sign: balance >= 0 ? '+' : '-' },
        ].map(({ label, value, color, dim, border, sign }) => (
          <div key={label} style={{ background: dim, border: `1px solid ${border}`, borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
            <p style={{ fontSize: '10px', color, fontFamily: 'var(--font-data)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</p>
            <p style={{ fontFamily: 'var(--font-data)', fontSize: '28px', fontWeight: 700, color, lineHeight: 1 }}>{sign}{value}</p>
            <p style={{ fontSize: '11px', color, opacity: 0.7, marginTop: '2px', fontFamily: 'var(--font-data)' }}>mL</p>
          </div>
        ))}
      </div>

      {/* Entries */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {(['input', 'output'] as const).map(type => {
          const isInput = type === 'input'
          const color   = isInput ? 'var(--clr-primary)' : 'var(--clr-warning)'
          const dim     = isInput ? 'var(--primary-dim)' : 'var(--warning-dim)'
          return (
            <div key={type}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                {isInput ? <PlusCircle size={12} style={{ color }} /> : <MinusCircle size={12} style={{ color }} />}
                <span style={{ fontSize: '10px', color, fontFamily: 'var(--font-data)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {isInput ? 'Inputs' : 'Outputs'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {entries.filter(e => e.type === type).map((e, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: dim, border: `1px solid ${isInput ? 'var(--primary-border)' : 'var(--warning-border)'}`, borderRadius: '8px', padding: '8px 12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{e.time} — {e.label}</span>
                    <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', fontWeight: 600, color }}>{isInput ? '+' : '-'}{e.amount} mL</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Entry */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '14px 16px' }}>
        <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>Add Entry</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
            placeholder="Label (e.g. IV Fluids)" style={{ ...inputStyle, flex: 1, minWidth: '140px' }} />
          <input type="number" value={form.amount || ''} onChange={e => setForm(p => ({ ...p, amount: parseInt(e.target.value) || 0 }))}
            placeholder="mL" style={{ ...inputStyle, width: '70px' }} />
          <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
            style={{ ...inputStyle, width: '90px' }} />
          <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as 'input' | 'output' }))}
            style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="input">Input</option>
            <option value="output">Output</option>
          </select>
          <button onClick={addEntry} style={{
            background: 'var(--primary-dim)', border: '1px solid var(--primary-border)',
            color: 'var(--clr-primary)', padding: '6px 16px', borderRadius: '6px',
            fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-data)',
            transition: 'all 0.15s',
          }}>
            + Add
          </button>
        </div>
      </div>
    </div>
  )
}
