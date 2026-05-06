'use client'

interface TimelineEvent {
  time: string
  type: 'alert' | 'normal' | 'intervention' | 'admission'
  title: string
  detail: string
}

interface Props {
  patientName: string
  admitTime: string
}

export default function PatientTimeline({ patientName, admitTime }: Props) {
  const events: TimelineEvent[] = [
    { time: '00:00', type: 'admission', title: 'ICU Admission', detail: 'Patient admitted to ICU' },
    { time: '01:30', type: 'normal', title: 'Vitals Stable', detail: 'HR 88, BP 118/72, SpO2 96%' },
    { time: '03:00', type: 'intervention', title: 'IV Fluids Started', detail: '500ml NS bolus administered' },
    { time: '05:15', type: 'alert', title: 'SpO2 Drop', detail: 'SpO2 fell to 88% — O2 supplementation started' },
    { time: '06:00', type: 'intervention', title: 'BioSignal Alert', detail: 'ML model predicted HIGH risk — physician notified' },
    { time: '07:30', type: 'normal', title: 'Stabilizing', detail: 'SpO2 recovering — 93% on 4L O2' },
    { time: '09:00', type: 'normal', title: 'Routine Check', detail: 'NEWS2 Score: 4 — Medium risk' },
    { time: '11:00', type: 'normal', title: 'Vitals Improving', detail: 'HR 82, BP 122/78, SpO2 96%' },
  ]

  const colors = {
    alert: 'border-red-500 bg-red-950/50',
    normal: 'border-gray-700 bg-gray-900',
    intervention: 'border-blue-500 bg-blue-950/50',
    admission: 'border-purple-500 bg-purple-950/50',
  }
  const dots = {
    alert: 'bg-red-500',
    normal: 'bg-gray-500',
    intervention: 'bg-blue-500',
    admission: 'bg-purple-500',
  }
  const labels = {
    alert: 'text-red-400',
    normal: 'text-gray-400',
    intervention: 'text-blue-400',
    admission: 'text-purple-400',
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-500 mb-4">
        Admission: {admitTime} • Patient: {patientName}
      </div>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-800" />
        <div className="space-y-3">
          {events.map((e, i) => (
            <div key={i} className="flex gap-4 relative">
              <div className={`w-3 h-3 rounded-full mt-3 flex-shrink-0 z-10 ml-2.5 ${dots[e.type]}`} />
              <div className={`flex-1 border rounded-lg p-3 ${colors[e.type]}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-xs font-bold ${labels[e.type]}`}>{e.title}</span>
                    <p className="text-xs text-gray-300 mt-0.5">{e.detail}</p>
                  </div>
                  <span className="text-xs text-gray-500 ml-4 flex-shrink-0">+{e.time}h</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
