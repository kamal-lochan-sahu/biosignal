'use client'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid
} from 'recharts'

interface Props {
  data: { time: string; hr: number; spo2: number; rr: number; sbp: number }[]
}

// Custom tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const items = [
    { key: 'hr',   label: 'Heart Rate', unit: 'bpm',  color: '#ff4757' },
    { key: 'spo2', label: 'SpO₂',       unit: '%',    color: '#00ff8c' },
    { key: 'rr',   label: 'Resp Rate',  unit: '/min', color: '#00d4ff' },
    { key: 'sbp',  label: 'BP Sys',     unit: 'mmHg', color: '#ffb800' },
  ]
  return (
    <div style={{
      background:   'var(--bg-elevated, #0c1424)',
      border:       '1px solid var(--border-default, rgba(56,130,210,0.22))',
      borderRadius: '10px',
      padding:      '10px 14px',
      boxShadow:    '0 8px 24px rgba(0,0,0,0.4)',
    }}>
      <p style={{
        fontFamily:    'var(--font-data, monospace)',
        fontSize:      '10px',
        color:         'var(--text-muted, #475569)',
        marginBottom:  '8px',
        letterSpacing: '1px',
      }}>
        T + {label}
      </p>
      {items.map(({ key, label, unit, color }) => {
        const val = payload.find((p: any) => p.dataKey === key)?.value
        if (val == null) return null
        return (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary, #94a3b8)' }}>
              <span style={{ color, marginRight: '5px' }}>●</span>{label}
            </span>
            <span style={{ fontFamily: 'var(--font-data, monospace)', fontSize: '11px', fontWeight: 600, color }}>
              {val} {unit}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// Legend pill
function LegendPill({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <div style={{ width: '20px', height: '2px', background: color, borderRadius: '1px' }} />
      <span style={{ fontSize: '10px', color: 'var(--text-muted, #475569)', fontFamily: 'var(--font-data, monospace)' }}>
        {label}
      </span>
    </div>
  )
}

export default function VitalsChart({ data }: Props) {
  return (
    <div style={{
      background:   'var(--bg-card, #101b2d)',
      border:       '1px solid var(--border-subtle, rgba(56,130,210,0.10))',
      borderRadius: '14px',
      padding:      '16px 20px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* ECG icon */}
          <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
            <path d="M0 6 L3 6 L5 1 L7 11 L9 4 L10 6 L20 6"
              stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{
            fontFamily:    'var(--font-display, Outfit, sans-serif)',
            fontSize:      '13px',
            fontWeight:    600,
            color:         'var(--text-primary, #e2e8f0)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Vitals Trend
          </span>
          <span style={{
            fontSize:      '10px',
            fontFamily:    'var(--font-data, monospace)',
            color:         'var(--text-muted)',
            padding:       '2px 7px',
            borderRadius:  '100px',
            background:    'var(--primary-dim)',
            border:        '1px solid var(--primary-border)',
            color:         'var(--clr-primary)',
          }}>
            12h window
          </span>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <LegendPill color="#ff4757" label="HR" />
          <LegendPill color="#00ff8c" label="SpO₂" />
          <LegendPill color="#00d4ff" label="RR" />
          <LegendPill color="#ffb800" label="BP Sys" />
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(56,130,210,0.08)"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            tick={{ fill: '#475569', fontSize: 10, fontFamily: 'var(--font-data, monospace)' }}
            axisLine={{ stroke: 'rgba(56,130,210,0.12)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#475569', fontSize: 10, fontFamily: 'var(--font-data, monospace)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Normal range reference lines */}
          <ReferenceLine y={100} stroke="rgba(255,71,87,0.15)"  strokeDasharray="4 4" label={{ value: 'HR max', fill: '#475569', fontSize: 9 }} />
          <ReferenceLine y={95}  stroke="rgba(0,255,140,0.15)"  strokeDasharray="4 4" label={{ value: 'SpO₂ min', fill: '#475569', fontSize: 9 }} />

          <Line type="monotone" dataKey="hr"   stroke="#ff4757" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#ff4757', stroke: '#04080f', strokeWidth: 2 }} animationDuration={800} />
          <Line type="monotone" dataKey="spo2" stroke="#00ff8c" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#00ff8c', stroke: '#04080f', strokeWidth: 2 }} animationDuration={900} />
          <Line type="monotone" dataKey="rr"   stroke="#00d4ff" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#00d4ff', stroke: '#04080f', strokeWidth: 2 }} animationDuration={1000} />
          <Line type="monotone" dataKey="sbp"  stroke="#ffb800" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#ffb800', stroke: '#04080f', strokeWidth: 2 }} animationDuration={1100} />
        </LineChart>
      </ResponsiveContainer>

      {/* Footer stats */}
      <div style={{
        display:       'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap:           '8px',
        marginTop:     '14px',
        paddingTop:    '12px',
        borderTop:     '1px solid var(--border-subtle)',
      }}>
        {[
          { label: 'Heart Rate', value: data.at(-1)?.hr,   unit: 'bpm',  color: '#ff4757', min: 60,  max: 100 },
          { label: 'SpO₂',       value: data.at(-1)?.spo2, unit: '%',    color: '#00ff8c', min: 95,  max: 100 },
          { label: 'Resp Rate',  value: data.at(-1)?.rr,   unit: '/min', color: '#00d4ff', min: 12,  max: 20  },
          { label: 'BP Sys',     value: data.at(-1)?.sbp,  unit: 'mmHg', color: '#ffb800', min: 90,  max: 140 },
        ].map(({ label, value, unit, color, min, max }) => {
          const inRange = value != null && value >= min && value <= max
          return (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-data, monospace)',
                fontSize:   '15px',
                fontWeight: 600,
                color,
                lineHeight: 1,
              }}>
                {value ?? '—'}
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginLeft: '2px' }}>{unit}</span>
              </div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '3px' }}>{label}</div>
              <div style={{
                fontSize:      '8px',
                marginTop:     '2px',
                color:         inRange ? '#00ff8c' : '#ff4757',
                fontFamily:    'var(--font-data, monospace)',
              }}>
                {inRange ? '● normal' : '● out of range'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
