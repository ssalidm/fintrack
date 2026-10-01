import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  contributionFormSchema,
  goalFormSchema,
  voidContributionSchema,
} from './goalSchemas'

describe('goalFormSchema', () => {
  const validGoal = {
    name: 'Rainy day fund',
    description:
      'A little breathing room',
    currencyCode: 'ZAR' as const,
    targetAmount: 25_000,
    targetDate: '2027-06-30',
  }

  it('accepts a valid savings goal', () => {
    expect(
      goalFormSchema.safeParse(validGoal)
        .success,
    ).toBe(true)
  })

  it('allows an optional description and target date', () => {
    expect(
      goalFormSchema.safeParse({
        ...validGoal,
        description: '',
        targetDate: '',
      }).success,
    ).toBe(true)
  })

  it('rejects a blank name', () => {
    expect(
      goalFormSchema.safeParse({
        ...validGoal,
        name: '   ',
      }).success,
    ).toBe(false)
  })

  it('rejects a zero target amount', () => {
    expect(
      goalFormSchema.safeParse({
        ...validGoal,
        targetAmount: 0,
      }).success,
    ).toBe(false)
  })

  it('rejects more than four decimal places', () => {
    expect(
      goalFormSchema.safeParse({
        ...validGoal,
        targetAmount: 100.12345,
      }).success,
    ).toBe(false)
  })
})

describe('contributionFormSchema', () => {
  it('accepts a valid contribution', () => {
    expect(
      contributionFormSchema.safeParse({
        amount: 500,
        contributionDate:
          '2026-09-07',
        note: 'September contribution',
      }).success,
    ).toBe(true)
  })

  it('rejects a missing contribution date', () => {
    expect(
      contributionFormSchema.safeParse({
        amount: 500,
        contributionDate: '',
        note: '',
      }).success,
    ).toBe(false)
  })

  it('rejects negative contributions', () => {
    expect(
      contributionFormSchema.safeParse({
        amount: -10,
        contributionDate:
          '2026-09-07',
        note: '',
      }).success,
    ).toBe(false)
  })
})

describe('voidContributionSchema', () => {
  it('accepts a valid void reason', () => {
    expect(
      voidContributionSchema.safeParse({
        reason: 'Contribution entered twice',
      }).success,
    ).toBe(true)
  })

  it('rejects a blank void reason', () => {
    expect(
      voidContributionSchema.safeParse({
        reason: '   ',
      }).success,
    ).toBe(false)
  })

  it('rejects reasons longer than 255 characters', () => {
    expect(
      voidContributionSchema.safeParse({
        reason: 'a'.repeat(256),
      }).success,
    ).toBe(false)
  })
})