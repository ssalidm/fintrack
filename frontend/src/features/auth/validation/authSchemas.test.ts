import {describe, expect, it} from 'vitest'
import {forgotPasswordSchema} from './forgotPasswordSchema'
import {loginSchema} from './loginSchema'
import {registrationSchema} from './registrationSchema'
import {resendVerificationSchema} from './resendVerificationSchema'
import {resetPasswordSchema} from './resetPasswordSchema'

const validPassword = 'SalifSecure1!'

describe('registrationSchema', () => {
  it('accepts a valid registration', () => {
    const result = registrationSchema.safeParse({
      firstName: 'David',
      lastName: 'Ssali',
      email: 'david@example.com',
      password: validPassword,
      confirmPassword: validPassword,
    })

    expect(result.success).toBe(true)
  })

  it('rejects names containing unsupported characters', () => {
    const result = registrationSchema.safeParse({
      firstName: 'David3',
      lastName: 'Ssali',
      email: 'david@example.com',
      password: validPassword,
      confirmPassword: validPassword,
    })

    expect(result.success).toBe(false)
  })

  it('rejects a weak password', () => {
    const result = registrationSchema.safeParse({
      firstName: 'David',
      lastName: 'Ssali',
      email: 'david@example.com',
      password: 'password',
      confirmPassword: 'password',
    })

    expect(result.success).toBe(false)
  })

  it('rejects passwords that do not match', () => {
    const result = registrationSchema.safeParse({
      firstName: 'David',
      lastName: 'Ssali',
      email: 'david@example.com',
      password: validPassword,
      confirmPassword: 'Different1!',
    })

    expect(result.success).toBe(false)
  })
})

describe('loginSchema', () => {
  it('requires valid credentials but does not enforce registration strength', () => {
    const result = loginSchema.safeParse({
      email: 'david@example.com',
      password: 'existing-password',
    })

    expect(result.success).toBe(true)
  })

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'existing-password',
    })

    expect(result.success).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  it('accepts matching strong passwords', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: validPassword,
      confirmPassword: validPassword,
    })

    expect(result.success).toBe(true)
  })

  it('rejects mismatched passwords', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: validPassword,
      confirmPassword: 'DifferentSecure1!',
    })

    expect(result.success).toBe(false)
  })
})

describe('email request schemas', () => {
  it.each([
    forgotPasswordSchema,
    resendVerificationSchema,
  ])('accepts a valid email', (schema) => {
    expect(
      schema.safeParse({
        email: 'david@example.com',
      }).success,
    ).toBe(true)
  })

  it.each([
    forgotPasswordSchema,
    resendVerificationSchema,
  ])('rejects an invalid email', (schema) => {
    expect(
      schema.safeParse({
        email: 'invalid',
      }).success,
    ).toBe(false)
  })
})
