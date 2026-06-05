'use client'
import { Download, FileText, Table } from 'lucide-react'

interface Patient { id:string;name:string;age:number;unit:string;vitals:{heart_rate_mean:number;spo2_mean:number;bp_systolic_mean:number;respiratory_rate_mean:number} }
interface Props { patients:Patient[];results:Record<string,{risk_score:number;risk_level:string;top_factors:{feature:string;impact:number}[]}> }

function getRiskTokens(level?:string){
  if(level==='HIGH')   return{color:'var(--clr-critical)',dim:'var(--critical-dim)',border:'var(--critical-border)'}
  if(level==='MEDIUM') return{color:'var(--clr-warning)', dim:'var(--warning-dim)', border:'var(--warning-border)'}
  if(level==='LOW')    return{color:'var(--clr-success)', dim:'var(--success-dim)', border:'var(--success-border)'}
  return {color:'var(--text-muted)',dim:'var(--bg-elevated)',border:'var(--border-subtle)'}
}

export default function ExportData({patients,results}:Props){
  const exportCSV=()=>{
    const headers=['Patient ID','Name','Age','Unit','HR Mean','SpO2 Mean','BP Systolic Mean','RR Mean','Risk Score','Risk Level','Top Factor']
    const rows=patients.map(p=>{const r=results[p.id];return[p.id,p.name,p.age,p.unit,p.vitals.heart_rate_mean,p.vitals.spo2_mean,p.vitals.bp_systolic_mean,p.vitals.respiratory_rate_mean,r?(r.risk_score*100).toFixed(1)+'%':'N/A',r?r.risk_level:'N/A',r?r.top_factors[0]?.feature||'N/A':'N/A']})
    const csv=[headers,...rows].map(r=>r.join(',')).join('\n')
    const blob=new Blob([csv],{type:'text/csv'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='biosignal-export.csv';a.click();URL.revokeObjectURL(url)
  }
  const exportJSON=()=>{
    const data=patients.map(p=>({patient:p,prediction:results[p.id]||null}))
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='biosignal-export.json';a.click();URL.revokeObjectURL(url)
  }

  return(
    <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
      {/* Export Buttons */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
        {[
          {icon:<Table size={22} style={{color:'var(--clr-success)'}}/>,title:'Export CSV',sub:'For Excel, R, SPSS analysis',desc:'Exports patient vitals + ML predictions in comma-separated format. Compatible with all statistical tools.',btnLabel:'Download CSV',btnColor:'var(--clr-success)',btnDim:'var(--success-dim)',btnBorder:'var(--success-border)',fn:exportCSV},
          {icon:<FileText size={22} style={{color:'var(--clr-primary)'}}/>,title:'Export JSON',sub:'For API integration, research',desc:'Full structured data with SHAP factors and prediction metadata. Ideal for research pipelines.',btnLabel:'Download JSON',btnColor:'var(--clr-primary)',btnDim:'var(--primary-dim)',btnBorder:'var(--primary-border)',fn:exportJSON},
        ].map(({icon,title,sub,desc,btnLabel,btnColor,btnDim,btnBorder,fn})=>(
          <div key={title} style={{background:'var(--bg-card)',border:'1px solid var(--border-subtle)',borderRadius:'14px',padding:'20px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'12px'}}>
              <div style={{width:'42px',height:'42px',borderRadius:'10px',background:btnDim,border:`1px solid ${btnBorder}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                {icon}
              </div>
              <div>
                <p style={{fontSize:'14px',fontWeight:600,color:'var(--text-primary)',fontFamily:'var(--font-display)'}}>{title}</p>
                <p style={{fontSize:'11px',color:'var(--text-muted)'}}>{sub}</p>
              </div>
            </div>
            <p style={{fontSize:'12px',color:'var(--text-secondary)',lineHeight:1.6,marginBottom:'16px'}}>{desc}</p>
            <button onClick={fn} style={{
              width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',
              background:btnDim,border:`1px solid ${btnBorder}`,color:btnColor,
              fontFamily:'var(--font-data)',fontSize:'12px',fontWeight:700,padding:'10px',
              borderRadius:'8px',cursor:'pointer',transition:'all 0.15s',
            }}
            onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.opacity='0.8'}
            onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.opacity='1'}
            >
              <Download size={14}/>{btnLabel}
            </button>
          </div>
        ))}
      </div>

      {/* Data Preview Table */}
      <div style={{background:'var(--bg-card)',border:'1px solid var(--border-subtle)',borderRadius:'14px',padding:'16px 20px'}}>
        <p style={{fontSize:'10px',color:'var(--text-muted)',fontFamily:'var(--font-data)',letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:'14px'}}>Data Preview</p>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
            <thead>
              <tr>
                {['Patient','Unit','HR Mean','SpO₂','Risk Score','Level'].map(h=>(
                  <th key={h} style={{textAlign:h==='Patient'||h==='Unit'?'left':'right',padding:'8px 12px',color:'var(--text-muted)',fontWeight:400,fontFamily:'var(--font-data)',fontSize:'10px',letterSpacing:'0.5px',borderBottom:'1px solid var(--border-subtle)'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patients.map(p=>{
                const r=results[p.id]
                const tk=getRiskTokens(r?.risk_level)
                return(
                  <tr key={p.id} style={{borderBottom:'1px solid var(--border-subtle)'}}
                    onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background='var(--bg-hover)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background='transparent'}
                  >
                    <td style={{padding:'10px 12px',color:'var(--text-primary)',fontWeight:500}}>{p.name}</td>
                    <td style={{padding:'10px 12px',color:'var(--text-muted)',fontSize:'11px'}}>{p.unit}</td>
                    <td style={{padding:'10px 12px',textAlign:'right',color:'var(--text-secondary)',fontFamily:'var(--font-data)'}}>{p.vitals.heart_rate_mean}</td>
                    <td style={{padding:'10px 12px',textAlign:'right',color:'var(--text-secondary)',fontFamily:'var(--font-data)'}}>{p.vitals.spo2_mean}%</td>
                    <td style={{padding:'10px 12px',textAlign:'right',fontFamily:'var(--font-data)',fontWeight:600,color:tk.color}}>
                      {r?`${(r.risk_score*100).toFixed(1)}%`:'—'}
                    </td>
                    <td style={{padding:'10px 12px',textAlign:'right'}}>
                      {r?(
                        <span style={{fontSize:'10px',fontWeight:600,padding:'3px 8px',borderRadius:'100px',background:tk.dim,border:`1px solid ${tk.border}`,color:tk.color,fontFamily:'var(--font-data)'}}>
                          {r.risk_level}
                        </span>
                      ):(
                        <span style={{fontSize:'10px',color:'var(--text-muted)',fontFamily:'var(--font-data)'}}>N/A</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
