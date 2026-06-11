'use client'
import { useState, useRef } from 'react'
import { Upload, FileText, Activity, AlertTriangle, CheckCircle, Loader } from 'lucide-react'
import { predictRisk } from '@/lib/api'

interface VitalsData { heart_rate:number;spo2:number;bp_systolic:number;bp_diastolic:number;respiratory_rate:number;temperature:number;age:number;name:string }
interface AnalysisResult { risk_score:number;risk_level:string;top_factors:{feature:string;impact:number}[];explanation:string }

function parseCSVVitals(csv:string):VitalsData|null{
  try{
    const lines=csv.trim().split('\n'),data:Record<string,number|string>={}
    const mappings:Record<string,string>={'heart rate':'heart_rate','hr':'heart_rate','pulse':'heart_rate','spo2':'spo2','oxygen saturation':'spo2','o2 sat':'spo2','bp systolic':'bp_systolic','sbp':'bp_systolic','systolic':'bp_systolic','bp diastolic':'bp_diastolic','dbp':'bp_diastolic','diastolic':'bp_diastolic','respiratory rate':'respiratory_rate','rr':'respiratory_rate','resp rate':'respiratory_rate','temperature':'temperature','temp':'temperature','age':'age','name':'name','patient':'name'}
    for(const line of lines){const parts=line.split(',');if(parts.length<2)continue;const key=parts[0].trim().toLowerCase();const value=parts.slice(1).join(',').trim();const mapped=mappings[key];if(mapped)data[mapped]=mapped==='name'?value:parseFloat(value)}
    return{heart_rate:(data.heart_rate as number)||80,spo2:(data.spo2 as number)||96,bp_systolic:(data.bp_systolic as number)||120,bp_diastolic:(data.bp_diastolic as number)||75,respiratory_rate:(data.respiratory_rate as number)||16,temperature:(data.temperature as number)||37.0,age:(data.age as number)||50,name:(data.name as string)||'Patient'}
  }catch{return null}
}

function generateExplanation(vitals:VitalsData,result:{risk_score:number;risk_level:string;top_factors:{feature:string;impact:number}[]}):string{
  const pct=Math.round(result.risk_score*100),level=result.risk_level,issues:string[]=[]
  if(vitals.heart_rate>100)issues.push(`heart rate is high at ${vitals.heart_rate} bpm (normal: 60-100)`)
  if(vitals.heart_rate<50)issues.push(`heart rate is very low at ${vitals.heart_rate} bpm`)
  if(vitals.spo2<95)issues.push(`oxygen level is low at ${vitals.spo2}% (normal: 95-100%)`)
  if(vitals.bp_systolic<90)issues.push(`blood pressure is dangerously low at ${vitals.bp_systolic} mmHg`)
  if(vitals.bp_systolic>160)issues.push(`blood pressure is very high at ${vitals.bp_systolic} mmHg`)
  if(vitals.respiratory_rate>20)issues.push(`breathing rate is fast at ${vitals.respiratory_rate}/min`)
  if(vitals.temperature>38.5)issues.push(`temperature is high at ${vitals.temperature}°C`)
  if(vitals.temperature<36)issues.push(`temperature is low at ${vitals.temperature}°C`)
  const topFactor=result.top_factors[0]?.feature?.replace(/_/g,' ')||'vital signs'
  const issueText=issues.length>0?'Concerning signs: '+issues.join('; ')+'.':'Most vital signs are within acceptable range.'
  if(level==='HIGH')return `⚠️ HIGH RISK — ${pct}% chance of deterioration in next 6 hours.\n\n${issueText}\n\nMost critical factor: ${topFactor}. This patient needs immediate medical attention. Nursing staff should notify the doctor right away and monitor continuously.\n\nDo not delay — every minute matters in ICU care.`
  if(level==='MEDIUM')return `⚡ MEDIUM RISK — ${pct}% chance of deterioration in next 6 hours.\n\n${issueText}\n\nKey factor to watch: ${topFactor}. Increase monitoring frequency and inform the doctor if any values worsen.`
  return `✅ LOW RISK — ${pct}% chance of deterioration in next 6 hours.\n\n${issueText}\n\nContinue routine monitoring as scheduled. The patient appears stable.`
}

const SAMPLE_CSV=`name, John Patient\nage, 62\nheart rate, 118\nspo2, 87\nbp systolic, 82\nbp diastolic, 52\nrespiratory rate, 28\ntemperature, 38.8`

const inp = {background:'var(--bg-elevated)',color:'var(--text-primary)',border:'1px solid var(--border-default)',borderRadius:'8px',padding:'8px 12px',fontSize:'13px',outline:'none',width:'100%',fontFamily:'var(--font-body)',transition:'border-color 0.15s'}

function getRiskTokens(level?:string){
  if(level==='HIGH')   return{color:'var(--clr-critical)',dim:'var(--critical-dim)',border:'var(--critical-border)',pulse:true}
  if(level==='MEDIUM') return{color:'var(--clr-warning)', dim:'var(--warning-dim)', border:'var(--warning-border)',pulse:false}
  return                   {color:'var(--clr-success)',  dim:'var(--success-dim)', border:'var(--success-border)',pulse:false}
}

export default function ReportAnalyzer(){
  const[mode,setMode]=useState<'manual'|'csv'>('manual')
  const[csvText,setCsvText]=useState('')
  const[vitals,setVitals]=useState<VitalsData>({name:'Test Patient',age:60,heart_rate:95,spo2:94,bp_systolic:105,bp_diastolic:65,respiratory_rate:22,temperature:37.8})
  const[result,setResult]=useState<AnalysisResult|null>(null)
  const[loading,setLoading]=useState(false)
  const[error,setError]=useState('')
  const[parseSuccess,setParseSuccess]=useState(false)
  const fileRef=useRef<HTMLInputElement>(null)

  const handleFileUpload=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];if(!file)return
    const reader=new FileReader()
    reader.onload=(ev)=>{const text=ev.target?.result as string;setCsvText(text);const parsed=parseCSVVitals(text);if(parsed){setVitals(parsed);setParseSuccess(true)}}
    reader.readAsText(file)
  }

  const handleCSVParse=()=>{const parsed=parseCSVVitals(csvText);if(parsed){setVitals(parsed);setParseSuccess(true);setError('')}else setError('Could not parse — check format')}

  const handleAnalyze=async()=>{
    setLoading(true);setError('');setResult(null)
    try{
      const s=(v:number)=>v*0.05
      const apiInput={heart_rate_mean:vitals.heart_rate,heart_rate_std:s(vitals.heart_rate),heart_rate_min:vitals.heart_rate-s(vitals.heart_rate)*2,heart_rate_max:vitals.heart_rate+s(vitals.heart_rate)*2,spo2_mean:vitals.spo2,spo2_std:s(vitals.spo2),spo2_min:Math.max(vitals.spo2-3,50),spo2_max:Math.min(vitals.spo2+2,100),bp_systolic_mean:vitals.bp_systolic,bp_systolic_std:s(vitals.bp_systolic),bp_systolic_min:vitals.bp_systolic-s(vitals.bp_systolic)*2,bp_systolic_max:vitals.bp_systolic+s(vitals.bp_systolic)*2,bp_diastolic_mean:vitals.bp_diastolic,bp_diastolic_std:s(vitals.bp_diastolic),bp_diastolic_min:vitals.bp_diastolic-s(vitals.bp_diastolic)*2,bp_diastolic_max:vitals.bp_diastolic+s(vitals.bp_diastolic)*2,respiratory_rate_mean:vitals.respiratory_rate,respiratory_rate_std:s(vitals.respiratory_rate),respiratory_rate_min:Math.max(vitals.respiratory_rate-3,4),respiratory_rate_max:vitals.respiratory_rate+3}
      const mlResult=await predictRisk(apiInput)
      setResult({...mlResult,explanation:generateExplanation(vitals,mlResult)})
    }catch{setError('Analysis failed — make sure backend is running on port 8000')}
    setLoading(false)
  }

  const tk=getRiskTokens(result?.risk_level)

  return(
    <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>

      {/* Header */}
      <div style={{background:'var(--bg-card)',border:'1px solid var(--border-subtle)',borderRadius:'14px',padding:'16px 20px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px'}}>
          <Activity size={18} style={{color:'var(--clr-primary)'}}/>
          <h3 style={{fontFamily:'var(--font-display)',fontSize:'15px',fontWeight:700,color:'var(--text-primary)'}}>Patient Report Analyzer</h3>
          <span style={{marginLeft:'auto',fontSize:'10px',background:'var(--success-dim)',color:'var(--clr-success)',border:'1px solid var(--success-border)',padding:'2px 8px',borderRadius:'100px',fontFamily:'var(--font-data)'}}>Free — No API Cost</span>
        </div>
        <p style={{fontSize:'12px',color:'var(--text-secondary)',lineHeight:1.5}}>Enter real patient vitals manually or upload a CSV — BioSignal ML will analyse and explain in simple language</p>
      </div>

      {/* Mode Toggle */}
      <div style={{display:'flex',gap:'8px'}}>
        {(['manual','csv'] as const).map(m=>(
          <button key={m} onClick={()=>setMode(m)} style={{
            display:'flex',alignItems:'center',gap:'8px',padding:'8px 16px',borderRadius:'8px',
            fontSize:'13px',fontWeight:500,cursor:'pointer',transition:'all 0.15s',border:'1px solid',
            background:mode===m?'var(--primary-dim)':'var(--bg-card)',
            color:mode===m?'var(--clr-primary)':'var(--text-secondary)',
            borderColor:mode===m?'var(--primary-border)':'var(--border-subtle)',
          }}>
            {m==='manual'?<><FileText size={14}/>Manual Entry</>:<><Upload size={14}/>CSV Upload</>}
          </button>
        ))}
      </div>

      {/* Manual Entry */}
      {mode==='manual'&&(
        <div style={{background:'var(--bg-card)',border:'1px solid var(--border-subtle)',borderRadius:'14px',padding:'20px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'16px'}}>
            <div>
              <label style={{fontSize:'11px',color:'var(--text-muted)',fontFamily:'var(--font-data)',display:'block',marginBottom:'6px'}}>Patient Name</label>
              <input value={vitals.name} onChange={e=>setVitals(p=>({...p,name:e.target.value}))} style={inp}/>
            </div>
            <div>
              <label style={{fontSize:'11px',color:'var(--text-muted)',fontFamily:'var(--font-data)',display:'block',marginBottom:'6px'}}>Age (years)</label>
              <input type="number" value={vitals.age} onChange={e=>setVitals(p=>({...p,age:parseInt(e.target.value)||0}))} style={inp}/>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'10px'}}>
            {[
              {label:'Heart Rate (bpm)',key:'heart_rate',normal:'60-100'},
              {label:'SpO₂ (%)',key:'spo2',normal:'95-100'},
              {label:'BP Systolic (mmHg)',key:'bp_systolic',normal:'90-140'},
              {label:'BP Diastolic (mmHg)',key:'bp_diastolic',normal:'60-90'},
              {label:'Respiratory Rate (/min)',key:'respiratory_rate',normal:'12-20'},
              {label:'Temperature (°C)',key:'temperature',normal:'36-38'},
            ].map(f=>(
              <div key={f.key} style={{background:'var(--bg-elevated)',border:'1px solid var(--border-subtle)',borderRadius:'10px',padding:'12px'}}>
                <label style={{fontSize:'10px',color:'var(--text-muted)',fontFamily:'var(--font-data)',display:'block',marginBottom:'6px'}}>{f.label}</label>
                <input type="number" step="0.1" value={vitals[f.key as keyof VitalsData] as number}
                  onChange={e=>setVitals(p=>({...p,[f.key]:parseFloat(e.target.value)||0}))}
                  style={{...inp,fontSize:'20px',fontWeight:700,fontFamily:'var(--font-data)',color:'var(--clr-primary)',padding:'6px 8px',background:'transparent',border:'none',borderBottom:'1px solid var(--border-default)'}}/>
                <p style={{fontSize:'10px',color:'var(--text-muted)',marginTop:'4px',fontFamily:'var(--font-data)'}}>Normal: {f.normal}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSV Upload */}
      {mode==='csv'&&(
        <div style={{background:'var(--bg-card)',border:'1px solid var(--border-subtle)',borderRadius:'14px',padding:'20px',display:'flex',flexDirection:'column',gap:'12px'}}>
          <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFileUpload} style={{display:'none'}}/>
          <div style={{display:'flex',gap:'8px'}}>
            <button onClick={()=>fileRef.current?.click()} style={{display:'flex',alignItems:'center',gap:'8px',background:'var(--bg-elevated)',border:'1px solid var(--border-default)',color:'var(--text-secondary)',fontSize:'13px',padding:'8px 16px',borderRadius:'8px',cursor:'pointer',transition:'all 0.15s'}}>
              <Upload size={14}/> Choose CSV File
            </button>
            <button onClick={()=>{setCsvText(SAMPLE_CSV);setParseSuccess(false)}} style={{fontSize:'12px',color:'var(--clr-primary)',padding:'8px 12px',background:'var(--primary-dim)',border:'1px solid var(--primary-border)',borderRadius:'8px',cursor:'pointer',fontFamily:'var(--font-data)'}}>
              Load Sample
            </button>
          </div>
          <textarea value={csvText} onChange={e=>{setCsvText(e.target.value);setParseSuccess(false)}}
            placeholder={'name, Patient Name\nage, 65\nheart rate, 110\nspo2, 91\nbp systolic, 85\nbp diastolic, 55\nrespiratory rate, 26\ntemperature, 38.9'}
            rows={9}
            style={{...inp,fontSize:'12px',fontFamily:'var(--font-data)',resize:'none',lineHeight:1.7}}/>
          <button onClick={handleCSVParse} style={{background:'var(--bg-elevated)',border:'1px solid var(--border-default)',color:'var(--text-secondary)',fontSize:'12px',fontWeight:600,padding:'8px 16px',borderRadius:'8px',cursor:'pointer',transition:'all 0.15s',alignSelf:'flex-start',fontFamily:'var(--font-data)'}}>
            Parse Data
          </button>
          {parseSuccess&&(
            <div style={{background:'var(--success-dim)',border:'1px solid var(--success-border)',borderRadius:'10px',padding:'12px 16px'}}>
              <p style={{fontSize:'12px',color:'var(--clr-success)',fontWeight:600,marginBottom:'8px',fontFamily:'var(--font-data)'}}>✓ Parsed — {vitals.name}, Age {vitals.age}</p>
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'4px'}}>
                {[`HR: ${vitals.heart_rate} bpm`,`SpO₂: ${vitals.spo2}%`,`BP: ${vitals.bp_systolic}/${vitals.bp_diastolic}`,`RR: ${vitals.respiratory_rate}/min`,`Temp: ${vitals.temperature}°C`,`Age: ${vitals.age}y`].map(s=>(
                  <span key={s} style={{fontSize:'11px',color:'var(--text-secondary)',fontFamily:'var(--font-data)'}}>{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error&&<div style={{background:'var(--critical-dim)',border:'1px solid var(--critical-border)',borderRadius:'10px',padding:'12px 16px',color:'var(--clr-critical)',fontSize:'13px'}}>{error}</div>}

      {/* Analyze Button */}
      <button onClick={handleAnalyze} disabled={loading} style={{
        width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',
        background:loading?'var(--bg-elevated)':'var(--primary-dim)',
        border:`1px solid ${loading?'var(--border-subtle)':'var(--primary-border)'}`,
        color:loading?'var(--text-muted)':'var(--clr-primary)',
        fontFamily:'var(--font-display)',fontSize:'14px',fontWeight:700,
        padding:'14px',borderRadius:'12px',cursor:loading?'not-allowed':'pointer',
        transition:'all 0.15s',
      }}>
        {loading?<><Loader size={16} style={{animation:'spin 1s linear infinite'}}/> Analyzing...</>:<><Activity size={16}/> Analyze Patient Risk</>}
      </button>

      {/* Result */}
      {result&&(
        <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
          {/* Risk Card */}
          <div style={{background:tk.dim,border:`1px solid ${tk.border}`,borderRadius:'14px',padding:'20px',animation:tk.pulse?'pulse-critical 1.5s ease-in-out infinite':undefined}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'20px'}}>
              <div>
                <p style={{fontSize:'10px',color:'var(--text-muted)',fontFamily:'var(--font-data)',letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:'6px'}}>ML Risk — {vitals.name}</p>
                <div style={{display:'flex',alignItems:'baseline',gap:'8px'}}>
                  <span style={{fontFamily:'var(--font-data)',fontSize:'52px',fontWeight:700,color:tk.color,lineHeight:1}}>{Math.round(result.risk_score*100)}%</span>
                </div>
                <div style={{display:'inline-flex',alignItems:'center',gap:'6px',marginTop:'8px',padding:'4px 12px',borderRadius:'100px',background:tk.dim,border:`1px solid ${tk.border}`}}>
                  <div style={{width:'7px',height:'7px',borderRadius:'50%',background:tk.color,boxShadow:`0 0 6px ${tk.color}`}}/>
                  <span style={{fontFamily:'var(--font-data)',fontSize:'11px',fontWeight:600,color:tk.color,letterSpacing:'1px'}}>{result.risk_level} RISK — Next 6h</span>
                </div>
              </div>
              {result.risk_level==='HIGH'
                ?<AlertTriangle size={52} style={{color:'var(--clr-critical)',filter:'drop-shadow(0 0 12px rgba(255,71,87,0.5))'}}/>
                :result.risk_level==='MEDIUM'
                ?<AlertTriangle size={52} style={{color:'var(--clr-warning)'}}/>
                :<CheckCircle size={52} style={{color:'var(--clr-success)'}}/>}
            </div>
            {/* Factors */}
            <div>
              <p style={{fontSize:'10px',color:'var(--text-muted)',fontFamily:'var(--font-data)',letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:'10px'}}>Top Risk Factors</p>
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                {result.top_factors.map((f,i)=>{
                  const isPos=f.impact>0;const color=isPos?'var(--clr-critical)':'var(--clr-success)'
                  return(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:'10px'}}>
                      <span style={{fontSize:'12px',color:'var(--text-secondary)',width:'160px',flexShrink:0}}>{f.feature.replace(/_/g,' ')}</span>
                      <div style={{flex:1,height:'4px',background:'rgba(0,0,0,0.2)',borderRadius:'2px',overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${Math.min(Math.abs(f.impact)/1.5*100,100)}%`,background:color,borderRadius:'2px',boxShadow:`0 0 5px ${color}`,transition:`width ${0.4+i*0.08}s ease`}}/>
                      </div>
                      <span style={{fontFamily:'var(--font-data)',fontSize:'11px',fontWeight:600,width:'50px',textAlign:'right',color}}>{f.impact>0?'+':''}{f.impact.toFixed(3)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border-subtle)',borderRadius:'14px',padding:'20px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'14px'}}>
              <FileText size={15} style={{color:'var(--clr-primary)'}}/>
              <p style={{fontFamily:'var(--font-display)',fontSize:'14px',fontWeight:600,color:'var(--text-primary)'}}>Clinical Explanation</p>
              <span style={{marginLeft:'auto',fontSize:'11px',color:'var(--text-muted)',fontFamily:'var(--font-data)'}}>{vitals.name}, {vitals.age}y</span>
            </div>
            <div style={{background:'var(--bg-elevated)',border:'1px solid var(--border-subtle)',borderRadius:'10px',padding:'16px',fontSize:'13px',color:'var(--text-secondary)',lineHeight:1.8,whiteSpace:'pre-line',fontFamily:'var(--font-body)'}}>
              {result.explanation}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
