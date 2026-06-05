'use client'
import { getRiskText } from '@/lib/risk-utils'
interface Props { patient:{id:string;name:string;age:number;unit:string;risk_level?:string;risk_score?:number};selected:boolean;onClick:()=>void }
function getRiskConfig(level?:string){
  switch(level?.toUpperCase()){
    case 'HIGH':   return{accentColor:'var(--clr-critical)',badgeBg:'var(--critical-dim)',badgeBorder:'var(--critical-border)',badgeColor:'var(--clr-critical)',cardBg:'rgba(255,71,87,0.04)',label:'HIGH',pulse:true}
    case 'MEDIUM': return{accentColor:'var(--clr-warning)',badgeBg:'var(--warning-dim)',badgeBorder:'var(--warning-border)',badgeColor:'var(--clr-warning)',cardBg:'rgba(255,184,0,0.03)',label:'MED',pulse:false}
    case 'LOW':    return{accentColor:'var(--clr-success)',badgeBg:'var(--success-dim)',badgeBorder:'var(--success-border)',badgeColor:'var(--clr-success)',cardBg:'rgba(0,255,140,0.03)',label:'LOW',pulse:false}
    default:       return{accentColor:'var(--border-default)',badgeBg:'var(--bg-elevated)',badgeBorder:'var(--border-subtle)',badgeColor:'var(--text-muted)',cardBg:'transparent',label:'—',pulse:false}
  }
}
export default function PatientCard({patient,selected,onClick}:Props){
  const cfg=getRiskConfig(patient.risk_level)
  const score=Math.round((patient.risk_score??0)*100)
  const initials=patient.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2)
  return(
    <div onClick={onClick}
      style={{background:selected?cfg.cardBg:'var(--bg-card)',border:selected?`1px solid ${cfg.accentColor}`:'1px solid var(--border-subtle)',borderLeft:selected?`3px solid ${cfg.accentColor}`:'3px solid transparent',borderRadius:'12px',padding:'12px 14px',cursor:'pointer',transition:'all 0.18s ease',position:'relative'}}
      onMouseEnter={e=>{if(!selected){(e.currentTarget as HTMLDivElement).style.borderColor='var(--border-default)';(e.currentTarget as HTMLDivElement).style.transform='translateX(2px)'}}}
      onMouseLeave={e=>{if(!selected){(e.currentTarget as HTMLDivElement).style.borderColor='var(--border-subtle)';(e.currentTarget as HTMLDivElement).style.transform='translateX(0)'}}}
    >
      <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
        <div style={{width:'34px',height:'34px',borderRadius:'50%',background:selected?cfg.badgeBg:'var(--bg-elevated)',border:`1px solid ${selected?cfg.badgeBorder:'var(--border-subtle)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontFamily:'var(--font-display)',fontSize:'12px',fontWeight:600,color:selected?cfg.accentColor:'var(--text-secondary)'}}>
          {initials}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <p style={{fontFamily:'var(--font-display)',fontSize:'13px',fontWeight:600,color:'var(--text-primary, #e2e8f0)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',lineHeight:1.3,marginBottom:'2px'}}>{patient.name}</p>
          <p style={{fontSize:'10px',color:'var(--text-muted)',fontFamily:'var(--font-data)',lineHeight:1}}>{patient.age}y · {patient.id} · {patient.unit}</p>
        </div>
        {patient.risk_level?(
          <div style={{textAlign:'center',flexShrink:0}}>
            <div style={{fontFamily:'var(--font-data)',fontSize:'16px',fontWeight:600,color:cfg.badgeColor,lineHeight:1,marginBottom:'3px',animation:cfg.pulse?'pulse-critical 1.5s ease-in-out infinite':undefined}}>{score}%</div>
            <div style={{fontSize:'9px',fontFamily:'var(--font-data)',fontWeight:500,padding:'1px 6px',borderRadius:'100px',background:cfg.badgeBg,border:`1px solid ${cfg.badgeBorder}`,color:cfg.badgeColor}}>{cfg.label}</div>
          </div>
        ):(
          <div style={{fontSize:'10px',fontFamily:'var(--font-data)',color:'var(--text-muted)'}}>—</div>
        )}
      </div>
      {patient.risk_score!==undefined&&(
        <div style={{marginTop:'10px',height:'2px',background:'var(--bg-elevated)',borderRadius:'1px',overflow:'hidden'}}>
          <div style={{height:'100%',width:`${score}%`,background:cfg.accentColor,borderRadius:'1px',transition:'width 0.6s ease',boxShadow:`0 0 6px ${cfg.accentColor}`}}/>
        </div>
      )}
    </div>
  )
}
