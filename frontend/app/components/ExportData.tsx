'use client'
import { Download, FileText, Table } from 'lucide-react'

interface Patient {
  id: string; name: string; age: number; unit: string
  vitals: { heart_rate_mean: number; spo2_mean: number; bp_systolic_mean: number; respiratory_rate_mean: number }
}

interface Props {
  patients: Patient[]
  results: Record<string, { risk_score: number; risk_level: string; top_factors: {feature: string; impact: number}[] }>
}

export default function ExportData({ patients, results }: Props) {
  const exportCSV = () => {
    const headers = ['Patient ID', 'Name', 'Age', 'Unit', 'HR Mean', 'SpO2 Mean', 'BP Systolic Mean', 'RR Mean', 'Risk Score', 'Risk Level', 'Top Factor']
    const rows = patients.map(p => {
      const r = results[p.id]
      return [
        p.id, p.name, p.age, p.unit,
        p.vitals.heart_rate_mean, p.vitals.spo2_mean,
        p.vitals.bp_systolic_mean, p.vitals.respiratory_rate_mean,
        r ? (r.risk_score * 100).toFixed(1) + '%' : 'N/A',
        r ? r.risk_level : 'N/A',
        r ? r.top_factors[0]?.feature || 'N/A' : 'N/A'
      ]
    })
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'biosignal-export.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const exportJSON = () => {
    const data = patients.map(p => ({ patient: p, prediction: results[p.id] || null }))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'biosignal-export.json'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <Table className="w-6 h-6 text-green-400" />
            <div>
              <p className="text-white font-semibold">Export CSV</p>
              <p className="text-xs text-gray-400">For Excel, R, SPSS analysis</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Exports patient vitals + ML predictions in comma-separated format. 
            Compatible with all statistical analysis tools.
          </p>
          <button onClick={exportCSV}
            className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 text-white font-bold py-2.5 rounded-lg text-sm transition-all">
            <Download className="w-4 h-4" /> Download CSV
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-6 h-6 text-blue-400" />
            <div>
              <p className="text-white font-semibold">Export JSON</p>
              <p className="text-xs text-gray-400">For API integration, research pipelines</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Full structured data with SHAP factors and prediction metadata.
            Ideal for research pipelines and system integration.
          </p>
          <button onClick={exportJSON}
            className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-600 text-white font-bold py-2.5 rounded-lg text-sm transition-all">
            <Download className="w-4 h-4" /> Download JSON
          </button>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Data Preview</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800">
                <th className="text-left py-2 pr-4">Patient</th>
                <th className="text-left py-2 pr-4">Unit</th>
                <th className="text-right py-2 pr-4">HR Mean</th>
                <th className="text-right py-2 pr-4">SpO2 Mean</th>
                <th className="text-right py-2 pr-4">Risk Score</th>
                <th className="text-right py-2">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => {
                const r = results[p.id]
                return (
                  <tr key={p.id} className="border-b border-gray-900 hover:bg-gray-800/50">
                    <td className="py-2 pr-4 text-white">{p.name}</td>
                    <td className="py-2 pr-4 text-gray-400">{p.unit}</td>
                    <td className="py-2 pr-4 text-right text-gray-300">{p.vitals.heart_rate_mean}</td>
                    <td className="py-2 pr-4 text-right text-gray-300">{p.vitals.spo2_mean}%</td>
                    <td className="py-2 pr-4 text-right font-bold">
                      {r ? <span className={r.risk_level === 'HIGH' ? 'text-red-400' : r.risk_level === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'}>{(r.risk_score * 100).toFixed(1)}%</span> : <span className="text-gray-600">—</span>}
                    </td>
                    <td className="py-2 text-right">
                      {r ? <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.risk_level === 'HIGH' ? 'bg-red-900 text-red-300' : r.risk_level === 'MEDIUM' ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300'}`}>{r.risk_level}</span> : <span className="text-gray-600">N/A</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
