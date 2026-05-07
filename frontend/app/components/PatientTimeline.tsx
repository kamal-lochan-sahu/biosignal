'use client'

interface Props {
  patientName: string
  admitTime: string
  vitals?: {
    heart_rate_mean: number
    spo2_mean: number
    bp_systolic_mean: number
    respiratory_rate_mean: number
  }
}

export default function PatientTimeline({ patientName, admitTime, vitals }: Props) {
  const hr = vitals?.heart_rate_mean ?? 88
  const spo2 = vitals?.spo2_mean ?? 96
  const sbp = vitals?.bp_systolic_mean ?? 118
  const rr = vitals?.respiratory_rate_mean ?? 16

  const isHighRisk = hr > 110 || spo2 < 90 || sbp < 90 || rr > 25

  const events = isHighRisk ? [
    { time: '00:00', type: 'admission', title: 'ICU Admission', detail: `${patientName} admitted to ICU` },
    { time: '01:00', type: 'normal', title: 'Initial Assessment', detail: `HR ${hr}, BP ${sbp}/-, SpO2 ${spo2}%, RR ${rr}` },
    { time: '02:30', type: 'intervention', title: 'IV Access Established', detail: 'Central line placed, IV fluids started' },
    { time: '04:00', type: 'alert', title: 'Vitals Deteriorating', detail: `SpO2 dropped to ${Math.max(spo2 - 6, 78)}%, HR elevated ${hr}bpm` },
    { time: '05:00', type: 'alert', title: 'BioSignal HIGH RISK Alert', detail: 'ML model predicted HIGH deterioration risk — physician notified' },
    { time: '06:00', type: 'intervention', title: 'O2 Supplementation', detail: `Supplemental O2 started — SpO2 recovering to ${Math.min(spo2 + 4, 95)}%` },
    { time: '08:00', type: 'intervention', title: 'Physician Review', detail: 'Senior physician assessed — treatment plan adjusted' },
    { time: '10:00', type: 'normal', title: 'Monitoring Continued', detail: `HR ${Math.max(hr - 8, 85)}, BP improving, RR ${Math.max(rr - 4, 18)}` },
  ] : [
    { time: '00:00', type: 'admission', title: 'ICU Admission', detail: `${patientName} admitted to ICU` },
    { time: '01:30', type: 'normal', title: 'Vitals Stable', detail: `HR ${hr}, BP ${sbp}/-, SpO2 ${spo2}%, RR ${rr}` },
    { time: '03:00', type: 'intervention', title: 'IV Fluids Started', detail: '500ml NS bolus administered' },
    { time: '05:00', type: 'normal', title: 'BioSignal LOW RISK', detail: 'ML model predicted LOW deterioration risk — routine monitoring' },
    { time: '07:00', type: 'normal', title: 'Routine Check', detail: `Vitals stable — HR ${hr}, SpO2 ${spo2}%` },
    { time: '09:00', type: 'normal', title: 'Physician Round', detail: 'Patient stable — continue current management' },
    { time: '11:00', type: 'normal', title: 'Vitals Improving', detail: `HR ${Math.max(hr - 5, 70)}, BP ${Math.min(sbp + 8, 130)}/-, SpO2 ${Math.min(spo2 + 2, 99)}%` },
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
        Admission: {admitTime} • Patient: {patientName} •
        <span className={`ml-1 font-semibold ${isHighRisk ? 'text-red-400' : 'text-green-400'}`}>
          {isHighRisk ? 'HIGH RISK Timeline' : 'STABLE Timeline'}
        </span>
      </div>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-800" />
        <div className="space-y-3">
          {events.map((e, i) => (
            <div key={i} className="flex gap-4 relative">
              <div className={`w-3 h-3 rounded-full mt-3 flex-shrink-0 z-10 ml-2.5 ${dots[e.type as keyof typeof dots]}`} />
              <div className={`flex-1 border rounded-lg p-3 ${colors[e.type as keyof typeof colors]}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-xs font-bold ${labels[e.type as keyof typeof labels]}`}>{e.title}</span>
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
