import { describe, expect, it } from 'vitest'
import { formatDateOnly, formatMoney } from './formatters'

describe('formatMoney', () => {
  it.each([
    {
      amount: 1234.5,
      currency: 'ZAR',
      expected: 'R\u00a01\u00a0234,50',
    },
    {
      amount: -42.5,
      currency: 'ZAR',
      expected: '-R\u00a042,50',
    },
    {
      amount: 1234.5,
      currency: 'USD',
      expected: 'US$1\u00a0234,50',
    },
    {
      amount: 1234.5,
      currency: 'JPY',
      expected: 'JP¥1\u00a0234,5',
    },
    {
      amount: 1234.5,
      currency: 'KWD',
      expected: 'KWD\u00a01\u00a0234,50',
    },
  ])(
    'preserves $currency formatting for $amount',
    ({ amount, currency, expected }) => {
      expect(formatMoney(amount, currency)).toBe(expected)
    },
  )

  it.each([undefined, ''])(
    'does not invent a currency when given %s',
    (currency) => {
      expect(formatMoney(1234.5, currency)).toBe('1\u00a0234,50')
      expect(formatMoney(0, currency)).toBe('0,00')
    },
  )
})

describe('formatDateOnly', () => {
  it.each([
    { value: '2026-01-01', expected: '01 Jan 2026' },
    { value: '2024-02-29', expected: '29 Feb 2024' },
    { value: '2026-09-06', expected: '06 Sept 2026' },
  ])(
    'preserves the calendar date $value',
    ({ value, expected }) => {
      expect(formatDateOnly(value)).toBe(expected)
    },
  )

  it.each(['not-a-date', '2026-09-06T12:00:00Z'])(
    'rejects %s instead of presenting it as a calendar date',
    (value) => {
      expect(() => formatDateOnly(value)).toThrow(RangeError)
    },
  )
})