/**
 * qSOFA - quick Sequential Organ Failure Assessment (Sepsis-3, 2016).
 * One point each for: respiratory rate >= 22/min, systolic BP <= 100 mmHg,
 * altered mentation (GCS < 15). A score of 2 or more flags a higher risk of a poor
 * outcome and should prompt further sepsis evaluation. It is a screening aid, not a diagnosis.
 */

export type QsofaLevel = 'LOW' | 'WATCH' | 'HIGH'

export interface QsofaInput {
  respiratoryRate: number
  systolicBp: number
  gcs?: number // defaults to 15 when unknown
  alteredMentation?: boolean // overrides gcs when provided
}

export interface QsofaResult {
  score: number // 0-3
  level: QsofaLevel
  criteria: { respiratoryRate: boolean; lowSystolicBp: boolean; alteredMentation: boolean }
}

export const QSOFA_LABELS: Record<QsofaLevel, string> = {
  LOW: 'LOW',
  WATCH: 'WATCH',
  HIGH: 'SEPSIS RISK',
}

export function calculateQsofa(input: QsofaInput): QsofaResult {
  if (!Number.isFinite(input.respiratoryRate)) throw new RangeError('respiratoryRate must be a finite number')
  if (!Number.isFinite(input.systolicBp)) throw new RangeError('systolicBp must be a finite number')

  const altered = input.alteredMentation ?? (input.gcs ?? 15) < 15
  const criteria = {
    respiratoryRate: input.respiratoryRate >= 22,
    lowSystolicBp: input.systolicBp <= 100,
    alteredMentation: altered,
  }
  const score = Number(criteria.respiratoryRate) + Number(criteria.lowSystolicBp) + Number(criteria.alteredMentation)
  const level: QsofaLevel = score >= 2 ? 'HIGH' : score === 1 ? 'WATCH' : 'LOW'
  return { score, level, criteria }
}
