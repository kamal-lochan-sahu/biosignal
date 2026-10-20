import { describe, expect, it } from 'vitest'
import modelInfo from './model-info.json'

describe('model-info.json (generated from the deployed model)', () => {
  it('describes the LightGBM model with 20 features', () => {
    expect(modelInfo.estimator).toBe('LGBMClassifier')
    expect(modelInfo.nFeatures).toBe(20)
    expect(modelInfo.featureImportanceGain).toHaveLength(20)
  })

  it('has feature importance shares that sum to 1 and are ranked', () => {
    const shares = modelInfo.featureImportanceGain.map(item => item.share)
    expect(shares.reduce((sum, share) => sum + share, 0)).toBeCloseTo(1, 2)
    expect(shares).toEqual([...shares].sort((a, b) => b - a))
  })
})
