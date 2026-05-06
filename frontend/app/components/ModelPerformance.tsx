'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'

const rocData = [
  { fpr: 0, tpr: 0 }, { fpr: 0.05, tpr: 0.35 }, { fpr: 0.1, tpr: 0.52 },
  { fpr: 0.15, tpr: 0.63 }, { fpr: 0.2, tpr: 0.71 }, { fpr: 0.3, tpr: 0.80 },
  { fpr: 0.4, tpr: 0.87 }, { fpr: 0.5, tpr: 0.91 }, { fpr: 0.7, tpr: 0.95 },
  { fpr: 1, tpr: 1 }
]

const featureImportance = [
  { feature: 'HR Max', importance: 0.22 },
  { feature: 'BP Sys Min', importance: 0.21 },
  { feature: 'RR Mean', importance: 0.16 },
  { feature: 'BP Sys Max', importance: 0.15 },
  { feature: 'SpO2 Max', influence: 0.14, importance: 0.14 },
  { feature: 'HR Min', importance: 0.12 },
  { feature: 'SpO2 Mean', importance: 0.10 },
]

const metrics = [
  { label: 'ROC-AUC', value: '0.7149', color: 'text-blue-400', desc: 'Area under ROC curve' },
  { label: 'Precision', value: '0.79', color: 'text-green-400', desc: 'When HIGH predicted, correct 79%' },
  { label: 'Recall', value: '0.63', color: 'text-yellow-400', desc: 'Catches 63% of actual HIGH risk' },
  { label: 'F1 Score', value: '0.70', color: 'text-purple-400', desc: 'Harmonic mean of P & R' },
  { label: 'Accuracy', value: '65%', color: 'text-teal-400', desc: 'Overall correct predictions' },
  { label: 'Train Size', value: '8,816', color: 'text-gray-400', desc: 'ICU hourly windows' },
]

export default function ModelPerformance() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {metrics.map((m, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-500">{m.label}</p>
            <p className={`text-2xl font-black mt-1 ${m.color}`}>{m.value}</p>
            <p className="text-xs text-gray-600 mt-1">{m.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">ROC Curve (AUC = 0.71)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={rocData}>
              <XAxis dataKey="fpr" tick={{ fill: '#6b7280', fontSize: 10 }} label={{ value: 'FPR', position: 'bottom', fill: '#6b7280', fontSize: 10 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
              <Line type="monotone" dataKey="tpr" stroke="#60a5fa" dot={false} strokeWidth={2} name="TPR" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Feature Importance</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={featureImportance} layout="vertical">
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} />
              <YAxis dataKey="feature" type="category" tick={{ fill: '#9ca3af', fontSize: 10 }} width={60} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
              <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                {featureImportance.map((_, i) => (
                  <Cell key={i} fill={`hsl(${220 - i * 15}, 70%, 60%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Model Details</p>
        <div className="grid grid-cols-4 gap-3 text-xs">
          {[
            { label: 'Algorithm', value: 'LightGBM' },
            { label: 'Dataset', value: 'MIMIC-IV Demo' },
            { label: 'Patients', value: '140 ICU' },
            { label: 'Features', value: '20 vitals' },
            { label: 'Prediction Window', value: '6 hours' },
            { label: 'Explainability', value: 'SHAP Values' },
            { label: 'Estimators', value: '200 trees' },
            { label: 'Learning Rate', value: '0.05' },
          ].map((d, i) => (
            <div key={i} className="bg-gray-800 rounded p-2">
              <p className="text-gray-500">{d.label}</p>
              <p className="text-white font-semibold mt-0.5">{d.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
