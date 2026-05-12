export function getRiskColor(level: string): string {
  if (level === 'HIGH') return '#ef4444'
  if (level === 'MEDIUM') return '#f59e0b'
  return '#22c55e'
}
export function getRiskText(level: string): string {
  if (level === 'HIGH') return 'text-red-400'
  if (level === 'MEDIUM') return 'text-yellow-400'
  return 'text-green-400'
}
