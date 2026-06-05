'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, CartesianGrid } from 'recharts'

const rocData=[{fpr:0,tpr:0},{fpr:0.05,tpr:0.35},{fpr:0.1,tpr:0.52},{fpr:0.15,tpr:0.63},{fpr:0.2,tpr:0.71},{fpr:0.3,tpr:0.80},{fpr:0.4,tpr:0.87},{fpr:0.5,tpr:0.91},{fpr:0.7,tpr:0.95},{fpr:1,tpr:1}]
const featureImportance=[{feature:'HR Max',importance:0.22},{feature:'BP Sys Min',importance:0.21},{feature:'RR Mean',importance:0.16},{feature:'BP Sys Max',importance:0.15},{feature:'SpO2 Max',importance:0.14},{feature:'HR Min',importance:0.12},{feature:'SpO2 Mean',importance:0.10}]
const metrics=[
  {label:'ROC-AUC',  value:'0.7149', color:'var(--clr-primary)',  desc:'Area under ROC curve'},
  {label:'Precision',value:'0.79',   color:'var(--clr-success)',  desc:'When HIGH predicted, correct 79%'},
  {label:'Recall',   value:'0.63',   color:'var(--clr-warning)',  desc:'Catches 63% of actual HIGH risk'},
  {label:'F1 Score', value:'0.70',   color:'var(--clr-ml)',       desc:'Harmonic mean of P & R'},
  {label:'Accuracy', value:'65%',    color:'var(--clr-info,#3b82f6)', desc:'Overall correct predictions'},
  {label:'Train Size',value:'8,816', color:'var(--text-secondary)',desc:'ICU hourly windows'},
]

const barColors=['#00d4ff','#00b8d9','#009ab8','#007d96','#006175','#004a5a','#003344']
const tooltipStyle={background:'var(--bg-elevated)',border:'1px solid var(--border-default)',borderRadius:'10px',fontSize:'11px'}

export default function ModelPerformance(){
  return(
    <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
      {/* Metrics Grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px'}}>
        {metrics.map((m,i)=>(
          <div key={i} style={{background:'var(--bg-card)',border:'1px solid var(--border-subtle)',borderRadius:'12px',padding:'14px 16px'}}>
            <p style={{fontSize:'10px',color:'var(--text-muted)',fontFamily:'var(--font-data)',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'6px'}}>{m.label}</p>
            <p style={{fontFamily:'var(--font-data)',fontSize:'26px',fontWeight:700,color:m.color,lineHeight:1,marginBottom:'4px'}}>{m.value}</p>
            <p style={{fontSize:'10px',color:'var(--text-muted)',lineHeight:1.4}}>{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
        {/* ROC Curve */}
        <div style={{background:'var(--bg-card)',border:'1px solid var(--border-subtle)',borderRadius:'12px',padding:'16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'14px'}}>
            <span style={{fontSize:'12px',fontFamily:'var(--font-display)',fontWeight:600,color:'var(--text-primary)',textTransform:'uppercase',letterSpacing:'0.5px'}}>ROC Curve</span>
            <span style={{fontSize:'10px',fontFamily:'var(--font-data)',color:'var(--clr-primary)',background:'var(--primary-dim)',border:'1px solid var(--primary-border)',padding:'2px 8px',borderRadius:'100px'}}>AUC = 0.71</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={rocData} margin={{top:4,right:4,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,130,210,0.08)" />
              <XAxis dataKey="fpr" tick={{fill:'#475569',fontSize:10,fontFamily:'var(--font-data)'}} tickLine={false} label={{value:'FPR',position:'insideBottom',fill:'#475569',fontSize:10,dy:8}}/>
              <YAxis tick={{fill:'#475569',fontSize:10,fontFamily:'var(--font-data)'}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={tooltipStyle} labelFormatter={v=>`FPR: ${v}`}/>
              <Line type="monotone" dataKey="tpr" stroke="var(--clr-primary)" dot={false} strokeWidth={2.5} name="TPR" animationDuration={800}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Feature Importance */}
        <div style={{background:'var(--bg-card)',border:'1px solid var(--border-subtle)',borderRadius:'12px',padding:'16px'}}>
          <p style={{fontSize:'12px',fontFamily:'var(--font-display)',fontWeight:600,color:'var(--text-primary)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'14px'}}>Feature Importance</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={featureImportance} layout="vertical" margin={{top:0,right:4,left:0,bottom:0}}>
              <XAxis type="number" tick={{fill:'#475569',fontSize:10,fontFamily:'var(--font-data)'}} axisLine={false} tickLine={false}/>
              <YAxis dataKey="feature" type="category" tick={{fill:'#94a3b8',fontSize:10,fontFamily:'var(--font-data)'}} width={65} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={tooltipStyle} formatter={(v:number)=>`${(v*100).toFixed(0)}%`}/>
              <Bar dataKey="importance" radius={[0,4,4,0]} animationDuration={800}>
                {featureImportance.map((_,i)=>(<Cell key={i} fill={barColors[i]}/>))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Details */}
      <div style={{background:'var(--bg-card)',border:'1px solid var(--border-subtle)',borderRadius:'12px',padding:'16px'}}>
        <p style={{fontSize:'10px',color:'var(--text-muted)',fontFamily:'var(--font-data)',letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:'12px'}}>Model Details</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px'}}>
          {[
            {label:'Algorithm',value:'LightGBM'},{label:'Dataset',value:'MIMIC-IV Demo'},
            {label:'Patients',value:'140 ICU'},{label:'Features',value:'20 vitals'},
            {label:'Pred. Window',value:'6 hours'},{label:'Explainability',value:'SHAP Values'},
            {label:'Estimators',value:'200 trees'},{label:'Learning Rate',value:'0.05'},
          ].map((d,i)=>(
            <div key={i} style={{background:'var(--bg-elevated)',border:'1px solid var(--border-subtle)',borderRadius:'8px',padding:'10px 12px'}}>
              <p style={{fontSize:'10px',color:'var(--text-muted)',fontFamily:'var(--font-data)',marginBottom:'4px'}}>{d.label}</p>
              <p style={{fontSize:'12px',color:'var(--text-primary)',fontWeight:600,fontFamily:'var(--font-data)'}}>{d.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
