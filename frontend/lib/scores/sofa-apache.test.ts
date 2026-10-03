import { describe, expect, it } from 'vitest'
import {
  apacheAge,
  apacheAaGradient,
  apacheAaGradientPoints,
  apacheChronic,
  apacheCreatinine,
  apacheHeartRate,
  apacheHematocrit,
  apacheMap,
  apacheMortalityPercent,
  apacheOxygenation,
  apachePh,
  apachePotassium,
  apacheRespiratoryRate,
  apacheSodium,
  apacheTemperature,
  apacheWbc,
  calculateApache2,
  calculateSofa,
  sofaCardiovascular,
  sofaCoagulation,
  sofaLiver,
  sofaMortalityBand,
  sofaNeurological,
  sofaRenal,
  sofaRespiratory,
  type Apache2Input,
  type SofaInput,
} from './index'

const rows = <T,>(fn: (x: T) => number, data: [T, number][]) => {
  for (const [input, expected] of data) {
    it(`${String(input)} -> ${expected}`, () => expect(fn(input)).toBe(expected))
  }
}

// ---------------------------------------------------------------- SOFA
describe('SOFA respiration (needs support for 3 and 4)', () => {
  rows((x: number) => sofaRespiratory(x, false), [[450, 0], [400, 0], [399, 1], [300, 1], [299, 2], [150, 2], [50, 2]])
  rows((x: number) => sofaRespiratory(x, true), [[400, 0], [399, 1], [299, 2], [200, 2], [199, 3], [100, 3], [99, 4], [50, 4]])
})

describe('SOFA coagulation', () => {
  rows(sofaCoagulation, [[200, 0], [150, 0], [149, 1], [100, 1], [99, 2], [50, 2], [49, 3], [20, 3], [19, 4]])
})

describe('SOFA liver', () => {
  rows(sofaLiver, [[1.1, 0], [1.2, 1], [1.9, 1], [2.0, 2], [5.9, 2], [6.0, 3], [11.9, 3], [12.0, 4], [20, 4]])
})

describe('SOFA cardiovascular', () => {
  it('uses MAP when no vasopressor is given', () => {
    expect(sofaCardiovascular(70, 'none')).toBe(0)
    expect(sofaCardiovascular(90, 'none')).toBe(0)
    expect(sofaCardiovascular(69, 'none')).toBe(1)
  })
  it('scores vasopressor tiers regardless of MAP', () => {
    expect(sofaCardiovascular(90, 'low')).toBe(2)
    expect(sofaCardiovascular(90, 'medium')).toBe(3)
    expect(sofaCardiovascular(90, 'high')).toBe(4)
  })
})

describe('SOFA neurological (GCS)', () => {
  rows(sofaNeurological, [[15, 0], [14, 1], [13, 1], [12, 2], [10, 2], [9, 3], [6, 3], [5, 4], [3, 4]])
})

describe('SOFA renal', () => {
  rows((c: number) => sofaRenal(c), [[1.1, 0], [1.2, 1], [1.9, 1], [2.0, 2], [3.4, 2], [3.5, 3], [4.9, 3], [5.0, 4]])
  it('uses urine output when it is worse than creatinine', () => {
    expect(sofaRenal(1.0, 600)).toBe(0)
    expect(sofaRenal(1.0, 450)).toBe(3)
    expect(sofaRenal(1.0, 150)).toBe(4)
    expect(sofaRenal(2.0, 150)).toBe(4)
    expect(sofaRenal(3.5, 1500)).toBe(3)
  })
})

describe('calculateSofa', () => {
  const normal: SofaInput = {
    pao2Fio2: 450, respiratorySupport: false, platelets: 250, bilirubin: 0.8, map: 85,
    vasopressor: 'none', gcs: 15, creatinine: 0.9, urineOutputMl: 1500,
  }
  it('scores a normal patient as 0', () => {
    expect(calculateSofa(normal).total).toBe(0)
  })
  it('reaches the maximum of 24', () => {
    const r = calculateSofa({
      pao2Fio2: 50, respiratorySupport: true, platelets: 10, bilirubin: 15, map: 40,
      vasopressor: 'high', gcs: 3, creatinine: 6, urineOutputMl: 100,
    })
    expect(r.total).toBe(24)
    expect(r.parameters).toHaveLength(6)
  })
  it('does not give respiration 3 without support', () => {
    expect(calculateSofa({ ...normal, pao2Fio2: 150 }).total).toBe(2)
    expect(calculateSofa({ ...normal, pao2Fio2: 150, respiratorySupport: true }).total).toBe(3)
  })
  it('rejects non-finite input', () => {
    expect(() => calculateSofa({ ...normal, platelets: Number.NaN })).toThrow(RangeError)
  })
})

describe('sofaMortalityBand', () => {
  it('maps total scores to the published ranges', () => {
    expect(sofaMortalityBand(0)).toBe('<10%')
    expect(sofaMortalityBand(6)).toBe('<10%')
    expect(sofaMortalityBand(7)).toBe('~15-20%')
    expect(sofaMortalityBand(9)).toBe('~15-20%')
    expect(sofaMortalityBand(10)).toBe('40-50%')
    expect(sofaMortalityBand(12)).toBe('40-50%')
    expect(sofaMortalityBand(13)).toBe('50-60%')
    expect(sofaMortalityBand(14)).toBe('50-60%')
    expect(sofaMortalityBand(15)).toBe('>80%')
  })
})

// ---------------------------------------------------------------- APACHE II
describe('APACHE II temperature', () => {
  rows(apacheTemperature, [[42, 4], [41, 4], [40.9, 3], [39, 3], [38.9, 1], [38.5, 1], [38.4, 0], [36, 0], [35.9, 1], [34, 1], [33.9, 2], [32, 2], [31.9, 3], [30, 3], [29.9, 4]])
})

describe('APACHE II MAP', () => {
  rows(apacheMap, [[160, 4], [159, 3], [130, 3], [129, 2], [110, 2], [109, 0], [70, 0], [69, 2], [50, 2], [49, 4]])
})

describe('APACHE II heart rate', () => {
  rows(apacheHeartRate, [[180, 4], [179, 3], [140, 3], [139, 2], [110, 2], [109, 0], [70, 0], [69, 2], [55, 2], [54, 3], [40, 3], [39, 4]])
})

describe('APACHE II respiratory rate', () => {
  rows(apacheRespiratoryRate, [[50, 4], [49, 3], [35, 3], [34, 1], [25, 1], [24, 0], [12, 0], [11, 1], [10, 1], [9, 2], [6, 2], [5, 4]])
})

describe('APACHE II oxygenation', () => {
  it('uses PaO2 when FiO2 < 0.5', () => {
    expect(apacheOxygenation(0.4, 71, 40)).toBe(0)
    expect(apacheOxygenation(0.4, 70, 40)).toBe(1)
    expect(apacheOxygenation(0.4, 61, 40)).toBe(1)
    expect(apacheOxygenation(0.4, 60, 40)).toBe(3)
    expect(apacheOxygenation(0.4, 55, 40)).toBe(3)
    expect(apacheOxygenation(0.4, 54, 40)).toBe(4)
  })
  it('uses the A-aDO2 gradient when FiO2 >= 0.5', () => {
    expect(apacheAaGradient(1, 100, 40)).toBeCloseTo(713 - 50 - 100, 6)
    expect(apacheOxygenation(0.8, 60, 40)).toBe(3) // A-aDO2 about 460
    expect(apacheOxygenation(0.5, 100, 40)).toBe(2) // A-aDO2 about 206
    expect(apacheOxygenation(0.5, 200, 40)).toBe(0) // gradient below 200
  })
  rows(apacheAaGradientPoints, [[600, 4], [500, 4], [499, 3], [350, 3], [349, 2], [200, 2], [199, 0], [50, 0]])
})

describe('APACHE II pH', () => {
  rows(apachePh, [[7.7, 4], [7.69, 3], [7.6, 3], [7.59, 1], [7.5, 1], [7.49, 0], [7.33, 0], [7.32, 2], [7.25, 2], [7.24, 3], [7.15, 3], [7.14, 4], [7.145, 4]])
})

describe('APACHE II sodium', () => {
  rows(apacheSodium, [[185, 4], [180, 4], [179, 3], [160, 3], [159, 2], [155, 2], [154, 1], [150, 1], [149, 0], [130, 0], [129, 2], [120, 2], [119, 3], [111, 3], [110, 4]])
})

describe('APACHE II potassium', () => {
  rows(apachePotassium, [[7, 4], [6.9, 3], [6, 3], [5.9, 1], [5.5, 1], [5.4, 0], [3.5, 0], [3.4, 1], [3, 1], [2.9, 2], [2.5, 2], [2.4, 4]])
})

describe('APACHE II creatinine', () => {
  rows((c: number) => apacheCreatinine(c, false), [[3.5, 4], [3.4, 3], [2, 3], [1.9, 2], [1.5, 2], [1.4, 0], [0.6, 0], [0.5, 2]])
  it('doubles the points for acute renal failure', () => {
    expect(apacheCreatinine(2.5, true)).toBe(6)
    expect(apacheCreatinine(3.5, true)).toBe(8)
    expect(apacheCreatinine(1.0, true)).toBe(0)
  })
})

describe('APACHE II hematocrit', () => {
  rows(apacheHematocrit, [[60, 4], [59.9, 2], [50, 2], [49.9, 1], [46, 1], [45.9, 0], [30, 0], [29.9, 2], [20, 2], [19.9, 4]])
})

describe('APACHE II WBC', () => {
  rows(apacheWbc, [[40, 4], [39.9, 2], [20, 2], [19.9, 1], [15, 1], [14.9, 0], [3, 0], [2.9, 2], [1, 2], [0.9, 4]])
})

describe('APACHE II age and chronic health points', () => {
  rows(apacheAge, [[30, 0], [44, 0], [45, 2], [54, 2], [55, 3], [64, 3], [65, 5], [74, 5], [75, 6], [90, 6]])
  it('gives 5 points for non-operative or emergency post-op, 2 for elective post-op', () => {
    expect(apacheChronic(true, 'nonoperative')).toBe(5)
    expect(apacheChronic(true, 'emergency_postop')).toBe(5)
    expect(apacheChronic(true, 'elective_postop')).toBe(2)
    expect(apacheChronic(false, 'nonoperative')).toBe(0)
    expect(apacheChronic(false, 'elective_postop')).toBe(0)
  })
})

describe('calculateApache2', () => {
  const normal: Apache2Input = {
    temperature: 37, map: 90, heartRate: 85, respiratoryRate: 16, fio2: 0.4, pao2: 90, paco2: 40,
    ph: 7.4, sodium: 140, potassium: 4, creatinine: 1, acuteRenalFailure: false, hematocrit: 38,
    wbc: 8, gcs: 15, age: 50, chronicHealth: false, admission: 'nonoperative',
  }

  it('scores a normal 50-year-old as 2 (age points only)', () => {
    const r = calculateApache2(normal)
    expect(r.acutePhysiology).toBe(0)
    expect(r.agePoints).toBe(2)
    expect(r.total).toBe(2)
  })

  it('adds up a deranged patient (acute physiology 24, age 5, total 29)', () => {
    const r = calculateApache2({
      temperature: 38.9, map: 65, heartRate: 130, respiratoryRate: 30, fio2: 0.8, pao2: 60, paco2: 40,
      ph: 7.25, sodium: 138, potassium: 5.6, creatinine: 2.5, acuteRenalFailure: true, hematocrit: 32,
      wbc: 18, gcs: 10, age: 70, chronicHealth: false, admission: 'nonoperative',
    })
    expect(r.acutePhysiology).toBe(24)
    expect(r.agePoints).toBe(5)
    expect(r.chronicPoints).toBe(0)
    expect(r.total).toBe(29)
  })

  it('adds chronic health points', () => {
    expect(calculateApache2({ ...normal, chronicHealth: true }).total).toBe(7)
    expect(calculateApache2({ ...normal, chronicHealth: true, admission: 'elective_postop' }).total).toBe(4)
  })

  it('rejects non-finite input', () => {
    expect(() => calculateApache2({ ...normal, ph: Number.NaN })).toThrow(RangeError)
  })
})

describe('apacheMortalityPercent', () => {
  it('follows the base logistic model and increases with the score', () => {
    expect(apacheMortalityPercent(0)).toBeCloseTo(2.9, 0)
    expect(apacheMortalityPercent(20)).toBeCloseTo(35.5, 0)
    expect(apacheMortalityPercent(29)).toBeCloseTo(67.2, 0)
    let prev = -1
    for (let s = 0; s <= 71; s++) {
      const p = apacheMortalityPercent(s)
      expect(p).toBeGreaterThanOrEqual(prev)
      prev = p
    }
  })
})
