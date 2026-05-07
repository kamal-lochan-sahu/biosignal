'use client'
import { useState } from 'react'
import { PlusCircle, MinusCircle } from 'lucide-react'

interface Entry { label: string; amount: number; type: 'input' | 'output'; time: string }
interface Props { patientName?: string }

export default function FluidBalance({ patientName }: Props) {
  const defaultEntries: Entry[] = [
    { label: 'IV NS 0.9%', amount: 500, type: 'input', time: '08:00' },
    { label: 'IV Medications', amount: 150, type: 'input', time: '09:00' },
    { label: 'Oral Intake', amount: 200, type: 'input', time: '10:00' },
    { label: 'Urine Output', amount: 350, type: 'output', time: '08:00' },
    { label: 'Drain Output', amount: 80, type: 'output', time: '10:00' },
  ]

  const [entries, setEntries] = useState<Entry[]>(defaultEntries)
  const [form, setForm] = useState({ label: '', amount: 0, type: 'input' as 'input' | 'output', time: '12:00' })

  const totalIn = entries.filter(e => e.type === 'input').reduce((s, e) => s + e.amount, 0)
  const totalOut = entries.filter(e => e.type === 'output').reduce((s, e) => s + e.amount, 0)
  const balance = totalIn - totalOut

  const addEntry = () => {
    if (!form.label || !form.amount) return
    setEntries(p => [...p, { ...form }])
    setForm({ label: '', amount: 0, type: 'input', time: '12:00' })
  }

  return (
    <div className="space-y-4">
      {patientName && (
        <p className="text-xs text-gray-500">Patient: <span className="text-gray-300 font-medium">{patientName}</span> — 24hr fluid tracking</p>
      )}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-950/50 border border-blue-800 rounded-lg p-4 text-center">
          <p className="text-xs text-blue-400 uppercase tracking-wider">Total Input</p>
          <p className="text-3xl font-bold text-blue-300 mt-1">{totalIn}</p>
          <p className="text-xs text-blue-400">mL</p>
        </div>
        <div className="bg-orange-950/50 border border-orange-800 rounded-lg p-4 text-center">
          <p className="text-xs text-orange-400 uppercase tracking-wider">Total Output</p>
          <p className="text-3xl font-bold text-orange-300 mt-1">{totalOut}</p>
          <p className="text-xs text-orange-400">mL</p>
        </div>
        <div className={`border rounded-lg p-4 text-center ${balance >= 0 ? 'bg-green-950/50 border-green-800' : 'bg-red-950/50 border-red-800'}`}>
          <p className={`text-xs uppercase tracking-wider ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>Net Balance</p>
          <p className={`text-3xl font-bold mt-1 ${balance >= 0 ? 'text-green-300' : 'text-red-300'}`}>{balance > 0 ? '+' : ''}{balance}</p>
          <p className={`text-xs ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>mL</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <PlusCircle className="w-3 h-3" /> Inputs
          </p>
          <div className="space-y-1">
            {entries.filter(e => e.type === 'input').map((e, i) => (
              <div key={i} className="flex justify-between text-xs bg-gray-900 rounded px-3 py-2">
                <span className="text-gray-300">{e.time} — {e.label}</span>
                <span className="text-blue-300 font-bold">+{e.amount}mL</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <MinusCircle className="w-3 h-3" /> Outputs
          </p>
          <div className="space-y-1">
            {entries.filter(e => e.type === 'output').map((e, i) => (
              <div key={i} className="flex justify-between text-xs bg-gray-900 rounded px-3 py-2">
                <span className="text-gray-300">{e.time} — {e.label}</span>
                <span className="text-orange-300 font-bold">-{e.amount}mL</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
        <p className="text-xs text-gray-400 mb-2">Add Entry</p>
        <div className="flex gap-2">
          <input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
            placeholder="Label (e.g. IV Fluids)"
            className="flex-1 bg-gray-800 text-white text-xs rounded px-2 py-1.5 outline-none" />
          <input type="number" value={form.amount || ''} onChange={e => setForm(p => ({ ...p, amount: parseInt(e.target.value) || 0 }))}
            placeholder="mL"
            className="w-20 bg-gray-800 text-white text-xs rounded px-2 py-1.5 outline-none" />
          <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
            className="w-24 bg-gray-800 text-white text-xs rounded px-2 py-1.5 outline-none" />
          <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as 'input' | 'output' }))}
            className="bg-gray-800 text-white text-xs rounded px-2 py-1.5 outline-none">
            <option value="input">Input</option>
            <option value="output">Output</option>
          </select>
          <button onClick={addEntry}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded transition-all">
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
