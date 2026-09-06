import {z} from 'zod'

export const profileDetailsSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(100, 'First name cannot exceed 100 characters'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(100, 'Last name cannot exceed 100 characters'),
  timeZone: z
    .string()
    .trim()
    .min(1, 'Time zone is required')
    .max(64, 'Time zone cannot exceed 64 characters'),
})

export type ProfileDetailsFormValues =
  z.infer<typeof profileDetailsSchema>

const strongPasswordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(72, 'Password cannot exceed 72 characters')
  .regex(
    /[a-z]/,
    'Password must contain a lowercase letter',
  )
  .regex(
    /[A-Z]/,
    'Password must contain an uppercase letter',
  )
  .regex(
    /\d/,
    'Password must contain a number',
  )
  .regex(
    /[\W_]/,
    'Password must contain a special character',
  )
  .refine(
    (password) => password === password.trim(),
    'Password cannot start or end with a space',
  )

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required'),
    newPassword: strongPasswordSchema,
    confirmPassword: z
      .string()
      .min(1, 'Confirm your new password'),
  })
  .refine(
    (values) =>
      values.newPassword !==
      values.currentPassword,
    {
      path: ['newPassword'],
      message:
        'New password must differ from your current password',
    },
  )
  .refine(
    (values) =>
      values.newPassword ===
      values.confirmPassword,
    {
      path: ['confirmPassword'],
      message: 'Passwords do not match',
    },
  )

export type ChangePasswordFormValues =
  z.infer<typeof changePasswordSchema>