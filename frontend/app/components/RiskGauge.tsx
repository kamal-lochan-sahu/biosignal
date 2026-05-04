'use client'
import { getRiskColor } from '@/lib/risk-utils'
interface Props { score: number; level: string }
export default function RiskGauge({ score, level }: Props) {
  const color = getRiskColor(level)
  const pct = score * 100
  const r = 70, circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ * 0.75
  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="130" viewBox="0 0 180 130">
        <circle cx="90" cy="100" r={r} fill="none" stroke="#1f2937"
          strokeWidth="14" strokeDasharray={`${circ * 0.75} ${circ}`}
          strokeDashoffset={circ * 0.125} strokeLinecap="round" />
        <circle cx="90" cy="100" r={r} fill="none" stroke={color}
          strokeWidth="14" strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ * 0.125} strokeLinecap="round"
          style={{ transition: 'all 0.8s ease' }} />
        <text x="90" y="95" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold">
          {Math.round(pct)}%
        </text>
        <text x="90" y="118" textAnchor="middle" fill={color} fontSize="13" fontWeight="600">
          {level} RISK
        </text>
      </svg>
    </div>
  )
}
