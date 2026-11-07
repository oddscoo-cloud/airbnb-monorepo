import { describe, expect, it } from 'vitest'
import { formatPrice } from './formatPrice'

describe('formatPrice', () => {
  it('rounds prices to whole numbers', () => {
    expect(formatPrice(980.8499999999999)).toBe('981')
    expect(formatPrice(980.4)).toBe('980')
  })

  it('groups thousands without adding decimal places', () => {
    expect(formatPrice(1200)).toBe('1,200')
  })
})
