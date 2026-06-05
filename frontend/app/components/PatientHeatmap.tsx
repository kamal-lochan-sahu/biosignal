'use client'
interface Patient{id:string;name:string;age:number;unit:string;risk_score?:number;risk_level?:string}
interface Props{patients:Patient[];results:Record<string,{risk_score:number;risk_level:string}>;onSelect:(id:string)=>void}
function getTk(score?:number){
  if(!score)     return{color:'var(--text-muted)',dim:'var(--bg-elevated)',border:'var(--border-subtle)',label:'Not Assessed'}
  if(score>=0.7) return{color:'var(--clr-critical)',dim:'var(--critical-dim)',border:'var(--critical-border)',label:'HIGH'}
  if(score>=0.4) return{color:'var(--clr-warning)',dim:'var(--warning-dim)',border:'var(--warning-border)',label:'MEDIUM'}
  return          {color:'var(--clr-success)',dim:'var(--success-dim)',border:'var(--success-border)',label:'LOW'}
}
export default function PatientHeatmap({patients,results,onSelect}:Props){
  return(
    <div>
      <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'20px',flexWrap:'wrap'}}>
        <span style={{fontSize:'11px',color:'var(--text-muted)',fontFamily:'var(--font-data)'}}>RISK LEGEND:</span>
        {[{color:'var(--clr-success)',label:'Low (<40%)'},{color:'var(--clr-warning)',label:'Medium (40-70%)'},{color:'var(--clr-critical)',label:'High (>70%)'},{color:'var(--text-muted)',label:'Not assessed'}].map(({color,label})=>(
          <div key={label} style={{display:'flex',alignItems:'center',gap:'5px'}}><div style={{width:'10px',height:'10px',borderRadius:'2px',background:color}}/><span style={{fontSize:'10px',color:'var(--text-muted)',fontFamily:'var(--font-data)'}}>{label}</span></div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
        {patients.map(p=>{
          const result=results[p.id];const score=result?.risk_score;const tk=getTk(score);const pct=score?Math.round(score*100):0
          const initials=p.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2)
          return(
            <div key={p.id} onClick={()=>onSelect(p.id)}
              style={{background:tk.dim,border:`1px solid ${tk.border}`,borderRadius:'14px',padding:'16px',cursor:'pointer',transition:'transform 0.15s',animation:score&&score>=0.7?'pulse-critical 2s ease-in-out infinite':undefined}}
              onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.transform='scale(1.02)'}
              onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.transform='scale(1)'}
            >
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                  <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'rgba(0,0,0,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-display)',fontSize:'13px',fontWeight:600,color:tk.color,flexShrink:0}}>{initials}</div>
                  <div>
                    <p style={{fontSize:'13px',fontWeight:600,color:'var(--text-primary)',fontFamily:'var(--font-display)',lineHeight:1.2}}>{p.name}</p>
                    <p style={{fontSize:'10px',color:'var(--text-muted)',fontFamily:'var(--font-data)',marginTop:'2px'}}>{p.age}y · {p.unit}</p>
                  </div>
                </div>
                <span style={{fontFamily:'var(--font-data)',fontSize:'22px',fontWeight:700,color:tk.color}}>{score?`${pct}%`:'—'}</span>
              </div>
              <div style={{height:'4px',background:'rgba(0,0,0,0.2)',borderRadius:'2px',overflow:'hidden',marginBottom:'8px'}}>
                <div style={{height:'100%',width:`${pct}%`,background:tk.color,borderRadius:'2px',boxShadow:`0 0 6px ${tk.color}`,transition:'width 0.7s ease'}}/>
              </div>
              {result?(<p style={{fontSize:'10px',fontWeight:600,color:tk.color,fontFamily:'var(--font-data)'}}>● {tk.label} RISK — Deterioration next 6h</p>):(<p style={{fontSize:'10px',color:'var(--text-muted)',fontFamily:'var(--font-data)'}}>→ ML Dashboard → Predict Risk</p>)}
            </div>
          )
        })}
      </div>
    </div>
  )
}
