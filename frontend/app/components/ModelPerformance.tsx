'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import modelInfo from '@/lib/model-info.json'

const MODEL_CARD_URL = 'https://github.com/kamal-lochan-sahu/biosignal/blob/main/docs/MODEL_CARD.md'

type Status = 'verified' | 'reported' | 'unknown'

const STATUS_STYLE: Record<Status, { label: string; color: string; bg: string; border: string }> = {
  verified: { label: 'VERIFIED',       color: 'var(--clr-success)', bg: 'var(--success-dim)', border: 'var(--success-border)' },
  reported: { label: 'REPORTED',       color: 'var(--clr-warning)', bg: 'var(--warning-dim)', border: 'var(--warning-border)' },
  unknown:  { label: 'NOT DOCUMENTED', color: 'var(--text-muted)',  bg: 'var(--bg-elevated)', border: 'var(--border-subtle)' },
}

function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_STYLE[status]
  return (
    <span style={{ fontSize: '9px', fontFamily: 'var(--font-data)', letterSpacing: '0.8px', padding: '2px 6px', borderRadius: '100px', color: s.color, background: s.bg, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  )
}

// Reported at training time. The training code and evaluation data are not available, so these cannot be recomputed.
const REPORTED_METRICS = [
  { label: 'ROC-AUC',          value: '0.7149', color: 'var(--clr-primary)',       desc: 'Area under the ROC curve on the reported test set' },
  { label: 'Precision',        value: '0.79',   color: 'var(--clr-success)',       desc: 'Share of predicted positives that were truly positive' },
  { label: 'Recall',           value: '0.63',   color: 'var(--clr-warning)',       desc: 'Share of true positives that were found' },
  { label: 'F1 Score',         value: '0.70',   color: 'var(--clr-ml)',            desc: 'Harmonic mean of precision and recall' },
  { label: 'Accuracy',         value: '65%',    color: 'var(--clr-info,#3b82f6)',  desc: 'Share of all windows classified correctly' },
  { label: 'Training windows', value: '8,816',  color: 'var(--text-secondary)',    desc: 'Reported size of the training split' },
]

const READING_NOTES = [
  'These figures are reported, not recomputed: the training code and test data are not part of this project.',
  'If the train / test split was made per window, windows of the same patient can sit on both sides, which usually makes the scores optimistic.',
  'With about 100 patients in the public demo dataset, any single number is very uncertain.',
  'The model score is a ranking score from a class-balanced model, not a calibrated probability.',
  'A ROC curve is not shown because the data needed to draw it is not available.',
]

const BAR_COLORS = ['#00d4ff', '#00bfe6', '#00a9cc', '#0093b3', '#007d99', '#006780', '#005266', '#003d4d']
const tooltipStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '10px', fontSize: '11px' }

const topFeatures = modelInfo.featureImportanceGain
  .slice(0, 8)
  .map(item => ({ feature: item.feature.replace('_', ' '), share: item.share }))

const DETAILS: { label: string; value: string; status: Status }[] = [
  { label: 'Algorithm',          value: 'LightGBM',                                 status: 'verified' },
  { label: 'Trees',              value: String(modelInfo.nTrees),                   status: 'verified' },
  { label: 'Learning rate',      value: String(modelInfo.learningRate),             status: 'verified' },
  { label: 'Max depth',          value: String(modelInfo.maxDepth),                 status: 'verified' },
  { label: 'Class weight',       value: String(modelInfo.classWeight),              status: 'verified' },
  { label: 'Input features',     value: `${modelInfo.nFeatures} vital statistics`,  status: 'verified' },
  { label: 'Explainability',     value: 'SHAP TreeExplainer',                       status: 'verified' },
  { label: 'Dataset',            value: 'MIMIC-IV Demo (100 patients)',             status: 'reported' },
  { label: 'Label / horizon',    value: 'Not documented',                           status: 'unknown' },
  { label: 'Train / test split', value: 'Not documented',                           status: 'unknown' },
  { label: 'Calibration',        value: 'None (ranking score)',                     status: 'verified' },
  { label: 'Model file',         value: `sha256 ${modelInfo.sha256Prefix}\u2026`,   status: 'verified' },
]

const card = { background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px' } as const
const heading = { fontSize: '12px', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' } as const

export default function ModelPerformance() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Honesty notice */}
      <div role="note" style={{ background: 'var(--warning-dim)', border: '1px solid var(--warning-border)', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        <strong style={{ color: 'var(--clr-warning)' }}>Reported figures, not re-measured.</strong>{' '}
        The numbers below were reported at training time and cannot be reproduced from this project.
        Feature importance and model details are read from the deployed model.{' '}
        <a href={MODEL_CARD_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--clr-primary)', textDecoration: 'underline' }}>Read the model card</a>.
      </div>

      {/* Reported metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
        {REPORTED_METRICS.map(m => (
          <div key={m.label} style={{ ...card, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '6px' }}>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)', letterSpacing: '1px', textTransform: 'uppercase' }}>{m.label}</p>
              <StatusBadge status="reported" />
            </div>
            <p style={{ fontFamily: 'var(--font-data)', fontSize: '26px', fontWeight: 700, color: m.color, lineHeight: 1, marginBottom: '4px' }}>{m.value}</p>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Reading notes + feature importance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={card}>
          <p style={{ ...heading, marginBottom: '12px' }}>How to read these numbers</p>
          <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'disc' }}>
            {READING_NOTES.map(note => (
              <li key={note} style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{note}</li>
            ))}
          </ul>
        </div>

        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '14px' }}>
            <p style={heading}>Feature importance (gain)</p>
            <StatusBadge status="verified" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topFeatures} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <XAxis type="number" tickFormatter={v => `${Math.round(Number(v) * 100)}%`} tick={{ fill: '#475569', fontSize: 10, fontFamily: 'var(--font-data)' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="feature" type="category" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'var(--font-data)' }} width={125} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => `${(Number(v) * 100).toFixed(1)}% of total gain`} />
              <Bar dataKey="share" radius={[0, 4, 4, 0]} animationDuration={800}>
                {topFeatures.map((item, i) => <Cell key={item.feature} fill={BAR_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Share of the total split gain across the {modelInfo.nTrees} trees; top 8 of {modelInfo.nFeatures} features. Importance describes the model, not clinical causes.
          </p>
        </div>
      </div>

      {/* Model details */}
      <div style={card}>
        <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px' }}>Model details</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
          {DETAILS.map(d => (
            <div key={d.label} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '10px 12px' }}>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-data)', marginBottom: '4px' }}>{d.label}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-data)', marginBottom: '6px' }}>{d.value}</p>
              <StatusBadge status={d.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
