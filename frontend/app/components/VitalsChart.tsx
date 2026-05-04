'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
interface Props {
  data: { time: string; hr: number; spo2: number; rr: number; sbp: number }[]
}
export default function VitalsChart({ data }: Props) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Vitals Trend</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="time" tick={{ fill: '#9ca3af', fontSize: 10 }} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
          <Legend />
          <Line type="monotone" dataKey="hr" stroke="#f87171" dot={false} name="Heart Rate" strokeWidth={2} />
          <Line type="monotone" dataKey="spo2" stroke="#34d399" dot={false} name="SpO2" strokeWidth={2} />
          <Line type="monotone" dataKey="rr" stroke="#60a5fa" dot={false} name="Resp Rate" strokeWidth={2} />
          <Line type="monotone" dataKey="sbp" stroke="#fbbf24" dot={false} name="BP Systolic" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
