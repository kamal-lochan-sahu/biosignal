'use client'
import { getRiskText } from '@/lib/risk-utils'
interface Props {
  patient: { id: string; name: string; age: number; unit: string; risk_level?: string; risk_score?: number }
  selected: boolean
  onClick: () => void
}
export default function PatientCard({ patient, selected, onClick }: Props) {
  return (
    <div onClick={onClick} className={`p-3 rounded-lg border cursor-pointer transition-all ${
      selected ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700 bg-gray-900 hover:border-gray-500'}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-white text-sm">{patient.name}</p>
          <p className="text-xs text-gray-400">{patient.age}y • {patient.unit}</p>
        </div>
        {patient.risk_level && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full bg-gray-800 ${getRiskText(patient.risk_level)}`}>
            {Math.round((patient.risk_score || 0) * 100)}%
          </span>
        )}
      </div>
    </div>
  )
}
