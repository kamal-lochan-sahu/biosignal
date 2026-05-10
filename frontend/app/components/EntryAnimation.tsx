'use client'
import { useEffect, useState } from 'react'

export default function EntryAnimation() {
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 2000)
    const t2 = setTimeout(() => setVisible(false), 2600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (!visible) return null

  return (
    <div className={`fixed inset-0 z-[9999] bg-gray-950 flex flex-col items-center justify-center transition-opacity duration-600 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="flex flex-col items-center gap-6">
        <img src="/biosignal-logo.svg" alt="BioSignal" className="w-20 h-20 animate-pulse" />
        <div>
          <h1 className="text-4xl font-black text-white text-center">BioSignal</h1>
          <p className="text-gray-400 text-center mt-1 text-sm">ICU Early Warning System — Powered by ML</p>
        </div>
        <svg viewBox="0 0 200 60" className="w-64 h-16" xmlns="http://www.w3.org/2000/svg">
          <polyline
            points="0,30 30,30 40,10 50,50 60,20 70,35 85,5 100,55 115,25 125,30 155,30 200,30"
            fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className="ecg-line"
          />
          <style>{`
            .ecg-line {
              stroke-dasharray: 400;
              stroke-dashoffset: 400;
              animation: draw 1.5s ease forwards;
            }
            @keyframes draw {
              to { stroke-dashoffset: 0; }
            }
          `}</style>
        </svg>
        <div className="flex gap-1.5 mt-2">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
