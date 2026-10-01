import { z } from 'zod'

import { passwordSchema } from './registrationSchema'

const requiredNameSchema = z
  .string()
  .max(
    100,
    'Must not exceed 100 characters',
  )
  .refine(
    (value) => value.trim().length > 0,
    {
      message: 'This field is required',
    },
  )
  .regex(
    /^[\p{L}\s-]+$/u,
    'Only letters, spaces, and hyphens are allowed',
  )

export const completeRegistrationSchema =
  z
    .object({
      firstName: requiredNameSchema,

      lastName: requiredNameSchema,

      preferredName: z
        .string()
        .max(
          100,
          'Must not exceed 100 characters',
        ),

      password: passwordSchema,

      confirmPassword: z
        .string()
        .min(
          1,
          'Confirm your password',
        ),

      acceptTerms: z
        .boolean()
        .refine(
          (accepted) => accepted,
          {
            message:
              'You must accept the Terms and Privacy Policy',
          },
        ),
    })
    .refine(
      ({
        password,
        confirmPassword,
      }) =>
        password === confirmPassword,
      {
        message:
          'Passwords do not match',
        path: [
          'confirmPassword',
        ],
      },
    )

export type CompleteRegistrationFormValues =
  z.infer<
    typeof completeRegistrationSchema
  >