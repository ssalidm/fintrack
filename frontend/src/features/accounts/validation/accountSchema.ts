import { z } from 'zod'

export const accountTypes = [
  'CASH',
  'CURRENT',
  'SAVINGS',
  'CREDIT_CARD',
  'INVESTMENT',
  'OTHER',
] as const

export const supportedCurrencies = [
  'ZAR',
  'USD',
  'EUR',
  'GBP',
] as const

export const accountFormSchema = z.object({
  name: z
    .string()
    .max(100, 'Name must not exceed 100 characters')
    .refine((value) => value.trim().length > 0, {
      message: 'Account name is required',
    }),

  accountType: z.enum(accountTypes),

  currencyCode: z.enum(supportedCurrencies),

  openingBalance: z
    .number()
    .finite('Enter a valid opening balance')
    .refine(
      (value) => Math.abs(value) < 1_000_000_000_000_000,
      'Opening balance is too large',
    )
    .refine(
      (value) => Number.isInteger(value * 10_000),
      'Use no more than four decimal places',
    ),

  includeInNetWorth: z.boolean(),
})

export type AccountFormValues = z.infer<
  typeof accountFormSchema
>
