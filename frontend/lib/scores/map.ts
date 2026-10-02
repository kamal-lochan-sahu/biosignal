/** Mean arterial pressure: MAP = (SBP + 2 x DBP) / 3, rounded to a whole mmHg. */

export type MapStatus = 'CRITICAL' | 'LOW' | 'NORMAL' | 'ELEVATED'

export interface MapResult {
  map: number
  status: MapStatus
}

export function calculateMap(systolic: number, diastolic: number): MapResult {
  if (!Number.isFinite(systolic) || !Number.isFinite(diastolic)) {
    throw new RangeError('systolic and diastolic must be finite numbers')
  }
  const map = Math.round((systolic + 2 * diastolic) / 3)
  const status: MapStatus = map < 65 ? 'CRITICAL' : map < 70 ? 'LOW' : map < 100 ? 'NORMAL' : 'ELEVATED'
  return { map, status }
}
