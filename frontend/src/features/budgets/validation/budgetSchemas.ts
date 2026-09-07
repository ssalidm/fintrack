import {z} from 'zod'

export const budgetCurrencies = [
  'ZAR',
  'USD',
  'EUR',
  'GBP',
] as const

const validBudgetAmount = z
  .number({
    message: 'Limit amount is required',
  })
  .finite('Enter a valid limit amount')
  .positive(
    'Limit amount must be greater than zero',
  )
  .refine(
    (value) =>
      value < 1_000_000_000_000_000,
    'Limit amount is too large',
  )
  .refine(
    (value) =>
      Number.isInteger(value * 10_000),
    'Use no more than four decimal places',
  )

export const budgetFormSchema = z.object({
  name: z
    .string()
    .max(
      100,
      'Name must not exceed 100 characters',
    )
    .refine(
      (value) => value.trim().length > 0,
      {
        message: 'Budget name is required',
      },
    ),

  budgetMonth: z
    .string()
    .regex(
      /^\d{4}-(0[1-9]|1[0-2])$/,
      'Choose a valid budget month',
    ),

  currencyCode: z.enum(
    budgetCurrencies,
    {
      message: 'Currency is required',
    },
  ),
})

export type BudgetFormValues = z.infer<
  typeof budgetFormSchema
>

export const budgetNameSchema = z.object({
  name: budgetFormSchema.shape.name,
})

export type BudgetNameFormValues =
  z.infer<typeof budgetNameSchema>

export const budgetLimitSchema = z.object({
  categoryId: z
    .string()
    .min(
      1,
      'Expense category is required',
    ),

  limitAmount: validBudgetAmount,
})

export type BudgetLimitFormValues =
  z.infer<typeof budgetLimitSchema>