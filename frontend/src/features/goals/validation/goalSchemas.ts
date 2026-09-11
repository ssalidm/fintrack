import { z } from 'zod'

export const goalCurrencies = [
  'ZAR',
  'USD',
  'EUR',
  'GBP',
] as const

const validAmount = z
  .number()
  .finite('Enter a valid amount')
  .positive(
    'Amount must be greater than zero',
  )
  .refine(
    (value) =>
      value < 1_000_000_000_000_000,
    'Amount is too large',
  )
  .refine(
    (value) =>
      Number.isInteger(value * 10_000),
    'Use no more than four decimal places',
  )

export const goalFormSchema = z.object({
  name: z
    .string()
    .max(
      100,
      'Name must not exceed 100 characters',
    )
    .refine(
      (value) => value.trim().length > 0,
      {
        message: 'Goal name is required',
      },
    ),

  description: z
    .string()
    .max(
      500,
      'Description must not exceed 500 characters',
    ),

  currencyCode: z.enum(goalCurrencies),

  targetAmount: validAmount,

  targetDate: z.string(),
})

export type GoalFormValues = z.infer<
  typeof goalFormSchema
>

export const contributionFormSchema =
  z.object({
    amount: validAmount,

    contributionDate: z
      .string()
      .min(
        1,
        'Contribution date is required',
      ),

    note: z
      .string()
      .max(
        500,
        'Note must not exceed 500 characters',
      ),
  })

export type ContributionFormValues =
  z.infer<
    typeof contributionFormSchema
  >

export const voidContributionSchema =
  z.object({
    reason: z
      .string()
      .max(
        255,
        'Reason must not exceed 255 characters',
      )
      .refine(
        (value) =>
          value.trim().length > 0,
        {
          message:
            'A reason is required',
        },
      ),
  })

export type VoidContributionFormValues =
  z.infer<
    typeof voidContributionSchema
  >