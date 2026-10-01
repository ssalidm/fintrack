import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  budgetFormSchema,
  budgetLimitSchema,
  budgetNameSchema,
} from './budgetSchemas'

describe('budgetFormSchema', () => {
  const validBudget = {
    name: 'September plan',
    budgetMonth: '2026-09',
    currencyCode: 'ZAR' as const,
  }

  it('accepts a valid monthly budget', () => {
    expect(
      budgetFormSchema.safeParse(
        validBudget,
      ).success,
    ).toBe(true)
  })

  it('rejects a blank budget name', () => {
    expect(
      budgetFormSchema.safeParse({
        ...validBudget,
        name: '   ',
      }).success,
    ).toBe(false)
  })

  it('rejects an invalid month', () => {
    expect(
      budgetFormSchema.safeParse({
        ...validBudget,
        budgetMonth: '2026-13',
      }).success,
    ).toBe(false)
  })
})

describe('budgetNameSchema', () => {
  it('accepts a concise budget name', () => {
    expect(
      budgetNameSchema.safeParse({
        name: 'Household plan',
      }).success,
    ).toBe(true)
  })
})

describe('budgetLimitSchema', () => {
  const validLimit = {
    categoryId:
      'a9b12863-15c4-4db9-b56c-790461b53088',
    limitAmount: 2_500,
  }

  it('accepts a valid category limit', () => {
    expect(
      budgetLimitSchema.safeParse(
        validLimit,
      ).success,
    ).toBe(true)
  })

  it('rejects an empty category', () => {
    expect(
      budgetLimitSchema.safeParse({
        ...validLimit,
        categoryId: '',
      }).success,
    ).toBe(false)
  })

  it('rejects a zero limit', () => {
    expect(
      budgetLimitSchema.safeParse({
        ...validLimit,
        limitAmount: 0,
      }).success,
    ).toBe(false)
  })

  it('rejects more than four decimal places', () => {
    expect(
      budgetLimitSchema.safeParse({
        ...validLimit,
        limitAmount: 100.12345,
      }).success,
    ).toBe(false)
  })
})