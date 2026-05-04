'use client'
import { AlertTriangle } from 'lucide-react'
interface Props { alerts: { name: string; score: number; unit: string }[] }
export default function AlertPanel({ alerts }: Props) {
  if (alerts.length === 0) return null
  return (
    <div className="bg-red-950/50 border border-red-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="text-red-400 w-4 h-4" />
        <h3 className="text-red-400 font-semibold text-sm">HIGH RISK ALERTS</h3>
      </div>
      <div className="space-y-2">
        {alerts.map((a, i) => (
          <div key={i} className="flex justify-between text-xs">
            <span className="text-white">{a.name} — {a.unit}</span>
            <span className="text-red-400 font-bold">{Math.round(a.score * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
