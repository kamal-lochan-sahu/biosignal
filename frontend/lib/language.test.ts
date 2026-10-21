import { describe, expect, it } from 'vitest'
import { firstSupportedLanguage, readStored, writeStored } from './language'

const SUPPORTED = ['en', 'hi', 'te', 'ta', 'pt', 'zh', 'de', 'or'] as const

describe('firstSupportedLanguage', () => {
  it('picks the first supported non-excluded language', () => {
    expect(firstSupportedLanguage(['hi-IN', 'en-US'], SUPPORTED, 'en')).toBe('hi')
    expect(firstSupportedLanguage(['en-US', 'te'], SUPPORTED, 'en')).toBe('te')
  })

  it('matches on the primary subtag, ignoring case, region, script and underscores', () => {
    expect(firstSupportedLanguage(['pt-BR'], SUPPORTED)).toBe('pt')
    expect(firstSupportedLanguage(['zh-Hans-CN'], SUPPORTED)).toBe('zh')
    expect(firstSupportedLanguage(['DE-at'], SUPPORTED)).toBe('de')
    expect(firstSupportedLanguage(['ta_IN'], SUPPORTED)).toBe('ta')
    expect(firstSupportedLanguage([' or-IN '], SUPPORTED)).toBe('or')
  })

  it('returns undefined when nothing matches', () => {
    expect(firstSupportedLanguage(['en-GB'], SUPPORTED, 'en')).toBeUndefined()
    expect(firstSupportedLanguage(['xx', 'yy-ZZ'], SUPPORTED)).toBeUndefined()
    expect(firstSupportedLanguage([], SUPPORTED)).toBeUndefined()
  })

  it('does not match inherited object keys or partial codes', () => {
    expect(firstSupportedLanguage(['constructor', 'toString', 'h'], SUPPORTED)).toBeUndefined()
  })
})

describe('storage helpers', () => {
  it('never throw when localStorage is not available (node has no window)', () => {
    expect(readStored('biosignal-lang')).toBeNull()
    expect(() => writeStored('biosignal-lang', 'hi')).not.toThrow()
  })
})
