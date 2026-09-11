import {z} from 'zod'

function isValidLocalDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const [year, month, day] =
    value.split('-').map(Number)

  const date = new Date(year, month - 1, day)

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

function hasAtMostFourDecimalPlaces(value: number) {
  const valueAsText = value.toString()

  if (!valueAsText.includes('.')) {
    return true
  }

  return valueAsText.split('.')[1].length <= 4
}

export const recurringTransactionSchema = z
  .object({
    accountId: z
      .string()
      .min(1, 'Choose an account.')
      .uuid('Choose a valid account.'),

    categoryId: z
      .string()
      .min(1, 'Choose a category.')
      .uuid('Choose a valid category.'),

    name: z
      .string()
      .trim()
      .min(1, 'Enter a schedule name.')
      .max(
        100,
        'The name cannot exceed 100 characters.',
      ),

    transactionType: z.enum([
      'INCOME',
      'EXPENSE',
    ]),

    amount: z
      .number({
        error: 'Enter a valid amount.',
      })
      .min(
        0.0001,
        'The amount must be greater than zero.',
      )
      .refine(
        hasAtMostFourDecimalPlaces,
        'The amount can have at most four decimal places.',
      ),

    description: z
      .string()
      .max(
        500,
        'The description cannot exceed 500 characters.',
      ),

    merchantName: z
      .string()
      .max(
        200,
        'The merchant name cannot exceed 200 characters.',
      ),

    frequency: z.enum([
      'DAILY',
      'WEEKLY',
      'MONTHLY',
      'YEARLY',
    ]),

    intervalCount: z
      .number({
        error: 'Enter a valid interval.',
      })
      .int('The interval must be a whole number.')
      .min(1, 'The interval must be at least 1.')
      .max(
        365,
        'The interval cannot exceed 365.',
      ),

    startDate: z
      .string()
      .min(1, 'Choose a start date.')
      .refine(
        isValidLocalDate,
        'Choose a valid start date.',
      ),

    endDate: z
      .string()
      .refine(
        (value) =>
          value.length === 0 ||
          isValidLocalDate(value),
        'Choose a valid end date.',
      ),

    autoPost: z.boolean(),

    catchUpMode: z.enum([
      'GENERATE_MISSED',
      'START_FROM_CURRENT',
    ]),
  })
  .superRefine((values, context) => {
    if (
      values.endDate &&
      values.startDate &&
      values.endDate < values.startDate
    ) {
      context.addIssue({
        code: 'custom',
        path: ['endDate'],
        message:
          'The end date must be on or after the start date.',
      })
    }
  })

export type RecurringTransactionFormValues =
  z.infer<typeof recurringTransactionSchema>