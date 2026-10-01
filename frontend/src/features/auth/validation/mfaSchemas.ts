import { z } from 'zod'

export const mfaCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(
      /^\d{6}$/,
      'Enter the 6-digit code',
    ),
})

export const mfaRecoverySchema =
  z.object({
    recoveryCode: z
      .string()
      .trim()
      .min(
        1,
        'Recovery code is required',
      )
      .max(
        64,
        'Recovery code must not exceed 64 characters',
      ),
  })

export type MfaCodeFormValues =
  z.infer<typeof mfaCodeSchema>

export type MfaRecoveryFormValues =
  z.infer<typeof mfaRecoverySchema>