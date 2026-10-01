import {
  describe,
  expect,
  it,
} from 'vitest'
import {recurringTransactionSchema} from './recurringTransactionSchema'

const validSchedule = {
  accountId:
    '13be4e80-df18-4a97-a673-5ea68b46c900',
  categoryId:
    'ef5272dc-e1e1-45d9-8f28-a20cfa5be67e',
  name: 'Monthly rent',
  transactionType: 'EXPENSE' as const,
  amount: 8500,
  description: '',
  merchantName: 'Property manager',
  frequency: 'MONTHLY' as const,
  intervalCount: 1,
  startDate: '2026-09-06',
  endDate: '',
  autoPost: false,
  catchUpMode: 'START_FROM_CURRENT' as const,
}

describe('recurringTransactionSchema', () => {
  it('accepts a valid recurring transaction', () => {
    expect(
      recurringTransactionSchema.safeParse(
        validSchedule,
      ).success,
    ).toBe(true)
  })

  it('rejects an empty name', () => {
    const result =
      recurringTransactionSchema.safeParse({
        ...validSchedule,
        name: '   ',
      })

    expect(result.success).toBe(false)
  })

  it('rejects a zero amount', () => {
    const result =
      recurringTransactionSchema.safeParse({
        ...validSchedule,
        amount: 0,
      })

    expect(result.success).toBe(false)
  })

  it('rejects more than four decimal places', () => {
    const result =
      recurringTransactionSchema.safeParse({
        ...validSchedule,
        amount: 10.12345,
      })

    expect(result.success).toBe(false)
  })

  it('rejects an interval below one', () => {
    const result =
      recurringTransactionSchema.safeParse({
        ...validSchedule,
        intervalCount: 0,
      })

    expect(result.success).toBe(false)
  })

  it('rejects an interval above 365', () => {
    const result =
      recurringTransactionSchema.safeParse({
        ...validSchedule,
        intervalCount: 366,
      })

    expect(result.success).toBe(false)
  })

  it('rejects an invalid start date', () => {
    const result =
      recurringTransactionSchema.safeParse({
        ...validSchedule,
        startDate: '31/02/2026',
      })

    expect(result.success).toBe(false)
  })

  it('rejects an end date before the start date', () => {
    const result =
      recurringTransactionSchema.safeParse({
        ...validSchedule,
        startDate: '2026-09-06',
        endDate: '2026-09-05',
      })

    expect(result.success).toBe(false)
  })

  it('rejects an invalid account identifier', () => {
    const result =
      recurringTransactionSchema.safeParse({
        ...validSchedule,
        accountId: 'not-an-account-id',
      })

    expect(result.success).toBe(false)
  })
})