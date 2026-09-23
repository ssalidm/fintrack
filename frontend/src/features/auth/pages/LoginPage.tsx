import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router'

import { ApiClientError } from '../../../api/ApiClientError'
import AuthAlert from '../components/AuthAlert'
import AuthButton from '../components/AuthButton'
import AuthDivider from '../components/AuthDivider'
import AuthField from '../components/AuthField'
import AuthHeader from '../components/AuthHeader'
import AuthInput from '../components/AuthInput'
import AuthPanel from '../components/AuthPanel'
import GoogleSignInButton from '../components/GoogleSignInButton'
import PasswordVisibilityButton from '../components/PasswordVisibilityButton'
import { useAuth } from '../context/useAuth'
import {
  loginSchema,
  type LoginFormValues,
} from '../validation/loginSchema'

function getRedirectPath(
  state: unknown,
): string {
  if (
    typeof state !== 'object' ||
    state === null
  ) {
    return '/dashboard'
  }

  const { from } = state as {
    from?: unknown
  }

  if (
    typeof from === 'string' &&
    from.startsWith('/') &&
    !from.startsWith('//')
  ) {
    return from
  }

  return '/dashboard'
}

function hasGoogleLinkRequest(
  state: unknown,
): boolean {
  if (
    typeof state !== 'object' ||
    state === null
  ) {
    return false
  }

  const {
    googleLinkRequired,
  } = state as {
    googleLinkRequired?: unknown
  }

  return googleLinkRequired === true
}

export default function LoginPage() {
  /*
   * These must be declared before any
   * state initializer reads location.state.
   */
  const navigate = useNavigate()
  const location = useLocation()

  const {
    login,
    googleLogin,
    status,
  } = useAuth()

  const redirectTo =
    getRedirectPath(
      location.state,
    )

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const [
    submitError,
    setSubmitError,
  ] = useState<string | null>(
    null,
  )

  const [
    googleSubmitting,
    setGoogleSubmitting,
  ] = useState(false)

  const [
    googleLinkRequired,
    setGoogleLinkRequired,
  ] = useState(
    () =>
      hasGoogleLinkRequest(
        location.state,
      ),
  )

  const {
    register,
    handleSubmit,
    setError,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginFormValues>({
    resolver:
      zodResolver(loginSchema),

    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(
    values: LoginFormValues,
  ) {
    setSubmitError(null)

    try {
      const result =
        await login({
          email:
            values.email.trim(),

          password:
            values.password,
        })

      if (
        result.status ===
        'MFA_REQUIRED'
      ) {
        if (!result.mfaChallenge) {
          setSubmitError(
            'Salif returned an invalid authentication challenge.',
          )

          return
        }

        navigate(
          '/login/mfa',
          {
            replace: true,

            state: {
              challenge:
                result.mfaChallenge,

              from:
                redirectTo,
            },
          },
        )

        return
      }

      navigate(
        redirectTo,
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
          ?.email
      ) {
        setError(
          'email',
          {
            type: 'server',

            message:
              error
                .validationErrors
                .email,
          },
        )

        hasFieldError = true
      }

      if (
        error.validationErrors
          ?.password
      ) {
        setError(
          'password',
          {
            type: 'server',

            message:
              error
                .validationErrors
                .password,
          },
        )

        hasFieldError = true
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

  async function handleGoogleCredential(
    credential: string,
  ) {
    setSubmitError(null)
    setGoogleSubmitting(true)

    try {
      const result =
        await googleLogin({
          credential,
        })

      if (
        result.status ===
        'AUTHENTICATED'
      ) {
        navigate(
          redirectTo,
          {
            replace: true,
          },
        )

        return
      }

      if (
        result.status ===
        'MFA_REQUIRED'
      ) {
        if (!result.mfaChallenge) {
          setSubmitError(
            'Salif returned an invalid authentication challenge.',
          )

          return
        }

        navigate(
          '/login/mfa',
          {
            replace: true,

            state: {
              challenge:
                result.mfaChallenge,

              from:
                redirectTo,
            },
          },
        )

        return
      }

      if (
        result.status ===
        'ACCOUNT_LINK_REQUIRED'
      ) {
        setGoogleLinkRequired(
          true,
        )

        return
      }

      if (
        result.status ===
        'EMAIL_VERIFICATION_REQUIRED'
      ) {
        setSubmitError(
          'Verify your email address before signing in.',
        )
      }
    } catch (error) {
      setSubmitError(
        error instanceof ApiClientError
          ? error.isNetworkError
            ? 'We couldn’t connect to Salif right now. Please try again in a moment.'
            : error.message
          : 'Google sign-in could not be completed.',
      )
    } finally {
      setGoogleSubmitting(false)
    }
  }

  if (
    status ===
    'authenticated'
  ) {
    return (
      <Navigate
        to={redirectTo}
        replace
      />
    )
  }

  return (
    <AuthPanel>
      <AuthHeader
        title="Welcome back"
        description="Sign in to continue to Salif."
        titleId="login-title"
      />

      {googleLinkRequired && (
        <div className="mt-6">
          <AuthAlert variant="success">
            Sign in with your Salif
            password to securely connect
            your Google account.
          </AuthAlert>
        </div>
      )}

      <form
        className="mt-7 space-y-4"
        onSubmit={
          handleSubmit(
            onSubmit,
          )
        }
        noValidate
      >
        <AuthField
          label="Email"
          htmlFor="email"
          error={
            errors.email?.message
          }
        >
          <AuthInput
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            autoFocus
            disabled={
              isSubmitting ||
              googleSubmitting
            }
            hasError={
              Boolean(
                errors.email,
              )
            }
            aria-invalid={
              errors.email
                ? 'true'
                : 'false'
            }
            aria-describedby={
              errors.email
                ? 'email-error'
                : undefined
            }
            {...register(
              'email',
            )}
          />
        </AuthField>

        <AuthField
          label="Password"
          htmlFor="password"
          error={
            errors.password?.message
          }
          action={
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-[#16805f] transition hover:text-[#0d4f3f] hover:underline"
            >
              Forgot password?
            </Link>
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
              autoComplete="current-password"
              disabled={
                isSubmitting ||
                googleSubmitting
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
              aria-describedby={
                errors.password
                  ? 'password-error'
                  : undefined
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

        {submitError && (
          <AuthAlert>
            {submitError}
          </AuthAlert>
        )}

        <AuthButton
          type="submit"
          loading={
            isSubmitting
          }
          loadingLabel="Signing in…"
          disabled={
            googleSubmitting ||
            status === 'checking'
          }
        >
          Sign in
        </AuthButton>
      </form>

      <AuthDivider />

      <GoogleSignInButton
        text="signin_with"
        disabled={
          googleSubmitting ||
          isSubmitting ||
          status === 'checking'
        }
        onCredential={
          handleGoogleCredential
        }
        onError={
          setSubmitError
        }
      />

      <p className="mt-6 text-center text-sm text-[#66766f]">
        Don’t have an account?{' '}

        <Link
          to="/register"
          className="font-semibold text-[#16805f] transition hover:text-[#0d4f3f] hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthPanel>
  )
}
