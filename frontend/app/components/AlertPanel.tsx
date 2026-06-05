'use client'
import { AlertTriangle } from 'lucide-react'
interface Props{alerts:{name:string;score:number;unit:string}[]}
export default function AlertPanel({alerts}:Props){
  if(alerts.length===0)return null
  return(
    <div style={{background:'var(--critical-dim)',border:'1px solid var(--critical-border)',borderRadius:'12px',padding:'14px 18px',animation:'pulse-critical 2s ease-in-out infinite'}}>
      <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}>
        <AlertTriangle size={16} style={{color:'var(--clr-critical)'}}/>
        <span style={{fontFamily:'var(--font-display)',fontSize:'12px',fontWeight:700,color:'var(--clr-critical)',letterSpacing:'1.5px',textTransform:'uppercase'}}>⚠ HIGH RISK ALERTS — {alerts.length} Patient{alerts.length>1?'s':''}</span>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
        {alerts.map((a,i)=>(
          <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px',background:'rgba(255,71,87,0.06)',borderRadius:'8px',border:'1px solid var(--critical-border)'}}>
            <span style={{fontSize:'13px',color:'var(--text-primary)'}}>{a.name}<span style={{color:'var(--text-muted)',fontSize:'11px',marginLeft:'6px'}}>· {a.unit}</span></span>
            <span style={{fontFamily:'var(--font-data)',fontSize:'14px',fontWeight:700,color:'var(--clr-critical)'}}>{Math.round(a.score*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
