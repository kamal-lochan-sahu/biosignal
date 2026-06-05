'use client'

interface Props {
  patientName: string; admitTime: string
  vitals?: { heart_rate_mean: number; spo2_mean: number; bp_systolic_mean: number; respiratory_rate_mean: number }
}

const TYPE_CFG = {
  alert:        { color: 'var(--clr-critical)', dim: 'var(--critical-dim)', border: 'var(--critical-border)',  dot: '#ff4757', icon: '⚠' },
  normal:       { color: 'var(--text-secondary)', dim: 'var(--bg-card)',       border: 'var(--border-subtle)',    dot: '#475569', icon: '●' },
  intervention: { color: 'var(--clr-primary)',    dim: 'var(--primary-dim)',   border: 'var(--primary-border)',   dot: '#00d4ff', icon: '⚕' },
  admission:    { color: 'var(--clr-ml)',         dim: 'var(--ml-dim)',        border: 'var(--ml-border)',        dot: '#8b5cf6', icon: '🏥' },
}

export default function PatientTimeline({ patientName, admitTime, vitals }: Props) {
  const hr = vitals?.heart_rate_mean ?? 88
  const spo2 = vitals?.spo2_mean ?? 96
  const sbp = vitals?.bp_systolic_mean ?? 118
  const rr = vitals?.respiratory_rate_mean ?? 16
  const isHighRisk = hr > 110 || spo2 < 90 || sbp < 90 || rr > 25

  const events = isHighRisk ? [
    { time: '00:00', type: 'admission',    title: 'ICU Admission',          detail: `${patientName} admitted to ICU` },
    { time: '01:00', type: 'normal',       title: 'Initial Assessment',     detail: `HR ${hr}, BP ${sbp}/—, SpO₂ ${spo2}%, RR ${rr}` },
    { time: '02:30', type: 'intervention', title: 'IV Access Established',  detail: 'Central line placed, IV fluids started' },
    { time: '04:00', type: 'alert',        title: 'Vitals Deteriorating',   detail: `SpO₂ dropped to ${Math.max(spo2-6,78)}%, HR elevated ${hr}bpm` },
    { time: '05:00', type: 'alert',        title: 'BioSignal HIGH RISK',    detail: 'ML model predicted HIGH deterioration risk — physician notified' },
    { time: '06:00', type: 'intervention', title: 'O₂ Supplementation',     detail: `Supplemental O₂ started — SpO₂ recovering to ${Math.min(spo2+4,95)}%` },
    { time: '08:00', type: 'intervention', title: 'Physician Review',       detail: 'Senior physician assessed — treatment plan adjusted' },
    { time: '10:00', type: 'normal',       title: 'Monitoring Continued',   detail: `HR ${Math.max(hr-8,85)}, BP improving, RR ${Math.max(rr-4,18)}` },
  ] : [
    { time: '00:00', type: 'admission',    title: 'ICU Admission',     detail: `${patientName} admitted to ICU` },
    { time: '01:30', type: 'normal',       title: 'Vitals Stable',     detail: `HR ${hr}, BP ${sbp}/—, SpO₂ ${spo2}%, RR ${rr}` },
    { time: '03:00', type: 'intervention', title: 'IV Fluids Started', detail: '500ml NS bolus administered' },
    { time: '05:00', type: 'normal',       title: 'BioSignal LOW RISK', detail: 'ML model predicted LOW deterioration risk — routine monitoring' },
    { time: '07:00', type: 'normal',       title: 'Routine Check',     detail: `Vitals stable — HR ${hr}, SpO₂ ${spo2}%` },
    { time: '09:00', type: 'normal',       title: 'Physician Round',   detail: 'Patient stable — continue current management' },
    { time: '11:00', type: 'normal',       title: 'Vitals Improving',  detail: `HR ${Math.max(hr-5,70)}, BP ${Math.min(sbp+8,130)}/—, SpO₂ ${Math.min(spo2+2,99)}%` },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '10px' }}>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{patientName}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)', marginTop: '2px' }}>Admitted: {admitTime}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '100px', background: isHighRisk ? 'var(--critical-dim)' : 'var(--success-dim)', border: `1px solid ${isHighRisk ? 'var(--critical-border)' : 'var(--success-border)'}` }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isHighRisk ? 'var(--clr-critical)' : 'var(--clr-success)' }} />
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-data)', fontWeight: 600, color: isHighRisk ? 'var(--clr-critical)' : 'var(--clr-success)', letterSpacing: '1px' }}>
            {isHighRisk ? 'HIGH RISK TIMELINE' : 'STABLE TIMELINE'}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative', paddingLeft: '28px' }}>
        {/* Vertical line */}
        <div style={{ position: 'absolute', left: '9px', top: 0, bottom: 0, width: '1px', background: 'var(--border-subtle)' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {events.map((e, i) => {
            const cfg = TYPE_CFG[e.type as keyof typeof TYPE_CFG]
            return (
              <div key={i} style={{ position: 'relative', display: 'flex', gap: '12px' }}>
                {/* Dot */}
                <div style={{ position: 'absolute', left: '-23px', top: '12px', width: '10px', height: '10px', borderRadius: '50%', background: cfg.dot, border: '2px solid var(--bg-base)', boxShadow: e.type === 'alert' ? `0 0 8px ${cfg.dot}` : 'none', flexShrink: 0, zIndex: 1 }} />
                {/* Card */}
                <div style={{ flex: 1, background: cfg.dim, border: `1px solid ${cfg.border}`, borderRadius: '10px', padding: '10px 14px', animation: e.type === 'alert' ? 'pulse-critical 2s ease-in-out infinite' : undefined }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: cfg.color, fontFamily: 'var(--font-display)' }}>
                        {cfg.icon} {e.title}
                      </span>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '3px', lineHeight: 1.4 }}>{e.detail}</p>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)', marginLeft: '12px', flexShrink: 0, whiteSpace: 'nowrap' }}>+{e.time}h</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
