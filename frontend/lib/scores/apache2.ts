/**
 * APACHE II - Acute Physiology and Chronic Health Evaluation II (Knaus et al., Crit Care Med 1985).
 *
 * APACHE II = Acute Physiology Score (12 variables, worst value in the first 24 h)
 *           + age points (0-6) + chronic health points (0, 2 or 5).
 *
 * Thresholds follow the Knaus table (checked against the published table in clinical-trial
 * protocols and the SFAR scoring page). Bands are written as continuous thresholds so decimal
 * readings (for example pH 7.145) can never fall into a gap between the printed ranges.
 *
 * Notes:
 *  - Oxygenation uses A-aDO2 when FiO2 >= 0.5 and PaO2 when FiO2 < 0.5.
 *    A-aDO2 = FiO2 x 713 - PaCO2 / 0.8 - PaO2 (sea level, respiratory quotient 0.8).
 *  - Creatinine points are doubled for acute renal failure.
 *  - Chronic health points: 5 for non-operative or emergency post-operative patients, 2 for
 *    elective post-operative patients, only if severe organ insufficiency or immunocompromise
 *    was present before admission.
 *  - Mortality is the base logistic model (-3.517 + 0.146 x score) without the diagnostic-category weight.
 *
 * Research / demo use only - not a certified medical device.
 */

export type ApacheAdmission = 'nonoperative' | 'emergency_postop' | 'elective_postop'

export interface Apache2Input {
  temperature: number // core, degrees C
  map: number // mmHg
  heartRate: number // /min
  respiratoryRate: number // /min
  fio2: number // 0.21 - 1.0
  pao2: number // mmHg
  paco2: number // mmHg (needed for A-aDO2 when FiO2 >= 0.5)
  ph: number
  sodium: number // mmol/L
  potassium: number // mmol/L
  creatinine: number // mg/dL
  acuteRenalFailure: boolean
  hematocrit: number // %
  wbc: number // x10^3 / uL
  gcs: number // 3-15
  age: number // years
  chronicHealth: boolean // severe organ insufficiency / immunocompromised before admission
  admission: ApacheAdmission
}

export interface Apache2Result {
  acutePhysiology: number // 0-60
  agePoints: number
  chronicPoints: number
  total: number // 0-71
  mortalityPercent: number
}

export function apacheTemperature(t: number): number {
  if (t >= 41) return 4
  if (t >= 39) return 3
  if (t >= 38.5) return 1
  if (t >= 36) return 0
  if (t >= 34) return 1
  if (t >= 32) return 2
  if (t >= 30) return 3
  return 4
}

export function apacheMap(map: number): number {
  if (map >= 160) return 4
  if (map >= 130) return 3
  if (map >= 110) return 2
  if (map >= 70) return 0
  if (map >= 50) return 2
  return 4
}

export function apacheHeartRate(hr: number): number {
  if (hr >= 180) return 4
  if (hr >= 140) return 3
  if (hr >= 110) return 2
  if (hr >= 70) return 0
  if (hr >= 55) return 2
  if (hr >= 40) return 3
  return 4
}

export function apacheRespiratoryRate(rr: number): number {
  if (rr >= 50) return 4
  if (rr >= 35) return 3
  if (rr >= 25) return 1
  if (rr >= 12) return 0
  if (rr >= 10) return 1
  if (rr >= 6) return 2
  return 4
}

/** Alveolar-arterial oxygen gradient at sea level (PB 760, PH2O 47, RQ 0.8). */
export function apacheAaGradient(fio2: number, pao2: number, paco2: number): number {
  return fio2 * 713 - paco2 / 0.8 - pao2
}

export function apacheAaGradientPoints(aa: number): number {
  if (aa >= 500) return 4
  if (aa >= 350) return 3
  if (aa >= 200) return 2
  return 0
}

export function apachePao2Points(pao2: number): number {
  if (pao2 > 70) return 0
  if (pao2 >= 61) return 1
  if (pao2 >= 55) return 3
  return 4
}

export function apacheOxygenation(fio2: number, pao2: number, paco2: number): number {
  return fio2 >= 0.5 ? apacheAaGradientPoints(apacheAaGradient(fio2, pao2, paco2)) : apachePao2Points(pao2)
}

export function apachePh(ph: number): number {
  if (ph >= 7.7) return 4
  if (ph >= 7.6) return 3
  if (ph >= 7.5) return 1
  if (ph >= 7.33) return 0
  if (ph >= 7.25) return 2
  if (ph >= 7.15) return 3
  return 4
}

export function apacheSodium(na: number): number {
  if (na >= 180) return 4
  if (na >= 160) return 3
  if (na >= 155) return 2
  if (na >= 150) return 1
  if (na >= 130) return 0
  if (na >= 120) return 2
  if (na >= 111) return 3
  return 4
}

export function apachePotassium(k: number): number {
  if (k >= 7) return 4
  if (k >= 6) return 3
  if (k >= 5.5) return 1
  if (k >= 3.5) return 0
  if (k >= 3) return 1
  if (k >= 2.5) return 2
  return 4
}

export function apacheCreatinine(creatinine: number, acuteRenalFailure: boolean): number {
  let points: number
  if (creatinine >= 3.5) points = 4
  else if (creatinine >= 2) points = 3
  else if (creatinine >= 1.5) points = 2
  else if (creatinine >= 0.6) points = 0
  else points = 2
  return acuteRenalFailure ? points * 2 : points
}

export function apacheHematocrit(hct: number): number {
  if (hct >= 60) return 4
  if (hct >= 50) return 2
  if (hct >= 46) return 1
  if (hct >= 30) return 0
  if (hct >= 20) return 2
  return 4
}

export function apacheWbc(wbc: number): number {
  if (wbc >= 40) return 4
  if (wbc >= 20) return 2
  if (wbc >= 15) return 1
  if (wbc >= 3) return 0
  if (wbc >= 1) return 2
  return 4
}

export function apacheGcs(gcs: number): number {
  return 15 - gcs
}

export function apacheAge(age: number): number {
  if (age >= 75) return 6
  if (age >= 65) return 5
  if (age >= 55) return 3
  if (age >= 45) return 2
  return 0
}

export function apacheChronic(chronicHealth: boolean, admission: ApacheAdmission): number {
  if (!chronicHealth) return 0
  return admission === 'elective_postop' ? 2 : 5
}

/** Base-model predicted hospital mortality in percent (one decimal). */
export function apacheMortalityPercent(total: number): number {
  const logit = -3.517 + 0.146 * total
  const p = 1 / (1 + Math.exp(-logit))
  return Math.round(p * 1000) / 10
}

function assertFinite(name: string, value: number): void {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be a finite number`)
}

export function calculateApache2(input: Apache2Input): Apache2Result {
  const numeric: [string, number][] = [
    ['temperature', input.temperature], ['map', input.map], ['heartRate', input.heartRate],
    ['respiratoryRate', input.respiratoryRate], ['fio2', input.fio2], ['pao2', input.pao2],
    ['paco2', input.paco2], ['ph', input.ph], ['sodium', input.sodium], ['potassium', input.potassium],
    ['creatinine', input.creatinine], ['hematocrit', input.hematocrit], ['wbc', input.wbc],
    ['gcs', input.gcs], ['age', input.age],
  ]
  for (const [name, value] of numeric) assertFinite(name, value)

  const acutePhysiology =
    apacheTemperature(input.temperature) +
    apacheMap(input.map) +
    apacheHeartRate(input.heartRate) +
    apacheRespiratoryRate(input.respiratoryRate) +
    apacheOxygenation(input.fio2, input.pao2, input.paco2) +
    apachePh(input.ph) +
    apacheSodium(input.sodium) +
    apachePotassium(input.potassium) +
    apacheCreatinine(input.creatinine, input.acuteRenalFailure) +
    apacheHematocrit(input.hematocrit) +
    apacheWbc(input.wbc) +
    apacheGcs(input.gcs)

  const agePoints = apacheAge(input.age)
  const chronicPoints = apacheChronic(input.chronicHealth, input.admission)
  const total = acutePhysiology + agePoints + chronicPoints
  return { acutePhysiology, agePoints, chronicPoints, total, mortalityPercent: apacheMortalityPercent(total) }
}
