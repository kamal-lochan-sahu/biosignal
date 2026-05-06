'use client'

interface Patient {
  id: string
  name: string
  age: number
  unit: string
  risk_score?: number
  risk_level?: string
}

interface Props {
  patients: Patient[]
  results: Record<string, { risk_score: number; risk_level: string }>
  onSelect: (id: string) => void
}

export default function PatientHeatmap({ patients, results, onSelect }: Props) {
  const getRiskColor = (score?: number) => {
    if (!score) return 'bg-gray-800 border-gray-700'
    if (score >= 0.7) return 'bg-red-900 border-red-600'
    if (score >= 0.4) return 'bg-yellow-900 border-yellow-600'
    return 'bg-green-900 border-green-600'
  }

  const getTextColor = (score?: number) => {
    if (!score) return 'text-gray-500'
    if (score >= 0.7) return 'text-red-300'
    if (score >= 0.4) return 'text-yellow-300'
    return 'text-green-300'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span>Risk Legend:</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-700 inline-block"/>Low (&lt;40%)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-700 inline-block"/>Medium (40-70%)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-700 inline-block"/>High (&gt;70%)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-700 inline-block"/>Not assessed</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {patients.map(p => {
          const result = results[p.id]
          const score = result?.risk_score
          return (
            <div key={p.id} onClick={() => onSelect(p.id)}
              className={`border rounded-xl p-4 cursor-pointer transition-all hover:scale-105 ${getRiskColor(score)}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-white text-sm">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.age}y • {p.unit}</p>
                </div>
                <span className={`text-2xl font-black ${getTextColor(score)}`}>
                  {score ? `${Math.round(score * 100)}%` : '—'}
                </span>
              </div>
              <div className="w-full bg-black/30 rounded-full h-2 mt-2">
                <div className={`h-2 rounded-full transition-all duration-700 ${score && score >= 0.7 ? 'bg-red-400' : score && score >= 0.4 ? 'bg-yellow-400' : 'bg-green-400'}`}
                  style={{ width: score ? `${score * 100}%` : '0%' }} />
              </div>
              {result && (
                <p className={`text-xs font-bold mt-2 ${getTextColor(score)}`}>
                  {result.risk_level} RISK — Deterioration next 6h
                </p>
              )}
              {!result && <p className="text-xs text-gray-600 mt-2">Click ML Dashboard → Predict Risk</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
