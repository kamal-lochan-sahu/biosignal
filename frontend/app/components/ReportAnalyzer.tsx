'use client'
import { useState, useRef } from 'react'
import { Upload, FileText, Activity, AlertTriangle, CheckCircle, Loader, Download } from 'lucide-react'
import { predictRisk } from '@/lib/api'

interface VitalsData {
  heart_rate: number; spo2: number; bp_systolic: number; bp_diastolic: number
  respiratory_rate: number; temperature: number; age: number; name: string
  gcs?: number; wbc?: number; platelets?: number; creatinine?: number
  bilirubin?: number; lactate?: number
}

interface ClinicalScores {
  news2: number; news2_risk: string
  qsofa: number; sepsis_risk: string
  map: number; map_status: string
  issues: string[]
}

interface AnalysisResult {
  risk_score: number; risk_level: string
  top_factors: { feature: string; impact: number }[]
  explanation: string
  clinical: ClinicalScores
}

// ── Clinical Score Calculators ─────────────────────────────────────────────
function calcNEWS2(v: VitalsData): { score: number; risk: string } {
  let rr = 0
  if (v.respiratory_rate < 12) rr = 3
  else if (v.respiratory_rate <= 20) rr = 0
  else if (v.respiratory_rate <= 24) rr = 2
  else rr = 3

  let spo2 = 0
  if (v.spo2 <= 83) spo2 = 3
  else if (v.spo2 <= 85) spo2 = 2
  else if (v.spo2 <= 87) spo2 = 1
  else if (v.spo2 <= 92) spo2 = 0
  else if (v.spo2 <= 94) spo2 = 0
  else if (v.spo2 <= 96) spo2 = 0

  let sbp = 0
  if (v.bp_systolic <= 90) sbp = 3
  else if (v.bp_systolic <= 100) sbp = 2
  else if (v.bp_systolic <= 110) sbp = 1
  else if (v.bp_systolic <= 219) sbp = 0
  else sbp = 3

  let hr = 0
  if (v.heart_rate <= 40) hr = 3
  else if (v.heart_rate <= 50) hr = 1
  else if (v.heart_rate <= 90) hr = 0
  else if (v.heart_rate <= 110) hr = 1
  else if (v.heart_rate <= 130) hr = 2
  else hr = 3

  let temp = 0
  if (v.temperature <= 35.0) temp = 3
  else if (v.temperature <= 36.0) temp = 1
  else if (v.temperature <= 38.0) temp = 0
  else if (v.temperature <= 39.0) temp = 1
  else temp = 2

  const total = rr + spo2 + sbp + hr + temp
  const risk = total >= 7 ? 'HIGH' : total >= 5 ? 'MEDIUM' : total >= 1 ? 'LOW' : 'NORMAL'
  return { score: total, risk }
}

function calcQSOFA(v: VitalsData): { score: number; risk: string } {
  let score = 0
  if (v.respiratory_rate >= 22) score++
  if (v.bp_systolic <= 100) score++
  if ((v.gcs ?? 15) < 15) score++
  return { score, risk: score >= 2 ? 'SEPSIS RISK' : score === 1 ? 'WATCH' : 'LOW' }
}

function calcMAP(sbp: number, dbp: number): { map: number; status: string } {
  const map = Math.round((sbp + 2 * dbp) / 3)
  const status = map < 65 ? 'CRITICAL' : map < 70 ? 'LOW' : map < 100 ? 'NORMAL' : 'ELEVATED'
  return { map, status }
}

function calcClinical(v: VitalsData): ClinicalScores {
  const news2 = calcNEWS2(v)
  const qsofa = calcQSOFA(v)
  const mapCalc = calcMAP(v.bp_systolic, v.bp_diastolic)
  const issues: string[] = []
  if (v.heart_rate > 100) issues.push(`Tachycardia: ${v.heart_rate} bpm`)
  if (v.heart_rate < 50)  issues.push(`Bradycardia: ${v.heart_rate} bpm`)
  if (v.spo2 < 95)        issues.push(`Hypoxemia: SpO₂ ${v.spo2}%`)
  if (v.bp_systolic < 90) issues.push(`Hypotension: BP ${v.bp_systolic}/${v.bp_diastolic}`)
  if (v.respiratory_rate > 20) issues.push(`Tachypnea: RR ${v.respiratory_rate}/min`)
  if (v.temperature > 38.3)    issues.push(`Fever: ${v.temperature}°C`)
  if (v.temperature < 36)      issues.push(`Hypothermia: ${v.temperature}°C`)
  if (mapCalc.map < 65)        issues.push(`Low MAP: ${mapCalc.map} mmHg`)
  return {
    news2: news2.score, news2_risk: news2.risk,
    qsofa: qsofa.score, sepsis_risk: qsofa.risk,
    map: mapCalc.map, map_status: mapCalc.status,
    issues,
  }
}

function generateExplanation(v: VitalsData, result: any, clinical: ClinicalScores): string {
  const pct = Math.round(result.risk_score * 100)
  const topFactor = result.top_factors[0]?.feature?.replace(/_/g, ' ') || 'vital signs'
  const issueText = clinical.issues.length > 0
    ? 'Concerning signs: ' + clinical.issues.join('; ') + '.'
    : 'Most vital signs are within acceptable range.'
  if (result.risk_level === 'HIGH')
    return `⚠️ HIGH RISK — ${pct}% deterioration risk next 6h.\n\n${issueText}\n\nMost critical factor: ${topFactor}.\nNEWS2: ${clinical.news2} (${clinical.news2_risk}) | qSOFA: ${clinical.qsofa}/3 (${clinical.sepsis_risk}) | MAP: ${clinical.map} mmHg\n\nImmediate medical attention required.`
  if (result.risk_level === 'MEDIUM')
    return `⚡ MEDIUM RISK — ${pct}% deterioration risk next 6h.\n\n${issueText}\n\nKey factor: ${topFactor}.\nNEWS2: ${clinical.news2} (${clinical.news2_risk}) | qSOFA: ${clinical.qsofa}/3 | MAP: ${clinical.map} mmHg\n\nIncrease monitoring frequency.`
  return `✅ LOW RISK — ${pct}% deterioration risk next 6h.\n\n${issueText}\n\nNEWS2: ${clinical.news2} (${clinical.news2_risk}) | qSOFA: ${clinical.qsofa}/3 | MAP: ${clinical.map} mmHg\n\nContinue routine monitoring.`
}

function parseCSVVitals(csv: string): VitalsData | null {
  try {
    const lines = csv.trim().split('\n'), data: Record<string, number | string> = {}
    const mappings: Record<string, string> = {
      'heart rate':'heart_rate','hr':'heart_rate','pulse':'heart_rate',
      'spo2':'spo2','oxygen saturation':'spo2','o2 sat':'spo2',
      'bp systolic':'bp_systolic','sbp':'bp_systolic','systolic':'bp_systolic',
      'bp diastolic':'bp_diastolic','dbp':'bp_diastolic','diastolic':'bp_diastolic',
      'respiratory rate':'respiratory_rate','rr':'respiratory_rate',
      'temperature':'temperature','temp':'temperature',
      'age':'age','name':'name','patient':'name',
      'gcs':'gcs','wbc':'wbc','platelets':'platelets',
      'creatinine':'creatinine','bilirubin':'bilirubin','lactate':'lactate',
    }
    for (const line of lines) {
      const parts = line.split(','); if (parts.length < 2) continue
      const key = parts[0].trim().toLowerCase(), value = parts.slice(1).join(',').trim()
      const mapped = mappings[key]; if (mapped) data[mapped] = mapped === 'name' ? value : parseFloat(value)
    }
    return {
      heart_rate: (data.heart_rate as number) || 80, spo2: (data.spo2 as number) || 96,
      bp_systolic: (data.bp_systolic as number) || 120, bp_diastolic: (data.bp_diastolic as number) || 75,
      respiratory_rate: (data.respiratory_rate as number) || 16, temperature: (data.temperature as number) || 37.0,
      age: (data.age as number) || 50, name: (data.name as string) || 'Patient',
      gcs: (data.gcs as number) || 15, wbc: data.wbc as number,
      platelets: data.platelets as number, creatinine: data.creatinine as number,
    }
  } catch { return null }
}

const SAMPLE_CSV = `name, John Patient\nage, 62\nheart rate, 118\nspo2, 87\nbp systolic, 82\nbp diastolic, 52\nrespiratory rate, 28\ntemperature, 38.8\ngcs, 14`

const inp = {
  background:'var(--bg-elevated)', color:'var(--text-primary)',
  border:'1px solid var(--border-default)', borderRadius:'8px',
  padding:'8px 12px', fontSize:'13px', outline:'none', width:'100%',
  fontFamily:'var(--font-body)', transition:'border-color 0.15s',
}

function getRiskTokens(level?: string) {
  if (level === 'HIGH')   return { color:'var(--clr-critical)', dim:'var(--critical-dim)', border:'var(--critical-border)', pulse:true }
  if (level === 'MEDIUM') return { color:'var(--clr-warning)',  dim:'var(--warning-dim)',  border:'var(--warning-border)',  pulse:false }
  return                         { color:'var(--clr-success)',  dim:'var(--success-dim)',  border:'var(--success-border)',  pulse:false }
}

function ScoreCard({ label, value, max, risk, color }: { label:string; value:number; max:string; risk:string; color:string }) {
  return (
    <div style={{ background:'var(--bg-elevated)', border:`1px solid ${color === 'var(--clr-critical)' ? 'var(--critical-border)' : color === 'var(--clr-warning)' ? 'var(--warning-border)' : 'var(--success-border)'}`, borderRadius:'10px', padding:'12px 14px', textAlign:'center' }}>
      <p style={{ fontSize:'10px', color:'var(--text-muted)', fontFamily:'var(--font-data)', letterSpacing:'1px', marginBottom:'4px' }}>{label}</p>
      <p style={{ fontFamily:'var(--font-data)', fontSize:'24px', fontWeight:700, color, lineHeight:1 }}>{value}<span style={{ fontSize:'12px', color:'var(--text-muted)' }}>{max}</span></p>
      <p style={{ fontSize:'10px', color, fontFamily:'var(--font-data)', marginTop:'4px', fontWeight:600 }}>{risk}</p>
    </div>
  )
}

export default function ReportAnalyzer() {
  const [mode, setMode] = useState<'manual'|'csv'>('manual')
  const [csvText, setCsvText] = useState('')
  const [vitals, setVitals] = useState<VitalsData>({
    name:'Test Patient', age:60, heart_rate:95, spo2:94,
    bp_systolic:105, bp_diastolic:65, respiratory_rate:22, temperature:37.8, gcs:15,
  })
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [parseSuccess, setParseSuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string; setCsvText(text)
      const parsed = parseCSVVitals(text)
      if (parsed) { setVitals(parsed); setParseSuccess(true) }
    }
    reader.readAsText(file)
  }

  const handleCSVParse = () => {
    const parsed = parseCSVVitals(csvText)
    if (parsed) { setVitals(parsed); setParseSuccess(true); setError('') }
    else setError('Could not parse — check format')
  }

  const handleAnalyze = async () => {
    setLoading(true); setError(''); setResult(null)
    try {
      const s = (v: number) => v * 0.05
      const apiInput = {
        heart_rate_mean: vitals.heart_rate, heart_rate_std: s(vitals.heart_rate),
        heart_rate_min: vitals.heart_rate - s(vitals.heart_rate)*2, heart_rate_max: vitals.heart_rate + s(vitals.heart_rate)*2,
        spo2_mean: vitals.spo2, spo2_std: s(vitals.spo2),
        spo2_min: Math.max(vitals.spo2 - 3, 50), spo2_max: Math.min(vitals.spo2 + 2, 100),
        bp_systolic_mean: vitals.bp_systolic, bp_systolic_std: s(vitals.bp_systolic),
        bp_systolic_min: vitals.bp_systolic - s(vitals.bp_systolic)*2, bp_systolic_max: vitals.bp_systolic + s(vitals.bp_systolic)*2,
        bp_diastolic_mean: vitals.bp_diastolic, bp_diastolic_std: s(vitals.bp_diastolic),
        bp_diastolic_min: vitals.bp_diastolic - s(vitals.bp_diastolic)*2, bp_diastolic_max: vitals.bp_diastolic + s(vitals.bp_diastolic)*2,
        respiratory_rate_mean: vitals.respiratory_rate, respiratory_rate_std: s(vitals.respiratory_rate),
        respiratory_rate_min: Math.max(vitals.respiratory_rate - 3, 4), respiratory_rate_max: vitals.respiratory_rate + 3,
      }
      const mlResult = await predictRisk(apiInput)
      const clinical = calcClinical(vitals)
      const explanation = generateExplanation(vitals, mlResult, clinical)
      setResult({ ...mlResult, explanation, clinical })
    } catch { setError('Analysis failed — make sure backend is running on port 8000') }
    setLoading(false)
  }

  const handleExportReport = () => {
    if (!result) return
    const clinical = result.clinical
    const ts = new Date().toLocaleString('en-IN')
    let text = `BIOSIGNAL COMPREHENSIVE PATIENT REPORT\n${'='.repeat(50)}\n`
    text += `Patient: ${vitals.name} | Age: ${vitals.age}y\nGenerated: ${ts}\n\n`
    text += `ML RISK PREDICTION\n${'-'.repeat(30)}\n`
    text += `Risk Score: ${Math.round(result.risk_score*100)}%\n`
    text += `Risk Level: ${result.risk_level}\n`
    text += `Prediction Window: Next 6 hours\n\n`
    text += `CLINICAL SCORES\n${'-'.repeat(30)}\n`
    text += `NEWS2 Score:  ${clinical.news2}/20  → ${clinical.news2_risk}\n`
    text += `qSOFA Score:  ${clinical.qsofa}/3   → ${clinical.sepsis_risk}\n`
    text += `MAP:          ${clinical.map} mmHg  → ${clinical.map_status}\n\n`
    text += `VITAL SIGNS\n${'-'.repeat(30)}\n`
    text += `Heart Rate:       ${vitals.heart_rate} bpm\n`
    text += `SpO2:             ${vitals.spo2}%\n`
    text += `BP:               ${vitals.bp_systolic}/${vitals.bp_diastolic} mmHg\n`
    text += `Respiratory Rate: ${vitals.respiratory_rate}/min\n`
    text += `Temperature:      ${vitals.temperature}°C\n`
    text += `GCS:              ${vitals.gcs ?? 15}\n\n`
    if (clinical.issues.length > 0) {
      text += `CLINICAL ALERTS\n${'-'.repeat(30)}\n`
      clinical.issues.forEach(i => { text += `• ${i}\n` })
      text += '\n'
    }
    text += `TOP ML RISK FACTORS\n${'-'.repeat(30)}\n`
    result.top_factors.forEach((f, i) => {
      text += `${i+1}. ${f.feature.replace(/_/g,' ')}: ${f.impact > 0 ? '+' : ''}${f.impact.toFixed(3)}\n`
    })
    text += `\nCLINICAL EXPLANATION\n${'-'.repeat(30)}\n${result.explanation}\n\n`
    text += `DISCLAIMER: Demo only. Not for clinical use.\n`
    const blob = new Blob([text], { type:'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `biosignal-report-${vitals.name.replace(/\s+/g,'-')}.txt`
    a.click(); URL.revokeObjectURL(url)
  }

  const tk = getRiskTokens(result?.risk_level)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

      {/* Header */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:'14px', padding:'16px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px' }}>
          <Activity size={18} style={{ color:'var(--clr-primary)' }}/>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'15px', fontWeight:700, color:'var(--text-primary)' }}>
            Patient Report Analyzer
          </h3>
          <span style={{ marginLeft:'auto', fontSize:'10px', background:'var(--success-dim)', color:'var(--clr-success)', border:'1px solid var(--success-border)', padding:'2px 8px', borderRadius:'100px', fontFamily:'var(--font-data)' }}>
            Free — No API Cost
          </span>
        </div>
        <p style={{ fontSize:'12px', color:'var(--text-secondary)', lineHeight:1.5 }}>
          Enter patient vitals → Get ML risk + NEWS2 + qSOFA + MAP + comprehensive report
        </p>
      </div>

      {/* Mode Toggle */}
      <div style={{ display:'flex', gap:'8px' }}>
        {(['manual','csv'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            display:'flex', alignItems:'center', gap:'8px', padding:'8px 16px', borderRadius:'8px',
            fontSize:'13px', fontWeight:500, cursor:'pointer', transition:'all 0.15s', border:'1px solid',
            background: mode===m ? 'var(--primary-dim)' : 'var(--bg-card)',
            color:       mode===m ? 'var(--clr-primary)' : 'var(--text-secondary)',
            borderColor: mode===m ? 'var(--primary-border)' : 'var(--border-subtle)',
          }}>
            {m==='manual' ? <><FileText size={14}/>Manual Entry</> : <><Upload size={14}/>CSV Upload</>}
          </button>
        ))}
      </div>

      {/* Manual Entry */}
      {mode==='manual' && (
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:'14px', padding:'20px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'16px' }}>
            <div>
              <label style={{ fontSize:'11px', color:'var(--text-muted)', fontFamily:'var(--font-data)', display:'block', marginBottom:'6px' }}>Patient Name</label>
              <input value={vitals.name} onChange={e => setVitals(p => ({ ...p, name: e.target.value }))} style={inp}/>
            </div>
            <div>
              <label style={{ fontSize:'11px', color:'var(--text-muted)', fontFamily:'var(--font-data)', display:'block', marginBottom:'6px' }}>Age (years)</label>
              <input type="number" value={vitals.age} onChange={e => setVitals(p => ({ ...p, age: parseInt(e.target.value)||0 }))} style={inp}/>
            </div>
          </div>
          {/* Vitals grid - 2 cols on mobile */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'10px', marginBottom:'12px' }}>
            {[
              { label:'Heart Rate (bpm)',        key:'heart_rate',        normal:'60-100' },
              { label:'SpO₂ (%)',                key:'spo2',              normal:'95-100' },
              { label:'BP Systolic (mmHg)',       key:'bp_systolic',       normal:'90-140' },
              { label:'BP Diastolic (mmHg)',      key:'bp_diastolic',      normal:'60-90' },
              { label:'Respiratory Rate (/min)',  key:'respiratory_rate',  normal:'12-20' },
              { label:'Temperature (°C)',         key:'temperature',       normal:'36-38' },
            ].map(f => (
              <div key={f.key} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-subtle)', borderRadius:'10px', padding:'10px 12px' }}>
                <label style={{ fontSize:'10px', color:'var(--text-muted)', fontFamily:'var(--font-data)', display:'block', marginBottom:'4px' }}>{f.label}</label>
                <input type="number" step="0.1"
                  value={vitals[f.key as keyof VitalsData] as number}
                  onChange={e => setVitals(p => ({ ...p, [f.key]: parseFloat(e.target.value)||0 }))}
                  style={{ ...inp, fontSize:'18px', fontWeight:700, fontFamily:'var(--font-data)', color:'var(--clr-primary)', padding:'4px 6px', background:'transparent', border:'none', borderBottom:'1px solid var(--border-default)', width:'100%' }}/>
                <p style={{ fontSize:'10px', color:'var(--text-muted)', marginTop:'3px', fontFamily:'var(--font-data)' }}>Normal: {f.normal}</p>
              </div>
            ))}
          </div>
          {/* GCS */}
          <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-subtle)', borderRadius:'10px', padding:'10px 12px' }}>
            <label style={{ fontSize:'10px', color:'var(--text-muted)', fontFamily:'var(--font-data)', display:'block', marginBottom:'6px' }}>GCS Score (3-15)</label>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <input type="range" min={3} max={15} step={1}
                value={vitals.gcs ?? 15}
                onChange={e => setVitals(p => ({ ...p, gcs: parseInt(e.target.value) }))}
                style={{ flex:1, accentColor:'var(--clr-primary)' }}/>
              <span style={{ fontFamily:'var(--font-data)', fontSize:'16px', fontWeight:600, color: (vitals.gcs ?? 15) < 13 ? 'var(--clr-critical)' : 'var(--text-primary)', minWidth:'28px', textAlign:'right' }}>
                {vitals.gcs ?? 15}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CSV Upload */}
      {mode==='csv' && (
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:'14px', padding:'20px', display:'flex', flexDirection:'column', gap:'12px' }}>
          <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFileUpload} style={{ display:'none' }}/>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            <button onClick={() => fileRef.current?.click()} style={{ display:'flex', alignItems:'center', gap:'8px', background:'var(--bg-elevated)', border:'1px solid var(--border-default)', color:'var(--text-secondary)', fontSize:'13px', padding:'8px 16px', borderRadius:'8px', cursor:'pointer' }}>
              <Upload size={14}/> Choose CSV File
            </button>
            <button onClick={() => { setCsvText(SAMPLE_CSV); setParseSuccess(false) }} style={{ fontSize:'12px', color:'var(--clr-primary)', padding:'8px 12px', background:'var(--primary-dim)', border:'1px solid var(--primary-border)', borderRadius:'8px', cursor:'pointer', fontFamily:'var(--font-data)' }}>
              Load Sample
            </button>
          </div>
          <textarea value={csvText} onChange={e => { setCsvText(e.target.value); setParseSuccess(false) }}
            placeholder={`name, Patient Name\nage, 65\nheart rate, 110\nspo2, 91\nbp systolic, 85\nbp diastolic, 55\nrespiratory rate, 26\ntemperature, 38.9\ngcs, 14`}
            rows={9}
            style={{ ...inp, fontSize:'12px', fontFamily:'var(--font-data)', resize:'none', lineHeight:1.7 }}/>
          <button onClick={handleCSVParse} style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-default)', color:'var(--text-secondary)', fontSize:'12px', fontWeight:600, padding:'8px 16px', borderRadius:'8px', cursor:'pointer', alignSelf:'flex-start' }}>
            Parse Data
          </button>
          {parseSuccess && (
            <div style={{ background:'var(--success-dim)', border:'1px solid var(--success-border)', borderRadius:'10px', padding:'12px 16px' }}>
              <p style={{ fontSize:'12px', color:'var(--clr-success)', fontWeight:600, marginBottom:'8px', fontFamily:'var(--font-data)' }}>✓ Parsed — {vitals.name}, Age {vitals.age}</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'4px' }}>
                {[`HR: ${vitals.heart_rate}`, `SpO₂: ${vitals.spo2}%`, `BP: ${vitals.bp_systolic}/${vitals.bp_diastolic}`, `RR: ${vitals.respiratory_rate}`, `Temp: ${vitals.temperature}°C`, `GCS: ${vitals.gcs ?? 15}`].map(s => (
                  <span key={s} style={{ fontSize:'11px', color:'var(--text-secondary)', fontFamily:'var(--font-data)' }}>{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {error && <div style={{ background:'var(--critical-dim)', border:'1px solid var(--critical-border)', borderRadius:'10px', padding:'12px 16px', color:'var(--clr-critical)', fontSize:'13px' }}>{error}</div>}

      {/* Analyze Button */}
      <button onClick={handleAnalyze} disabled={loading} style={{
        width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px',
        background: loading ? 'var(--bg-elevated)' : 'var(--primary-dim)',
        border: `1px solid ${loading ? 'var(--border-subtle)' : 'var(--primary-border)'}`,
        color: loading ? 'var(--text-muted)' : 'var(--clr-primary)',
        fontFamily:'var(--font-display)', fontSize:'14px', fontWeight:700,
        padding:'14px', borderRadius:'12px', cursor: loading ? 'not-allowed' : 'pointer', transition:'all 0.15s',
      }}>
        {loading ? <><Loader size={16} style={{ animation:'spin 1s linear infinite' }}/> Analyzing...</> : <><Activity size={16}/> Analyze Patient Risk</>}
      </button>

      {/* Results */}
      {result && (
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

          {/* Clinical Scores Row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px' }}>
            <ScoreCard
              label="NEWS2 SCORE" value={result.clinical.news2} max="/20"
              risk={result.clinical.news2_risk}
              color={result.clinical.news2 >= 7 ? 'var(--clr-critical)' : result.clinical.news2 >= 5 ? 'var(--clr-warning)' : 'var(--clr-success)'}
            />
            <ScoreCard
              label="qSOFA SCORE" value={result.clinical.qsofa} max="/3"
              risk={result.clinical.sepsis_risk}
              color={result.clinical.qsofa >= 2 ? 'var(--clr-critical)' : result.clinical.qsofa === 1 ? 'var(--clr-warning)' : 'var(--clr-success)'}
            />
            <ScoreCard
              label="MAP" value={result.clinical.map} max=" mmHg"
              risk={result.clinical.map_status}
              color={result.clinical.map < 65 ? 'var(--clr-critical)' : result.clinical.map < 70 ? 'var(--clr-warning)' : 'var(--clr-success)'}
            />
          </div>

          {/* Clinical Alerts */}
          {result.clinical.issues.length > 0 && (
            <div style={{ background:'var(--warning-dim)', border:'1px solid var(--warning-border)', borderRadius:'10px', padding:'12px 16px' }}>
              <p style={{ fontSize:'11px', fontFamily:'var(--font-data)', color:'var(--clr-warning)', fontWeight:600, marginBottom:'8px', letterSpacing:'1px' }}>⚠ CLINICAL ALERTS</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                {result.clinical.issues.map((issue, i) => (
                  <p key={i} style={{ fontSize:'12px', color:'var(--text-secondary)' }}>• {issue}</p>
                ))}
              </div>
            </div>
          )}

          {/* ML Risk Card */}
          <div style={{ background:tk.dim, border:`1px solid ${tk.border}`, borderRadius:'14px', padding:'20px', animation:tk.pulse?'pulse-critical 1.5s ease-in-out infinite':undefined }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' }}>
              <div>
                <p style={{ fontSize:'10px', color:'var(--text-muted)', fontFamily:'var(--font-data)', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:'6px' }}>
                  ML Risk — {vitals.name}
                </p>
                <div style={{ display:'flex', alignItems:'baseline', gap:'8px' }}>
                  <span style={{ fontFamily:'var(--font-data)', fontSize:'48px', fontWeight:700, color:tk.color, lineHeight:1 }}>
                    {Math.round(result.risk_score*100)}%
                  </span>
                </div>
                <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', marginTop:'8px', padding:'4px 12px', borderRadius:'100px', background:tk.dim, border:`1px solid ${tk.border}` }}>
                  <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:tk.color, boxShadow:`0 0 6px ${tk.color}` }}/>
                  <span style={{ fontFamily:'var(--font-data)', fontSize:'11px', fontWeight:600, color:tk.color, letterSpacing:'1px' }}>
                    {result.risk_level} RISK — Next 6h
                  </span>
                </div>
              </div>
              {result.risk_level==='HIGH' ? <AlertTriangle size={48} style={{ color:'var(--clr-critical)', filter:'drop-shadow(0 0 10px rgba(255,71,87,0.5))' }}/> :
               result.risk_level==='MEDIUM' ? <AlertTriangle size={48} style={{ color:'var(--clr-warning)' }}/> :
               <CheckCircle size={48} style={{ color:'var(--clr-success)' }}/>}
            </div>
            {/* SHAP Factors */}
            <p style={{ fontSize:'10px', color:'var(--text-muted)', fontFamily:'var(--font-data)', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:'10px' }}>Top Risk Factors</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {result.top_factors.map((f, i) => {
                const isPos = f.impact > 0
                const color = isPos ? 'var(--clr-critical)' : 'var(--clr-success)'
                return (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <span style={{ fontSize:'12px', color:'var(--text-secondary)', width:'160px', flexShrink:0 }}>{f.feature.replace(/_/g,' ')}</span>
                    <div style={{ flex:1, height:'4px', background:'rgba(0,0,0,0.2)', borderRadius:'2px', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${Math.min(Math.abs(f.impact)/1.5*100,100)}%`, background:color, borderRadius:'2px', boxShadow:`0 0 5px ${color}` }}/>
                    </div>
                    <span style={{ fontFamily:'var(--font-data)', fontSize:'11px', fontWeight:600, width:'50px', textAlign:'right', color }}>
                      {f.impact>0?'+':''}{f.impact.toFixed(3)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Explanation */}
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:'14px', padding:'20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
              <FileText size={15} style={{ color:'var(--clr-primary)' }}/>
              <p style={{ fontFamily:'var(--font-display)', fontSize:'14px', fontWeight:600, color:'var(--text-primary)' }}>Clinical Summary</p>
              <span style={{ marginLeft:'auto', fontSize:'11px', color:'var(--text-muted)', fontFamily:'var(--font-data)' }}>{vitals.name}, {vitals.age}y</span>
            </div>
            <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-subtle)', borderRadius:'10px', padding:'14px', fontSize:'13px', color:'var(--text-secondary)', lineHeight:1.8, whiteSpace:'pre-line' }}>
              {result.explanation}
            </div>
          </div>

          {/* Export Button */}
          <button onClick={handleExportReport} style={{
            display:'flex', alignItems:'center', justifyContent:'center', gap:'10px',
            background:'var(--success-dim)', border:'1px solid var(--success-border)',
            color:'var(--clr-success)', fontFamily:'var(--font-data)', fontSize:'12px', fontWeight:700,
            padding:'12px', borderRadius:'10px', cursor:'pointer', transition:'all 0.15s', width:'100%',
          }}>
            <Download size={15}/> Download Comprehensive Report (NEWS2 + qSOFA + ML)
          </button>
        </div>
      )}
    </div>
  )
}
