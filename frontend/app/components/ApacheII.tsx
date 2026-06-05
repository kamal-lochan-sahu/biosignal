'use client'
import { useState } from 'react'

interface ApacheVals { temp:number;map:number;heart_rate:number;resp_rate:number;fio2:number;pao2:number;ph:number;sodium:number;potassium:number;creatinine:number;hematocrit:number;wbc:number;gcs:number;age:number;chronic:number }
interface Props { initialVitals?:{heart_rate_mean:number;respiratory_rate_mean:number;bp_systolic_mean:number;bp_diastolic_mean:number}; initialAge?:number }

function scoreVal(v:number,ranges:[number,number,number][]):number{for(const[low,high,score]of ranges){if(v>=low&&v<=high)return score}return 0}
function calcApache(v:ApacheVals){
  const temp=scoreVal(v.temp,[[41,999,4],[39,40.9,3],[38.5,38.9,1],[36,38.4,0],[34,35.9,1],[32,33.9,2],[30,31.9,3],[0,29.9,4]])
  const map=scoreVal(v.map,[[160,999,4],[130,159,3],[110,129,2],[70,109,0],[50,69,2],[0,49,4]])
  const hr=scoreVal(v.heart_rate,[[180,999,4],[140,179,3],[110,139,2],[70,109,0],[55,69,2],[40,54,3],[0,39,4]])
  const rr=scoreVal(v.resp_rate,[[50,999,4],[35,49,3],[25,34,1],[12,24,0],[10,11,1],[6,9,2],[0,5,4]])
  const oxyg=v.fio2>=0.5?scoreVal(v.pao2,[[0,55,4],[55,60,3],[61,70,1],[71,999,0]]):scoreVal(v.pao2,[[70,999,0],[61,69,1],[55,60,3],[0,54,4]])
  const ph=scoreVal(v.ph,[[7.7,999,4],[7.6,7.69,3],[7.5,7.59,1],[7.33,7.49,0],[7.25,7.32,2],[7.15,7.24,3],[0,7.14,4]])
  const na=scoreVal(v.sodium,[[180,999,4],[160,179,3],[155,159,2],[150,154,1],[130,149,0],[120,129,2],[111,119,3],[0,110,4]])
  const k=scoreVal(v.potassium,[[7,999,4],[6,6.9,3],[5.5,5.9,1],[3.5,5.4,0],[3,3.4,1],[2.5,2.9,2],[0,2.4,4]])
  const cr=scoreVal(v.creatinine,[[3.5,999,4],[2,3.4,3],[1.5,1.9,2],[0.6,1.4,0],[0,0.5,2]])
  const hct=scoreVal(v.hematocrit,[[60,999,4],[50,59.9,2],[46,49.9,1],[30,45.9,0],[20,29.9,2],[0,19.9,4]])
  const wbc=scoreVal(v.wbc,[[40,999,4],[20,39.9,2],[15,19.9,1],[3,14.9,0],[1,2.9,2],[0,0.9,4]])
  const gcs=15-v.gcs
  const age=v.age<45?0:v.age<55?2:v.age<65?3:v.age<75?5:6
  const acute=temp+map+hr+rr+oxyg+ph+na+k+cr+hct+wbc+gcs
  const total=acute+age+v.chronic
  const mortality=total<=4?'4%':total<=9?'8%':total<=14?'15%':total<=19?'25%':total<=24?'40%':total<=29?'55%':total<=34?'75%':'>85%'
  return{total,mortality,acute,ageScore:age}
}

function getTk(total:number){
  if(total>=25)return{color:'var(--clr-critical)',dim:'var(--critical-dim)',border:'var(--critical-border)'}
  if(total>=15)return{color:'var(--clr-warning)',dim:'var(--warning-dim)',border:'var(--warning-border)'}
  if(total>=8) return{color:'var(--clr-warning)',dim:'var(--warning-dim)',border:'var(--warning-border)'}
  return{color:'var(--clr-success)',dim:'var(--success-dim)',border:'var(--success-border)'}
}

export default function ApacheII({initialVitals,initialAge}:Props){
  const derivedMap=initialVitals?Math.round((initialVitals.bp_systolic_mean+2*initialVitals.bp_diastolic_mean)/3):85
  const[vals,setVals]=useState<ApacheVals>({temp:37.5,map:derivedMap,heart_rate:initialVitals?.heart_rate_mean??88,resp_rate:initialVitals?.respiratory_rate_mean??18,fio2:0.21,pao2:95,ph:7.38,sodium:138,potassium:4.0,creatinine:1.1,hematocrit:38,wbc:9,gcs:15,age:initialAge??60,chronic:0})
  const{total,mortality,acute,ageScore}=calcApache(vals)
  const tk=getTk(total)
  const fields=[
    {label:'Temperature (°C)',key:'temp',min:28,max:42,step:0.1},
    {label:'MAP (mmHg)',key:'map',min:40,max:180,step:1},
    {label:'Heart Rate',key:'heart_rate',min:20,max:200,step:1},
    {label:'Resp Rate',key:'resp_rate',min:4,max:60,step:1},
    {label:'FiO₂ (0.21–1.0)',key:'fio2',min:0.21,max:1,step:0.01},
    {label:'PaO₂ (mmHg)',key:'pao2',min:40,max:150,step:1},
    {label:'pH',key:'ph',min:7.0,max:7.8,step:0.01},
    {label:'Sodium (mEq/L)',key:'sodium',min:100,max:190,step:1},
    {label:'Potassium (mEq/L)',key:'potassium',min:1,max:8,step:0.1},
    {label:'Creatinine (mg/dL)',key:'creatinine',min:0.3,max:6,step:0.1},
    {label:'Hematocrit (%)',key:'hematocrit',min:10,max:70,step:1},
    {label:'WBC (×10³)',key:'wbc',min:0.5,max:50,step:0.5},
    {label:'GCS Score',key:'gcs',min:3,max:15,step:1},
    {label:'Age (years)',key:'age',min:16,max:90,step:1},
    {label:'Chronic Points (0–5)',key:'chronic',min:0,max:5,step:1},
  ]
  return(
    <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
      {/* Score Header */}
      <div style={{background:tk.dim,border:`1px solid ${tk.border}`,borderRadius:'14px',padding:'20px 24px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <p style={{fontSize:'10px',color:'var(--text-muted)',fontFamily:'var(--font-data)',letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:'6px'}}>APACHE II Score</p>
          <div style={{display:'flex',alignItems:'baseline',gap:'8px'}}>
            <span style={{fontFamily:'var(--font-data)',fontSize:'56px',fontWeight:700,color:tk.color,lineHeight:1}}>{total}</span>
            <span style={{fontFamily:'var(--font-data)',fontSize:'16px',color:'var(--text-muted)'}}>/71</span>
          </div>
          <p style={{fontSize:'13px',fontWeight:600,color:tk.color,marginTop:'6px'}}>Predicted Mortality: {mortality}</p>
        </div>
        <div style={{textAlign:'right'}}>
          {[['Acute Physiology',acute],['Age Points',ageScore],['Chronic Points',vals.chronic]].map(([l,v])=>(
            <div key={String(l)} style={{display:'flex',justifyContent:'space-between',gap:'16px',marginBottom:'4px'}}>
              <span style={{fontSize:'11px',color:'var(--text-muted)',fontFamily:'var(--font-data)'}}>{l}</span>
              <span style={{fontSize:'11px',color:'var(--text-secondary)',fontFamily:'var(--font-data)',fontWeight:600}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Sliders */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
        {fields.map(f=>(
          <div key={f.key} style={{background:'var(--bg-card)',border:'1px solid var(--border-subtle)',borderRadius:'8px',padding:'10px 12px'}}>
            <label style={{fontSize:'10px',color:'var(--text-muted)',fontFamily:'var(--font-data)',display:'block',marginBottom:'6px'}}>{f.label}</label>
            <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
              <input type="range" min={f.min} max={f.max} step={f.step}
                value={vals[f.key as keyof ApacheVals]}
                onChange={e=>setVals(p=>({...p,[f.key]:parseFloat(e.target.value)}))}
                style={{flex:1,accentColor:'var(--clr-primary)'}}/>
              <span style={{fontFamily:'var(--font-data)',fontSize:'12px',fontWeight:600,color:'var(--text-primary)',minWidth:'34px',textAlign:'right'}}>
                {Number(vals[f.key as keyof ApacheVals]).toFixed(f.step<0.1?2:f.step<1?1:0)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
