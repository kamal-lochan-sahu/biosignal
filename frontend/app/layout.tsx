import type { Metadata } from 'next'
import { Outfit, DM_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import KeepAlive from '@/app/components/KeepAlive'
import { LanguageProvider } from '@/app/components/LanguageToggle'
import EntryAnimation from '@/app/components/EntryAnimation'

const outfit  = Outfit({ subsets:['latin'], variable:'--font-outfit',  weight:['300','400','500','600','700'], display:'swap' })
const dmSans  = DM_Sans({ subsets:['latin'], variable:'--font-dm-sans', weight:['300','400','500'], display:'swap' })
const ibmMono = IBM_Plex_Mono({ subsets:['latin'], variable:'--font-ibm-mono', weight:['400','500','600'], display:'swap' })

export const metadata: Metadata = {
  title: 'BioSignal — ICU Early Warning System',
  description: 'ML-powered ICU patient deterioration prediction system with SHAP explainability, trained on MIMIC-IV data.',
  icons: { icon:'/favicon.svg', apple:'/favicon.svg' },
  manifest: '/manifest.json',
  openGraph: {
    title:'BioSignal — ICU Early Warning System',
    description:'Real-time ML predictions for ICU patient deterioration. Built with LightGBM, FastAPI, and Next.js.',
    url:'https://biosignal-puce.vercel.app', siteName:'BioSignal',
    images:[{url:'https://biosignal-puce.vercel.app/og-image.png',width:1200,height:630,alt:'BioSignal ICU Early Warning System'}],
    type:'website',
  },
  twitter: { card:'summary_large_image', title:'BioSignal — ICU Early Warning System', description:'ML-powered ICU patient deterioration prediction.', images:['https://biosignal-puce.vercel.app/og-image.png'] },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`bg-gray-950 text-white antialiased ${outfit.variable} ${dmSans.variable} ${ibmMono.variable}`}>
        <LanguageProvider>
          <EntryAnimation />
          <KeepAlive />
          <div className="bg-yellow-950/60 border-b border-yellow-800/50 px-4 py-2 text-center">
            <p className="text-xs text-yellow-400">⚠️ <strong>Demo Only</strong> — BioSignal uses simulated patient data trained on MIMIC-IV. Not intended for clinical use.</p>
          </div>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
