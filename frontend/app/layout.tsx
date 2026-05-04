import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = {
  title: 'BioSignal — ICU Early Warning System',
  description: 'ML-powered ICU patient deterioration prediction',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white antialiased">{children}</body>
    </html>
  )
}
