'use client'
interface Factor{feature:string;impact:number}
interface Props{factors:Factor[]}
function fmt(f:string){return f.replace(/_/g,' ').replace(/\b\w/g,(c:string)=>c.toUpperCase())}
export default function SHAPExplainer({factors}:Props){
  const max=Math.max(...factors.map(f=>Math.abs(f.impact)))
  const sorted=[...factors].sort((a,b)=>Math.abs(b.impact)-Math.abs(a.impact))
  return(
    <div style={{background:'var(--bg-card)',border:'1px solid var(--border-subtle)',borderRadius:'14px',padding:'16px 20px',height:'100%'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <span style={{fontSize:'16px'}}>🧠</span>
          <span style={{fontFamily:'var(--font-display)',fontSize:'13px',fontWeight:600,color:'var(--text-primary)',textTransform:'uppercase',letterSpacing:'0.5px'}}>SHAP Explainability</span>
        </div>
        <span style={{fontSize:'10px',fontFamily:'var(--font-data)',color:'var(--clr-ml)',background:'var(--ml-dim)',border:'1px solid var(--ml-border)',padding:'2px 8px',borderRadius:'100px'}}>Top {sorted.length} factors</span>
      </div>
      <div style={{display:'flex',gap:'14px',marginBottom:'14px'}}>
        {[{color:'var(--clr-critical)',label:'Increases risk'},{color:'var(--clr-success)',label:'Decreases risk'}].map(({color,label})=>(
          <div key={label} style={{display:'flex',alignItems:'center',gap:'5px'}}>
            <div style={{width:'10px',height:'10px',borderRadius:'2px',background:color}}/>
            <span style={{fontSize:'10px',color:'var(--text-muted)',fontFamily:'var(--font-data)'}}>{label}</span>
          </div>
        ))}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
        {sorted.map((f,i)=>{
          const isPos=f.impact>0
          const color=isPos?'var(--clr-critical)':'var(--clr-success)'
          const pct=(Math.abs(f.impact)/max)*100
          return(
            <div key={i}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'5px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'7px'}}>
                  <span style={{fontFamily:'var(--font-data)',fontSize:'9px',color:'var(--text-muted)',width:'14px',textAlign:'right'}}>#{i+1}</span>
                  <span style={{fontSize:'12px',color:'var(--text-secondary)'}}>{fmt(f.feature)}</span>
                </div>
                <span style={{fontFamily:'var(--font-data)',fontSize:'11px',fontWeight:600,color}}>{f.impact>0?'+':''}{f.impact.toFixed(3)}</span>
              </div>
              <div style={{height:'5px',background:'var(--bg-elevated)',borderRadius:'3px',overflow:'hidden'}}>
                <div style={{height:'100%',width:`${pct}%`,background:color,borderRadius:'3px',boxShadow:isPos?'0 0 5px rgba(255,71,87,0.5)':'0 0 5px rgba(0,255,140,0.4)',transition:`width ${0.5+i*0.1}s ease`}}/>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
