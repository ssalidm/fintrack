import { z } from 'zod'

export const manualTransactionTypes = [
  'INCOME',
  'EXPENSE',
] as const

export const transactionFormSchema = z.object({
  accountId: z.string().uuid('Choose an account'),

  categoryId: z.string().uuid('Choose a category'),

  transactionType: z.enum(manualTransactionTypes),

  amount: z
    .number()
    .finite('Enter a valid amount')
    .min(0.0001, 'Amount must be greater than zero')
    .refine(
      (value) => Math.abs(value) < 1_000_000_000_000_000,
      'Amount is too large',
    )
    .refine(
      (value) => Number.isInteger(value * 10_000),
      'Use no more than four decimal places',
    ),

  transactionDate: z
    .string()
    .min(1, 'Transaction date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date'),

  merchantName: z
    .string()
    .max(200, 'Merchant must not exceed 200 characters'),

  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters'),
})

export type TransactionFormValues = z.infer<
  typeof transactionFormSchema
>
