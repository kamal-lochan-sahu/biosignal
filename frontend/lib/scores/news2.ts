/**
 * NEWS2 - National Early Warning Score 2 (Royal College of Physicians, 2017).
 *
 * Thresholds follow the RCP NEWS2 chart (SpO2 Scale 1 for most patients,
 * Scale 2 only for patients with confirmed hypercapnic respiratory failure,
 * decided by a clinician). Measurements are rounded to the precision used on the
 * chart (whole numbers; temperature to 0.1 C) before scoring.
 *
 * Research / demo use only - this is not a certified medical device.
 */

export type Consciousness = 'alert' | 'cvpu' // CVPU = new confusion, Voice, Pain, Unresponsive
export type Spo2Scale = 1 | 2
export type News2Level = 'NORMAL' | 'LOW' | 'LOW_MEDIUM' | 'MEDIUM' | 'HIGH'

export interface News2Input {
  respiratoryRate: number // breaths/min
  spo2: number // %
  onOxygen: boolean // any supplemental oxygen / ventilatory support
  systolicBp: number // mmHg
  heartRate: number // beats/min
  temperature: number // degrees C
  consciousness: Consciousness
  spo2Scale?: Spo2Scale // default 1
}

export interface News2Parameter {
  key: 'respiratoryRate' | 'spo2' | 'oxygen' | 'systolicBp' | 'heartRate' | 'temperature' | 'consciousness'
  label: string
  display: string
  score: number
  max: number
}

export interface News2Result {
  total: number // 0-20
  level: News2Level
  singleRed: boolean // a score of 3 in any single parameter
  parameters: News2Parameter[]
  response: string
}

export const NEWS2_LABELS: Record<News2Level, string> = {
  NORMAL: 'NORMAL',
  LOW: 'LOW RISK',
  LOW_MEDIUM: 'LOW-MEDIUM RISK',
  MEDIUM: 'MEDIUM RISK',
  HIGH: 'HIGH RISK',
}

export const NEWS2_SHORT: Record<News2Level, string> = {
  NORMAL: 'NORMAL',
  LOW: 'LOW',
  LOW_MEDIUM: 'LOW-MEDIUM',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
}

const RESPONSES: Record<News2Level, string> = {
  NORMAL: 'Continue routine monitoring (at least 12-hourly).',
  LOW: 'Nurse assessment; decide monitoring frequency (at least 4-6 hourly).',
  LOW_MEDIUM: 'Single red score: inform the medical team for urgent review; monitor at least hourly.',
  MEDIUM: 'Urgent response: clinician review and monitoring at least hourly.',
  HIGH: 'Emergency response: continuous monitoring and critical-care assessment.',
}

// ---- Individual parameter scores (each one is exported so it can be unit-tested) ----

export function scoreRespiratoryRate(rr: number): number {
  const v = Math.round(rr)
  if (v <= 8) return 3
  if (v <= 11) return 1
  if (v <= 20) return 0
  if (v <= 24) return 2
  return 3
}

/** SpO2 Scale 1 - default for all patients without confirmed hypercapnic respiratory failure. */
export function scoreSpo2Scale1(spo2: number): number {
  const v = Math.round(spo2)
  if (v <= 91) return 3
  if (v <= 93) return 2
  if (v <= 95) return 1
  return 0
}

/** SpO2 Scale 2 - only for a target range of 88-92% (hypercapnic respiratory failure). */
export function scoreSpo2Scale2(spo2: number, onOxygen: boolean): number {
  const v = Math.round(spo2)
  if (v <= 83) return 3
  if (v <= 85) return 2
  if (v <= 87) return 1
  if (v <= 92) return 0
  if (!onOxygen) return 0 // 93 or more on air
  if (v <= 94) return 1
  if (v <= 96) return 2
  return 3
}

export function scoreSupplementalOxygen(onOxygen: boolean): number {
  return onOxygen ? 2 : 0
}

export function scoreSystolicBp(sbp: number): number {
  const v = Math.round(sbp)
  if (v <= 90) return 3
  if (v <= 100) return 2
  if (v <= 110) return 1
  if (v <= 219) return 0
  return 3
}

export function scoreHeartRate(hr: number): number {
  const v = Math.round(hr)
  if (v <= 40) return 3
  if (v <= 50) return 1
  if (v <= 90) return 0
  if (v <= 110) return 1
  if (v <= 130) return 2
  return 3
}

export function scoreTemperature(temp: number): number {
  const v = Math.round(temp * 10) / 10
  if (v <= 35.0) return 3
  if (v <= 36.0) return 1
  if (v <= 38.0) return 0
  if (v <= 39.0) return 1
  return 2
}

export function scoreConsciousness(c: Consciousness): number {
  return c === 'alert' ? 0 : 3
}

function assertFinite(name: string, value: number): void {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be a finite number`)
}

function levelFor(total: number, singleRed: boolean): News2Level {
  if (total >= 7) return 'HIGH'
  if (total >= 5) return 'MEDIUM'
  if (singleRed) return 'LOW_MEDIUM'
  return total === 0 ? 'NORMAL' : 'LOW'
}

export function calculateNews2(input: News2Input): News2Result {
  assertFinite('respiratoryRate', input.respiratoryRate)
  assertFinite('spo2', input.spo2)
  assertFinite('systolicBp', input.systolicBp)
  assertFinite('heartRate', input.heartRate)
  assertFinite('temperature', input.temperature)

  const scale: Spo2Scale = input.spo2Scale ?? 1
  const spo2Score =
    scale === 2 ? scoreSpo2Scale2(input.spo2, input.onOxygen) : scoreSpo2Scale1(input.spo2)

  const parameters: News2Parameter[] = [
    { key: 'respiratoryRate', label: 'Respiratory Rate', display: `${Math.round(input.respiratoryRate)}/min`, score: scoreRespiratoryRate(input.respiratoryRate), max: 3 },
    { key: 'spo2', label: `SpO\u2082 (Scale ${scale})`, display: `${Math.round(input.spo2)}%`, score: spo2Score, max: 3 },
    { key: 'oxygen', label: 'Supplemental O\u2082', display: input.onOxygen ? 'Yes' : 'No', score: scoreSupplementalOxygen(input.onOxygen), max: 2 },
    { key: 'systolicBp', label: 'BP Systolic', display: `${Math.round(input.systolicBp)} mmHg`, score: scoreSystolicBp(input.systolicBp), max: 3 },
    { key: 'heartRate', label: 'Heart Rate', display: `${Math.round(input.heartRate)} bpm`, score: scoreHeartRate(input.heartRate), max: 3 },
    { key: 'temperature', label: 'Temperature', display: `${(Math.round(input.temperature * 10) / 10).toFixed(1)}\u00b0C`, score: scoreTemperature(input.temperature), max: 3 },
    { key: 'consciousness', label: 'Consciousness', display: input.consciousness === 'alert' ? 'Alert' : 'CVPU', score: scoreConsciousness(input.consciousness), max: 3 },
  ]

  const total = parameters.reduce((sum, p) => sum + p.score, 0)
  const singleRed = parameters.some(p => p.score === 3)
  const level = levelFor(total, singleRed)
  return { total, level, singleRed, parameters, response: RESPONSES[level] }
}
