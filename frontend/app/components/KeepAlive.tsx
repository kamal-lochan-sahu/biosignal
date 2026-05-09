'use client'
import { useEffect, useState } from 'react'

const BACKEND_URL = 'https://biosignal-api.onrender.com'
const PING_INTERVAL = 10 * 60 * 1000

export default function KeepAlive() {
  const [status, setStatus] = useState<'ok' | 'pinging' | 'error'>('ok')

  useEffect(() => {
    const ping = async () => {
      setStatus('pinging')
      try {
        await fetch(`${BACKEND_URL}/health`, { method: 'GET', mode: 'no-cors' })
        setStatus('ok')
      } catch {
        setStatus('error')
      }
    }
    ping()
    const interval = setInterval(ping, PING_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed bottom-3 right-3 z-50 flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-full px-3 py-1 text-xs text-gray-500">
      <div className={`w-1.5 h-1.5 rounded-full ${status === 'ok' ? 'bg-green-400 animate-pulse' : status === 'pinging' ? 'bg-yellow-400' : 'bg-red-400'}`} />
      {status === 'ok' ? 'Backend Live' : status === 'pinging' ? 'Pinging...' : 'Reconnecting'}
    </div>
  )
}
