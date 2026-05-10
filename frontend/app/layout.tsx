import type { Metadata } from 'next'
import './globals.css'
import KeepAlive from '@/app/components/KeepAlive'
import { LanguageProvider } from '@/app/components/LanguageToggle'
import EntryAnimation from '@/app/components/EntryAnimation'

export const metadata: Metadata = {
  title: 'BioSignal — ICU Early Warning System',
  description: 'ML-powered ICU patient deterioration prediction system with SHAP explainability, trained on MIMIC-IV data.',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  openGraph: {
    title: 'BioSignal — ICU Early Warning System',
    description: 'Real-time ML predictions for ICU patient deterioration. Built with LightGBM, FastAPI, and Next.js.',
    url: 'https://biosignal-seven.vercel.app',
    siteName: 'BioSignal',
    images: [
      {
        url: 'https://biosignal-seven.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BioSignal ICU Early Warning System',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BioSignal — ICU Early Warning System',
    description: 'ML-powered ICU patient deterioration prediction.',
    images: ['https://biosignal-seven.vercel.app/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white antialiased">
        <LanguageProvider>
        <EntryAnimation />
        <KeepAlive />
        <div className="bg-yellow-950/60 border-b border-yellow-800/50 px-4 py-2 text-center">
          <p className="text-xs text-yellow-400">
            ⚠️ <strong>Demo Only</strong> — BioSignal uses simulated patient data trained on MIMIC-IV.
            Not intended for clinical use. Do not use for real medical decisions.
          </p>
        </div>
        {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
