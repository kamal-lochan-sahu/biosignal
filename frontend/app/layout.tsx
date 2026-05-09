import type { Metadata } from 'next'
import './globals.css'
import KeepAlive from '@/app/components/KeepAlive'

export const metadata: Metadata = {
  title: 'BioSignal — ICU Early Warning System',
  description: 'ML-powered ICU patient deterioration prediction',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white antialiased">
        <KeepAlive />
        <div className="bg-yellow-950/60 border-b border-yellow-800/50 px-4 py-2 text-center">
          <p className="text-xs text-yellow-400">
            ⚠️ <strong>Demo Only</strong> — BioSignal uses simulated patient data trained on MIMIC-IV.
            Not intended for clinical use. Do not use for real medical decisions.
          </p>
        </div>
        {children}
      </body>
    </html>
  )
}
