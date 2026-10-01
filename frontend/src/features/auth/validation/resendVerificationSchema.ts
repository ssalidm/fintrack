import {z} from 'zod'

export const resendVerificationSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(320, 'Email must not exceed 320 characters')
    .email('Enter a valid email address'),
})

export type ResendVerificationFormValues = z.infer<typeof resendVerificationSchema>
