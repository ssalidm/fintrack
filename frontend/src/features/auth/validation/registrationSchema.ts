import {z} from 'zod'

const personNameSchema = z
  .string()
  .max(100, 'Must not exceed 100 characters')
  .refine((value) => value.trim().length > 0, {
    message: 'This field is required',
  })
  .regex(/^[\p{L}\s-]+$/u, {
    message: 'Only letters, spaces, and hyphens are allowed',
  })

const emailSchema = z
  .string()
  .min(1, {message: 'Email is required'})
  .max(320, {message: 'Email must not exceed 320 characters'})
  .email({message: 'Enter a valid email address'});


export const passwordSchema = z
  .string()
  .min(12, 'Password must contain at least 12 characters')
  .max(72, 'Password must not exceed 72 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/\d/, 'Password must contain a number')
  .regex(/[\W_]/, 'Password must contain a special character')
  .refine((value) => value === value.trim(), {
    message: "Password cannot start or end with a space",
  })

export const registrationSchema = z
  .object({
    firstName: personNameSchema,
    lastName: personNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine(
    ({password, confirmPassword}) => password === confirmPassword,
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    },
  )

export type RegistrationFormValues = z.infer<typeof registrationSchema>
