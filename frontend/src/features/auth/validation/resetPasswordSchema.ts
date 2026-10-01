import {z} from 'zod'
import {passwordSchema} from './registrationSchema'

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine(
    ({newPassword, confirmPassword}) =>
      newPassword === confirmPassword,
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    },
  )

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
