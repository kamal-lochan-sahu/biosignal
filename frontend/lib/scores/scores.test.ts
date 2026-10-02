import { describe, expect, it } from 'vitest'
import {
  calculateMap,
  calculateNews2,
  calculateQsofa,
  scoreHeartRate,
  scoreRespiratoryRate,
  scoreSpo2Scale1,
  scoreSpo2Scale2,
  scoreSystolicBp,
  scoreTemperature,
  type News2Input,
} from './index'

const table = <T,>(fn: (x: T) => number, rows: [T, number][]) => {
  for (const [input, expected] of rows) {
    it(`${String(input)} -> ${expected}`, () => expect(fn(input)).toBe(expected))
  }
}

// Reference values: RCP NEWS2 chart (2017).
describe('NEWS2 respiratory rate', () => {
  table(scoreRespiratoryRate, [[6, 3], [8, 3], [9, 1], [11, 1], [12, 0], [20, 0], [21, 2], [24, 2], [25, 3], [40, 3]])
})

describe('NEWS2 SpO2 Scale 1', () => {
  table(scoreSpo2Scale1, [[85, 3], [91, 3], [92, 2], [93, 2], [94, 1], [95, 1], [96, 0], [100, 0]])
})

describe('NEWS2 SpO2 Scale 2 on air', () => {
  table((s: number) => scoreSpo2Scale2(s, false), [[83, 3], [84, 2], [85, 2], [86, 1], [87, 1], [88, 0], [92, 0], [93, 0], [99, 0]])
})

describe('NEWS2 SpO2 Scale 2 on oxygen', () => {
  table((s: number) => scoreSpo2Scale2(s, true), [[92, 0], [93, 1], [94, 1], [95, 2], [96, 2], [97, 3], [100, 3]])
})

describe('NEWS2 systolic BP', () => {
  table(scoreSystolicBp, [[80, 3], [90, 3], [91, 2], [100, 2], [101, 1], [110, 1], [111, 0], [219, 0], [220, 3]])
})

describe('NEWS2 heart rate', () => {
  table(scoreHeartRate, [[30, 3], [40, 3], [41, 1], [50, 1], [51, 0], [90, 0], [91, 1], [110, 1], [111, 2], [130, 2], [131, 3]])
})

describe('NEWS2 temperature', () => {
  table(scoreTemperature, [[34.0, 3], [35.0, 3], [35.1, 1], [36.0, 1], [36.1, 0], [38.0, 0], [38.1, 1], [39.0, 1], [39.1, 2], [41, 2]])
})

const normal: News2Input = {
  respiratoryRate: 16, spo2: 98, onOxygen: false, systolicBp: 120,
  heartRate: 70, temperature: 37.0, consciousness: 'alert',
}

describe('calculateNews2', () => {
  it('scores a normal patient as 0 / NORMAL', () => {
    const r = calculateNews2(normal)
    expect(r.total).toBe(0)
    expect(r.level).toBe('NORMAL')
    expect(r.singleRed).toBe(false)
  })

  it('reaches the documented maximum of 20 / HIGH', () => {
    const r = calculateNews2({ respiratoryRate: 30, spo2: 80, onOxygen: true, systolicBp: 80, heartRate: 140, temperature: 34, consciousness: 'cvpu' })
    expect(r.total).toBe(20)
    expect(r.level).toBe('HIGH')
    expect(r.parameters.reduce((s, p) => s + p.max, 0)).toBe(20)
  })

  it('flags a single red score (3 in one parameter) as LOW_MEDIUM', () => {
    const r = calculateNews2({ ...normal, heartRate: 40 })
    expect(r.total).toBe(3)
    expect(r.singleRed).toBe(true)
    expect(r.level).toBe('LOW_MEDIUM')
  })

  it('classifies a total of 1-4 without a red score as LOW', () => {
    const r = calculateNews2({ ...normal, heartRate: 100 })
    expect(r.total).toBe(1)
    expect(r.level).toBe('LOW')
  })

  it('classifies a total of 5-6 as MEDIUM', () => {
    // RR 22 (2) + HR 100 (1) + SBP 105 (1) + temp 38.5 (1) = 5
    const r = calculateNews2({ ...normal, respiratoryRate: 22, heartRate: 100, systolicBp: 105, temperature: 38.5 })
    expect(r.total).toBe(5)
    expect(r.level).toBe('MEDIUM')
  })

  it('classifies a total of 7 or more as HIGH', () => {
    // RR 22 (2) + HR 120 (2) + SBP 95 (2) + temp 38.5 (1) = 7
    const r = calculateNews2({ ...normal, respiratoryRate: 22, heartRate: 120, systolicBp: 95, temperature: 38.5 })
    expect(r.total).toBe(7)
    expect(r.level).toBe('HIGH')
  })

  it('scores SpO2 90% as 3 on Scale 1 but 0 on Scale 2', () => {
    expect(calculateNews2({ ...normal, spo2: 90 }).total).toBe(3)
    expect(calculateNews2({ ...normal, spo2: 90, spo2Scale: 2 }).total).toBe(0)
  })

  it('adds 2 points for supplemental oxygen', () => {
    expect(calculateNews2({ ...normal, onOxygen: true }).total).toBe(2)
  })

  it('rejects non-finite input', () => {
    expect(() => calculateNews2({ ...normal, respiratoryRate: Number.NaN })).toThrow(RangeError)
  })
})

describe('calculateQsofa', () => {
  it('is 0 / LOW for normal values', () => {
    expect(calculateQsofa({ respiratoryRate: 16, systolicBp: 120, gcs: 15 })).toMatchObject({ score: 0, level: 'LOW' })
  })
  it('scores the thresholds RR >= 22 and SBP <= 100', () => {
    expect(calculateQsofa({ respiratoryRate: 22, systolicBp: 100 })).toMatchObject({ score: 2, level: 'HIGH' })
    expect(calculateQsofa({ respiratoryRate: 21, systolicBp: 101 }).score).toBe(0)
  })
  it('counts GCS below 15 as altered mentation', () => {
    expect(calculateQsofa({ respiratoryRate: 16, systolicBp: 120, gcs: 14 })).toMatchObject({ score: 1, level: 'WATCH' })
  })
})

describe('calculateMap', () => {
  it('computes (SBP + 2 x DBP) / 3', () => {
    expect(calculateMap(120, 80)).toEqual({ map: 93, status: 'NORMAL' })
    expect(calculateMap(90, 50)).toEqual({ map: 63, status: 'CRITICAL' })
  })
})
