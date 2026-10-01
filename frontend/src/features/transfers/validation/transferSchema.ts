import { z } from 'zod'

function hasAtMostFourDecimalPlaces(value: number) {
  const valueText = String(value)

  if (valueText.includes('e')) {
    return false
  }

  const decimalPart = valueText.split('.')[1]

  return !decimalPart || decimalPart.length <= 4
}

function isValidLocalDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(
    value,
  )

  if (!match) {
    return false
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  const date = new Date(year, month - 1, day)

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

export const transferSchema = z
  .object({
    sourceAccountId: z
      .string()
      .min(1, 'Source account is required')
      .uuid('Select a valid source account'),

    destinationAccountId: z
      .string()
      .min(1, 'Destination account is required')
      .uuid('Select a valid destination account'),

    amount: z
      .number({
        message: 'Amount is required',
      })
      .min(0.0001, 'Amount must be greater than zero')
      .refine(
        hasAtMostFourDecimalPlaces,
        'Amount cannot have more than four decimal places',
      ),

    transactionDate: z
      .string()
      .min(1, 'Transaction date is required')
      .refine(
        isValidLocalDate,
        'Enter a valid transaction date',
      ),

    description: z
      .string()
      .trim()
      .max(
        500,
        'Description must not exceed 500 characters',
      ),
  })
  .superRefine((values, context) => {
    if (
      values.sourceAccountId ===
      values.destinationAccountId
    ) {
      context.addIssue({
        code: 'custom',
        path: ['destinationAccountId'],
        message:
          'Source and destination accounts must be different',
      })
    }
  })

export type TransferFormValues = z.infer<
  typeof transferSchema
>