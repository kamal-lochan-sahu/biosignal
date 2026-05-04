'use client'
interface Factor { feature: string; impact: number }
interface Props { factors: Factor[] }
export default function SHAPExplainer({ factors }: Props) {
  const max = Math.max(...factors.map(f => Math.abs(f.impact)))
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Risk Factors (SHAP)</h3>
      {factors.map((f, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between text-xs text-gray-300">
            <span>{f.feature.replace(/_/g, ' ')}</span>
            <span className={f.impact > 0 ? 'text-red-400' : 'text-green-400'}>
              {f.impact > 0 ? '+' : ''}{f.impact.toFixed(3)}
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className={`h-2 rounded-full transition-all duration-700 ${f.impact > 0 ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${(Math.abs(f.impact) / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
