'use client'
import { getRiskColor } from '@/lib/risk-utils'
interface Props { score: number; level: string }
function getRiskTokens(level: string) {
  switch(level?.toUpperCase()) {
    case 'HIGH':   return { color:'var(--clr-critical)', dim:'var(--critical-dim)', border:'var(--critical-border)', glow:'rgba(255,71,87,0.35)',  label:'HIGH RISK' }
    case 'MEDIUM': return { color:'var(--clr-warning)',  dim:'var(--warning-dim)',  border:'var(--warning-border)',  glow:'rgba(255,184,0,0.30)',  label:'MEDIUM RISK' }
    case 'LOW':    return { color:'var(--clr-success)',  dim:'var(--success-dim)',  border:'var(--success-border)',  glow:'rgba(0,255,140,0.25)',  label:'LOW RISK' }
    default:       return { color:'var(--clr-primary)',  dim:'var(--primary-dim)',  border:'var(--primary-border)',  glow:'rgba(0,212,255,0.25)',  label:'ANALYZING' }
  }
}
export default function RiskGauge({ score, level }: Props) {
  const tk   = getRiskTokens(level)
  const pct  = score * 100
  const r    = 60
  const circ = 2 * Math.PI * r
  const arcLen = circ * 0.75
  const filled = (pct / 100) * arcLen
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}>
      {/* SVG Gauge — taller viewBox to prevent clipping */}
      <div style={{ position:'relative' }}>
        <div style={{
          position:'absolute', top:'50%', left:'50%',
          transform:'translate(-50%,-50%)',
          width:'100px', height:'100px', borderRadius:'50%',
          background: tk.glow, filter:'blur(20px)', opacity:0.5, pointerEvents:'none',
        }}/>
        <svg width="180" height="160" viewBox="0 0 180 160" style={{ overflow:'visible' }}>
          <defs>
            <filter id="glow-rg">
              <feGaussianBlur stdDeviation="2.5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          {/* Tick marks */}
          {[0,25,50,75,100].map(tick => {
            const angle = -225 + (tick/100)*270
            const rad = (angle * Math.PI) / 180
            const x1 = 90 + (r-14)*Math.cos(rad), y1 = 100 + (r-14)*Math.sin(rad)
            const x2 = 90 + (r-20)*Math.cos(rad), y2 = 100 + (r-20)*Math.sin(rad)
            return <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(56,130,210,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
          })}
          {/* Background arc */}
          <circle cx="90" cy="100" r={r} fill="none"
            stroke="rgba(56,130,210,0.12)" strokeWidth="11"
            strokeDasharray={`${arcLen} ${circ}`}
            strokeDashoffset={circ * 0.125}
            strokeLinecap="round"/>
          {/* Filled arc */}
          <circle cx="90" cy="100" r={r} fill="none"
            stroke={tk.color} strokeWidth="11"
            strokeDasharray={`${filled} ${circ - filled}`}
            strokeDashoffset={circ * 0.125}
            strokeLinecap="round"
            filter="url(#glow-rg)"
            style={{ transition:'stroke-dasharray 0.9s cubic-bezier(0.34,1.2,0.64,1)' }}/>
          {/* Percentage — above center */}
          <text x="90" y="92" textAnchor="middle"
            fill={tk.color} fontSize="30" fontWeight="700"
            fontFamily="var(--font-data,'IBM Plex Mono',monospace)">
            {Math.round(pct)}%
          </text>
          {/* Sub label — below percentage, small */}
          <text x="90" y="112" textAnchor="middle"
            fill="var(--text-muted,#475569)" fontSize="9"
            fontFamily="var(--font-data,'IBM Plex Mono',monospace)"
            letterSpacing="1">
            DETERIORATION RISK
          </text>
        </svg>
      </div>
      {/* Risk badge — SEPARATE from SVG, no overlap */}
      <div style={{
        display:'flex', alignItems:'center', gap:'7px',
        padding:'5px 14px', borderRadius:'100px',
        background: tk.dim, border:`1px solid ${tk.border}`,
        animation: level?.toUpperCase()==='HIGH' ? 'pulse-critical 1.5s ease-in-out infinite' : undefined,
      }}>
        <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:tk.color, boxShadow:`0 0 6px ${tk.color}` }}/>
        <span style={{ fontFamily:'var(--font-data,monospace)', fontSize:'11px', fontWeight:600, color:tk.color, letterSpacing:'1.5px' }}>
          {tk.label}
        </span>
      </div>
      {/* Progress bar */}
      <div style={{ width:'150px', height:'3px', background:'rgba(56,130,210,0.10)', borderRadius:'2px', overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:tk.color, borderRadius:'2px',
          boxShadow:`0 0 8px ${tk.color}`, transition:'width 0.9s ease' }}/>
      </div>
      <p style={{ fontSize:'10px', fontFamily:'var(--font-data)', color:'var(--text-muted)', marginTop:'-4px' }}>
        Next 6h prediction window
      </p>
    </div>
  )
}
