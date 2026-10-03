/**
 * SOFA - Sequential (Sepsis-related) Organ Failure Assessment (Vincent et al., 1996).
 *
 * Table checked against several published reproductions of the original score
 * (Vincent 1996, Crit Care 1999 review, SOFA reviews / clinical-trial protocols).
 * Notes:
 *  - Respiration scores of 3 and 4 require respiratory support (ventilation / CPAP).
 *  - Cardiovascular uses vasopressor doses when present, otherwise MAP < 70 mmHg.
 *  - Renal uses the worse of creatinine and urine output (when urine output is known).
 *  - Exactly-on-the-line values (bilirubin 12.0, creatinine 5.0) follow the original table: highest tier.
 *
 * Research / demo use only - not a certified medical device.
 */

/**
 * Vasopressor tiers (doses in ug/kg/min):
 *  low    = dopamine <= 5, or dobutamine (any dose)
 *  medium = dopamine 5.1-15, or epinephrine <= 0.1, or norepinephrine <= 0.1
 *  high   = dopamine > 15, or epinephrine > 0.1, or norepinephrine > 0.1
 */
export type VasopressorLevel = 'none' | 'low' | 'medium' | 'high'

export interface SofaInput {
  pao2Fio2: number // mmHg
  respiratorySupport: boolean // mechanical ventilation / CPAP
  platelets: number // x10^3 / uL
  bilirubin: number // mg/dL
  map: number // mmHg
  vasopressor: VasopressorLevel
  gcs: number // 3-15
  creatinine: number // mg/dL
  urineOutputMl?: number // mL/day, optional
}

export type SofaOrgan = 'respiratory' | 'coagulation' | 'liver' | 'cardiovascular' | 'neurological' | 'renal'

export interface SofaParameter {
  organ: SofaOrgan
  label: string
  display: string
  score: number // 0-4
}

export interface SofaResult {
  total: number // 0-24
  parameters: SofaParameter[]
  mortalityBand: string
}

export const SOFA_MORTALITY_NOTE =
  'Approximate ICU mortality for the highest SOFA score during a stay (Vincent 1998, Ferreira 2001). SOFA is not a validated predictor for an individual patient.'

export function sofaRespiratory(pao2Fio2: number, support: boolean): number {
  if (support && pao2Fio2 < 100) return 4
  if (support && pao2Fio2 < 200) return 3
  if (pao2Fio2 < 300) return 2
  if (pao2Fio2 < 400) return 1
  return 0
}

export function sofaCoagulation(platelets: number): number {
  if (platelets < 20) return 4
  if (platelets < 50) return 3
  if (platelets < 100) return 2
  if (platelets < 150) return 1
  return 0
}

export function sofaLiver(bilirubin: number): number {
  if (bilirubin >= 12) return 4
  if (bilirubin >= 6) return 3
  if (bilirubin >= 2) return 2
  if (bilirubin >= 1.2) return 1
  return 0
}

export function sofaCardiovascular(map: number, vasopressor: VasopressorLevel): number {
  if (vasopressor === 'high') return 4
  if (vasopressor === 'medium') return 3
  if (vasopressor === 'low') return 2
  return map < 70 ? 1 : 0
}

export function sofaNeurological(gcs: number): number {
  if (gcs < 6) return 4
  if (gcs < 10) return 3
  if (gcs < 13) return 2
  if (gcs < 15) return 1
  return 0
}

export function sofaRenal(creatinine: number, urineOutputMl?: number): number {
  let byCreatinine = 0
  if (creatinine >= 5) byCreatinine = 4
  else if (creatinine >= 3.5) byCreatinine = 3
  else if (creatinine >= 2) byCreatinine = 2
  else if (creatinine >= 1.2) byCreatinine = 1

  let byUrine = 0
  if (urineOutputMl !== undefined) {
    if (urineOutputMl < 200) byUrine = 4
    else if (urineOutputMl < 500) byUrine = 3
  }
  return Math.max(byCreatinine, byUrine)
}

/** Rough ICU mortality bands by maximum SOFA score. The 7-9 band is the widely quoted 15-20%. */
export function sofaMortalityBand(total: number): string {
  if (total <= 6) return '<10%'
  if (total <= 9) return '~15-20%'
  if (total <= 12) return '40-50%'
  if (total <= 14) return '50-60%'
  return '>80%'
}

const VASOPRESSOR_TEXT: Record<VasopressorLevel, string> = {
  none: 'none',
  low: 'low-dose',
  medium: 'medium-dose',
  high: 'high-dose',
}

function assertFinite(name: string, value: number): void {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be a finite number`)
}

export function calculateSofa(input: SofaInput): SofaResult {
  assertFinite('pao2Fio2', input.pao2Fio2)
  assertFinite('platelets', input.platelets)
  assertFinite('bilirubin', input.bilirubin)
  assertFinite('map', input.map)
  assertFinite('gcs', input.gcs)
  assertFinite('creatinine', input.creatinine)
  if (input.urineOutputMl !== undefined) assertFinite('urineOutputMl', input.urineOutputMl)

  const parameters: SofaParameter[] = [
    {
      organ: 'respiratory',
      label: 'Respiration',
      display: `PaO\u2082/FiO\u2082: ${input.pao2Fio2}${input.respiratorySupport ? ' (support)' : ''}`,
      score: sofaRespiratory(input.pao2Fio2, input.respiratorySupport),
    },
    {
      organ: 'coagulation',
      label: 'Coagulation',
      display: `Platelets: ${input.platelets}K`,
      score: sofaCoagulation(input.platelets),
    },
    {
      organ: 'liver',
      label: 'Liver',
      display: `Bilirubin: ${input.bilirubin} mg/dL`,
      score: sofaLiver(input.bilirubin),
    },
    {
      organ: 'cardiovascular',
      label: 'Cardiovascular',
      display: input.vasopressor === 'none' ? `MAP: ${input.map} mmHg` : `Vasopressor: ${VASOPRESSOR_TEXT[input.vasopressor]}`,
      score: sofaCardiovascular(input.map, input.vasopressor),
    },
    {
      organ: 'neurological',
      label: 'Neurological',
      display: `GCS: ${input.gcs}`,
      score: sofaNeurological(input.gcs),
    },
    {
      organ: 'renal',
      label: 'Renal',
      display: `Creatinine: ${input.creatinine} mg/dL`,
      score: sofaRenal(input.creatinine, input.urineOutputMl),
    },
  ]

  const total = parameters.reduce((sum, p) => sum + p.score, 0)
  return { total, parameters, mortalityBand: sofaMortalityBand(total) }
}
