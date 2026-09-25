import { zodResolver } from '@hookform/resolvers/zod'
import {
  CheckCircle2,
  LoaderCircle,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'

import { ApiClientError } from '@/api/ApiClientError'
import { authApi } from '@/features/auth/api/authApi'
import AuthAlert from '@/features/auth/components/AuthAlert'
import AuthButton from '@/features/auth/components/AuthButton'
import AuthField from '@/features/auth/components/AuthField'
import AuthHeader from '@/features/auth/components/AuthHeader'
import AuthInput from '@/features/auth/components/AuthInput'
import AuthPanel from '@/features/auth/components/AuthPanel'
import {
  formatCooldown,
  useRequestCooldown,
} from '@/features/auth/hooks/useRequestCooldown'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/features/auth/validation/forgotPasswordSchema'

const PASSWORD_RESET_COOLDOWN_KEY =
  'salif:cooldown:password-reset'

export default function ForgotPasswordPage() {
  const [
    successMessage,
    setSuccessMessage,
  ] = useState<string | null>(
    null,
  )

  const [
    submittedEmail,
    setSubmittedEmail,
  ] = useState('')

  const [
    submitError,
    setSubmitError,
  ] = useState<string | null>(
    null,
  )

  const [
    isRequesting,
    setIsRequesting,
  ] = useState(false)

  const cooldown =
    useRequestCooldown(
      PASSWORD_RESET_COOLDOWN_KEY,
    )

  const {
    register,
    handleSubmit,
    setError,
    formState: {
      errors,
    },
  } =
    useForm<ForgotPasswordFormValues>({
      resolver: zodResolver(
        forgotPasswordSchema,
      ),
      defaultValues: {
        email: '',
      },
    })

  async function requestPasswordReset(
    emailAddress: string,
  ) {
    if (cooldown.isCoolingDown) {
      return
    }

    setSubmitError(null)
    setIsRequesting(true)

    try {
      const email =
        emailAddress.trim()

      const response =
        await authApi.forgotPassword({
          email,
        })

      setSubmittedEmail(
        email,
      )

      setSuccessMessage(
        response.message ||
        'If an eligible account exists, password reset instructions will be sent.',
      )

      cooldown.startCooldown()
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

        return
      }

      setSubmitError(
        error.isNetworkError
          ? 'We couldn’t connect to Salif right now. Please try again in a moment.'
          : error.message,
      )
    } finally {
      setIsRequesting(false)
    }
  }

  async function onSubmit(
    values: ForgotPasswordFormValues,
  ) {
    await requestPasswordReset(
      values.email,
    )
  }

  if (successMessage) {
    return (
      <AuthPanel className="auth-panel-enter">
        <div
          aria-labelledby="forgot-password-title"
        >
          <span className="mb-5 grid size-11 place-items-center rounded-full bg-success-soft text-success">
            <CheckCircle2
              size={21}
              aria-hidden
            />
          </span>

          <AuthHeader
            title="Check your inbox"
            description={successMessage}
            titleId="forgot-password-title"
          />

          <div className="mt-5 rounded-xl border border-line bg-app px-4 py-3">
            <p className="text-xs font-medium text-muted">
              Reset instructions sent to
            </p>

            <p className="mt-1 break-all text-sm font-semibold text-ink">
              {submittedEmail}
            </p>
          </div>

          {submitError && (
            <div className="mt-5">
              <AuthAlert variant="error">
                {submitError}
              </AuthAlert>
            </div>
          )}

          <button
            type="button"
            disabled={
              cooldown.isCoolingDown ||
              isRequesting
            }
            onClick={() =>
              void requestPasswordReset(
                submittedEmail,
              )
            }
            className="
            mt-6
            inline-flex h-10 w-full
            items-center justify-center
            gap-2
            rounded-full
            border border-line-strong
            bg-surface
            px-4
            text-sm font-semibold
            text-ink
            transition

            hover:border-accent
            hover:text-accent

            focus:outline-none
            focus:ring-2
            focus:ring-accent/30
            focus:ring-offset-2
            focus:ring-offset-surface

            disabled:cursor-not-allowed
            disabled:border-line
            disabled:bg-surface-muted
            disabled:text-subtle
          "
          >
            {isRequesting && (
              <LoaderCircle
                size={16}
                className="animate-spin"
                aria-hidden
              />
            )}

            {isRequesting
              ? 'Sending another email…'
              : cooldown.isCoolingDown
                ? `Send again in ${formatCooldown(
                  cooldown.remainingSeconds,
                )}`
                : 'Send another reset email'}
          </button>

          <Link
            to="/login"
            className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-inverse transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-accent/30 focus:ring-offset-2 focus:ring-offset-surface"
          >
            Return to sign in
          </Link>
        </div>
      </AuthPanel>
    )
  }

  return (
    <AuthPanel className="auth-panel-enter">
      <div
        aria-labelledby="forgot-password-title"
      >
        <AuthHeader
          title="Forgot your password?"
          description="Enter your account email and we’ll send reset instructions."
          titleId="forgot-password-title"
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
          <AuthField
            label="Email"
            htmlFor="email"
            error={
              errors.email
                ?.message
            }
          >
            <AuthInput
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              autoFocus
              disabled={
                isRequesting
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
              {...register(
                'email',
              )}
            />
          </AuthField>

          {submitError && (
            <AuthAlert variant="error">
              {submitError}
            </AuthAlert>
          )}

          <AuthButton
            type="submit"
            disabled={
              isRequesting ||
              cooldown.isCoolingDown
            }
            loading={
              isRequesting
            }
            loadingLabel="Sending…"
          >
            {cooldown.isCoolingDown
              ? `Available in ${formatCooldown(
                cooldown.remainingSeconds,
              )}`
              : 'Send reset instructions'}
          </AuthButton>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          <Link
            to="/login"
            className="font-semibold text-accent transition hover:text-primary hover:underline"
          >
            Return to sign in
          </Link>
        </p>
      </div>
    </AuthPanel>
  )
}