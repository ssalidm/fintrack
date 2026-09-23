import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Link,
  useNavigate,
} from 'react-router'

import { ApiClientError } from '../../../api/ApiClientError'
import { authApi } from '../api/authApi'
import AuthAlert from '../components/AuthAlert'
import AuthButton from '../components/AuthButton'
import AuthDivider from '../components/AuthDivider'
import AuthField from '../components/AuthField'
import AuthHeader from '../components/AuthHeader'
import AuthInput from '../components/AuthInput'
import AuthPanel from '../components/AuthPanel'
import GoogleSignInButton from '../components/GoogleSignInButton'
import { useAuth } from '../context/useAuth'
import {
  startRegistrationSchema,
  type StartRegistrationFormValues,
} from '../validation/startRegistrationSchema'

export default function RegisterPage() {
  const navigate = useNavigate()

  const {
    googleLogin,
    status,
  } = useAuth()

  const [
    submitError,
    setSubmitError,
  ] = useState<string | null>(null)

  const [
    submittedEmail,
    setSubmittedEmail,
  ] = useState<string | null>(null)

  const [
    googleSubmitting,
    setGoogleSubmitting,
  ] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<StartRegistrationFormValues>({
    resolver: zodResolver(
      startRegistrationSchema,
    ),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(
    values: StartRegistrationFormValues,
  ) {
    setSubmitError(null)

    const email =
      values.email.trim()

    try {
      await authApi.startRegistration({
        email,
      })

      setSubmittedEmail(email)
    } catch (error) {
      if (
        error instanceof ApiClientError
      ) {
        const emailError =
          error.validationErrors
            ?.email

        if (emailError) {
          setError(
            'email',
            {
              type: 'server',
              message: emailError,
            },
          )

          return
        }

        setSubmitError(
          error.isNetworkError
            ? 'We couldn’t connect to Salif right now. Please try again in a moment.'
            : error.message,
        )

        return
      }

      setSubmitError(
        'Something went wrong. Please try again.',
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
          '/dashboard',
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
                '/dashboard',
            },
          },
        )

        return
      }

      if (
        result.status ===
        'ACCOUNT_LINK_REQUIRED'
      ) {
        navigate(
          '/login',
          {
            replace: true,
            state: {
              from:
                '/dashboard',
              googleLinkRequired:
                true,
            },
          },
        )

        return
      }

      if (
        result.status ===
        'EMAIL_VERIFICATION_REQUIRED'
      ) {
        setSubmitError(
          'Check your email to verify your address before signing in.',
        )
      }
    } catch (error) {
      setSubmitError(
        error instanceof ApiClientError
          ? error.isNetworkError
            ? 'We couldn’t connect to Salif right now. Please try again in a moment.'
            : error.message
          : 'Google sign-up could not be completed.',
      )
    } finally {
      setGoogleSubmitting(false)
    }
  }

  if (submittedEmail) {
    return (
      <AuthPanel>
        <AuthHeader
          title="Check your email"
          description="We’ve sent you a secure link to continue creating your Salif account."
          titleId="registration-title"
        />

        <div className="mt-6 rounded-lg border border-[#d8e6df] bg-[#f1f7f4] px-4 py-3 text-center">
          <p className="text-xs text-[#718078]">
            Registration email sent to
          </p>

          <p className="mt-1 break-all text-sm font-semibold text-[#173c32]">
            {submittedEmail}
          </p>
        </div>

        <p className="mt-4 text-center text-sm leading-6 text-[#66766f]">
          Open the link in the email to
          finish setting up your profile
          and password.
        </p>

        <button
          type="button"
          onClick={() =>
            setSubmittedEmail(null)
          }
          className="mt-6 w-full text-center text-sm font-semibold text-[#16805f] transition hover:text-[#0d4f3f] hover:underline"
        >
          Use a different email
        </button>

        <p className="mt-5 text-center text-sm text-[#66766f]">
          Already have an account?{' '}

          <Link
            to="/login"
            className="font-semibold text-[#16805f] hover:text-[#0d4f3f] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </AuthPanel>
    )
  }

  return (
    <AuthPanel>
      <AuthHeader
        title="Create your account"
        description="Enter your email to get started with Salif."
        titleId="registration-title"
      />

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
            placeholder="you@example.com"
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
          loadingLabel="Sending link…"
          disabled={
            googleSubmitting
          }
        >
          Continue
        </AuthButton>
      </form>

      <AuthDivider />

      <GoogleSignInButton
        text="signup_with"
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
        Already have an account?{' '}

        <Link
          to="/login"
          className="font-semibold text-[#16805f] transition hover:text-[#0d4f3f] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthPanel>
  )
}