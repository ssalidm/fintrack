import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router'

import { ApiClientError } from '../../../api/ApiClientError'
import { authApi } from '../api/authApi'
import AuthAlert from '../components/AuthAlert'
import AuthButton from '../components/AuthButton'
import AuthField from '../components/AuthField'
import AuthHeader from '../components/AuthHeader'
import AuthInput from '../components/AuthInput'
import AuthPanel from '../components/AuthPanel'
import PasswordVisibilityButton from '../components/PasswordVisibilityButton'
import {
  completeRegistrationSchema,
  type CompleteRegistrationFormValues,
} from '../validation/completeRegistrationSchema'

export default function CompleteRegistrationPage() {
  const [searchParams] =
    useSearchParams()

  const navigate =
    useNavigate()

  const token =
    searchParams
      .get('token')
      ?.trim() ?? ''

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const [
    showConfirmation,
    setShowConfirmation,
  ] = useState(false)

  const [
    submitError,
    setSubmitError,
  ] = useState<string | null>(
    null,
  )

  const [
    registrationComplete,
    setRegistrationComplete,
  ] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<CompleteRegistrationFormValues>({
      resolver: zodResolver(
        completeRegistrationSchema,
      ),
      defaultValues: {
        firstName: '',
        lastName: '',
        preferredName: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
      },
    })

  async function onSubmit(
    values: CompleteRegistrationFormValues,
  ) {
    setSubmitError(null)

    try {
      await authApi.completeRegistration({
        token,
        firstName:
          values.firstName.trim(),
        lastName:
          values.lastName.trim(),
        preferredName:
          values.preferredName
            .trim() || undefined,
        password:
          values.password,
        acceptTerms:
          values.acceptTerms,
      })

      setRegistrationComplete(
        true,
      )

      navigate(
        '/register/complete',
        {
          replace: true,
        },
      )
    } catch (error) {
      if (
        !(
          error instanceof
          ApiClientError
        )
      ) {
        setSubmitError(
          'Something went wrong. Please try again.',
        )

        return
      }

      let hasFieldError =
        false

      if (
        error.validationErrors
      ) {
        const fields: Array<
          keyof CompleteRegistrationFormValues
        > = [
          'firstName',
          'lastName',
          'preferredName',
          'password',
          'confirmPassword',
          'acceptTerms',
        ]

        for (
          const field of fields
        ) {
          const message =
            error.validationErrors[
              field
            ]

          if (!message) {
            continue
          }

          setError(
            field,
            {
              type: 'server',
              message,
            },
          )

          hasFieldError =
            true
        }
      }

      if (hasFieldError) {
        return
      }

      setSubmitError(
        error.isNetworkError
          ? 'We couldn’t connect to Salif right now. Please try again in a moment.'
          : error.message,
      )
    }
  }

  if (
    registrationComplete
  ) {
    return (
      <AuthPanel className="auth-panel-enter">
        <div
          aria-labelledby="registration-complete-title"
        >
          <span className="mb-5 grid size-10 place-items-center rounded-full bg-[#e5f1eb] text-[#16805f]">
            <CheckCircle2
              size={20}
              aria-hidden
            />
          </span>

          <AuthHeader
            title="Your account is ready"
            description="Your email is verified and your Salif account has been created."
            titleId="registration-complete-title"
          />

          <div className="mt-6">
            <AuthButton
              type="button"
              onClick={() =>
                navigate('/login')
              }
            >
              Continue to sign in
            </AuthButton>
          </div>
        </div>
      </AuthPanel>
    )
  }

  if (!token) {
    return (
      <AuthPanel className="auth-panel-enter">
        <div
          aria-labelledby="registration-link-title"
        >
          <AuthHeader
            title="Registration link missing"
            description="Open the complete registration link from the email we sent you."
            titleId="registration-link-title"
          />

          <p className="mt-6 text-sm text-[#657972]">
            Need a new link?{' '}
            <Link
              to="/register"
              className="font-semibold text-[#16805f] transition hover:text-[#0d4f3f] hover:underline"
            >
              Start registration again
            </Link>
          </p>
        </div>
      </AuthPanel>
    )
  }

  return (
    <AuthPanel className="auth-panel-enter">
      <div
        aria-labelledby="registration-complete-title"
      >
        <AuthHeader
          title="Finish your account"
          description="Tell us a little about yourself and choose a secure password."
          titleId="registration-complete-title"
        />

        <form
          className="mt-6 space-y-4"
          onSubmit={
            handleSubmit(
              onSubmit,
            )
          }
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField
              label="First name"
              htmlFor="firstName"
              error={
                errors.firstName
                  ?.message
              }
            >
              <AuthInput
                id="firstName"
                type="text"
                autoComplete="given-name"
                autoFocus
                disabled={
                  isSubmitting
                }
                hasError={
                  Boolean(
                    errors.firstName,
                  )
                }
                aria-invalid={
                  errors.firstName
                    ? 'true'
                    : 'false'
                }
                {...register(
                  'firstName',
                )}
              />
            </AuthField>

            <AuthField
              label="Last name"
              htmlFor="lastName"
              error={
                errors.lastName
                  ?.message
              }
            >
              <AuthInput
                id="lastName"
                type="text"
                autoComplete="family-name"
                disabled={
                  isSubmitting
                }
                hasError={
                  Boolean(
                    errors.lastName,
                  )
                }
                aria-invalid={
                  errors.lastName
                    ? 'true'
                    : 'false'
                }
                {...register(
                  'lastName',
                )}
              />
            </AuthField>
          </div>

          <AuthField
            label="Preferred name"
            htmlFor="preferredName"
            optional
            error={
              errors.preferredName
                ?.message
            }
          >
            <AuthInput
              id="preferredName"
              type="text"
              autoComplete="nickname"
              placeholder="What should we call you?"
              disabled={
                isSubmitting
              }
              hasError={
                Boolean(
                  errors.preferredName,
                )
              }
              aria-invalid={
                errors.preferredName
                  ? 'true'
                  : 'false'
              }
              {...register(
                'preferredName',
              )}
            />
          </AuthField>

          <AuthField
            label="Password"
            htmlFor="password"
            error={
              errors.password
                ?.message
            }
            hint={
              !errors.password
                ? 'Use 12–72 characters with uppercase, lowercase, a number and a symbol.'
                : undefined
            }
          >
            <div className="relative">
              <AuthInput
                id="password"
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                autoComplete="new-password"
                disabled={
                  isSubmitting
                }
                hasError={
                  Boolean(
                    errors.password,
                  )
                }
                aria-invalid={
                  errors.password
                    ? 'true'
                    : 'false'
                }
                className="pr-12"
                {...register(
                  'password',
                )}
              />

              <PasswordVisibilityButton
                visible={
                  showPassword
                }
                fieldLabel="password"
                onToggle={() =>
                  setShowPassword(
                    (visible) =>
                      !visible,
                  )
                }
              />
            </div>
          </AuthField>

          <AuthField
            label="Confirm password"
            htmlFor="confirmPassword"
            error={
              errors.confirmPassword
                ?.message
            }
          >
            <div className="relative">
              <AuthInput
                id="confirmPassword"
                type={
                  showConfirmation
                    ? 'text'
                    : 'password'
                }
                autoComplete="new-password"
                disabled={
                  isSubmitting
                }
                hasError={
                  Boolean(
                    errors.confirmPassword,
                  )
                }
                aria-invalid={
                  errors.confirmPassword
                    ? 'true'
                    : 'false'
                }
                className="pr-12"
                {...register(
                  'confirmPassword',
                )}
              />

              <PasswordVisibilityButton
                visible={
                  showConfirmation
                }
                fieldLabel="confirmed password"
                onToggle={() =>
                  setShowConfirmation(
                    (visible) =>
                      !visible,
                  )
                }
              />
            </div>
          </AuthField>

          <div className="pt-1">
            <div className="flex items-start gap-2.5">
              <input
                id="acceptTerms"
                type="checkbox"
                disabled={
                  isSubmitting
                }
                aria-invalid={
                  errors.acceptTerms
                    ? 'true'
                    : 'false'
                }
                className="
                  mt-0.5
                  size-4
                  shrink-0
                  cursor-pointer
                  rounded
                  border-[#aebdb6]
                  accent-[#16805f]
                "
                {...register(
                  'acceptTerms',
                )}
              />

              <label
                htmlFor="acceptTerms"
                className="cursor-pointer text-xs leading-5 text-[#657972]"
              >
                I agree to Salif’s{' '}
                <Link
                  to="/terms"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#16805f] hover:text-[#0d4f3f] hover:underline"
                  onClick={(
                    event,
                  ) =>
                    event.stopPropagation()
                  }
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  to="/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#16805f] hover:text-[#0d4f3f] hover:underline"
                  onClick={(
                    event,
                  ) =>
                    event.stopPropagation()
                  }
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            {errors.acceptTerms && (
              <p
                className="mt-1.5 text-xs text-red-600"
                role="alert"
              >
                {
                  errors.acceptTerms
                    .message
                }
              </p>
            )}
          </div>

          {submitError && (
            <AuthAlert variant="error">
              {submitError}
            </AuthAlert>
          )}

          <AuthButton
            type="submit"
            disabled={
              isSubmitting
            }
            loading={
              isSubmitting
            }
            loadingLabel="Creating account…"
          >
            Create account
          </AuthButton>
        </form>

        <p className="mt-5 text-center text-sm text-[#657972]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#16805f] transition hover:text-[#0d4f3f] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthPanel>
  )
}