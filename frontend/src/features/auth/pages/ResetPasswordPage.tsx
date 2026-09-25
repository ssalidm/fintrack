import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router'

import { ApiClientError } from '@/api/ApiClientError'
import { authApi } from '@/features/auth/api/authApi'
import AuthAlert from '@/features/auth/components/AuthAlert'
import AuthButton from '@/features/auth/components/AuthButton'
import AuthField from '@/features/auth/components/AuthField'
import AuthHeader from '@/features/auth/components/AuthHeader'
import AuthInput from '@/features/auth/components/AuthInput'
import AuthPanel from '@/features/auth/components/AuthPanel'
import PasswordVisibilityButton from '@/features/auth/components/PasswordVisibilityButton'
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/features/auth/validation/resetPasswordSchema'

export default function ResetPasswordPage() {
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
    successMessage,
    setSuccessMessage,
  ] = useState<string | null>(
    null,
  )

  const [
    submitError,
    setSubmitError,
  ] = useState<string | null>(
    null,
  )

  const {
    register,
    handleSubmit,
    setError,
    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<ResetPasswordFormValues>({
      resolver: zodResolver(
        resetPasswordSchema,
      ),
      defaultValues: {
        newPassword: '',
        confirmPassword: '',
      },
    })

  async function onSubmit(
    values: ResetPasswordFormValues,
  ) {
    setSubmitError(null)

    try {
      const response =
        await authApi.resetPassword({
          token,
          newPassword:
            values.newPassword,
        })

      setSuccessMessage(
        response.message ||
          'Your password has been reset. Please sign in again.',
      )

      navigate(
        '/reset-password',
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

      if (
        error.validationErrors
          ?.newPassword
      ) {
        setError(
          'newPassword',
          {
            type: 'server',
            message:
              error
                .validationErrors
                .newPassword,
          },
        )

        return
      }

      setSubmitError(
        error.isNetworkError
          ? 'We couldn’t connect to Salif right now. Please try again in a moment.'
          : error.message,
      )
    }
  }

  if (successMessage) {
    return (
      <AuthPanel className="auth-panel-enter">
        <div
          aria-labelledby="reset-password-title"
        >
          <span className="mb-5 grid size-10 place-items-center rounded-full bg-[#e5f1eb] text-[#16805f]">
            <CheckCircle2
              size={20}
              aria-hidden
            />
          </span>

          <AuthHeader
            title="Reset successful"
            description={
              successMessage
            }
            titleId="reset-password-title"
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
          aria-labelledby="reset-password-title"
        >
          <AuthHeader
            title="Reset link missing"
            description="Open the complete password reset link from the email we sent you."
            titleId="reset-password-title"
          />

          <p className="mt-6 text-sm text-[#657972]">
            Need another link?{' '}
            <Link
              to="/forgot-password"
              className="font-semibold text-[#16805f] transition hover:text-[#0d4f3f] hover:underline"
            >
              Request a new one
            </Link>
          </p>
        </div>
      </AuthPanel>
    )
  }

  return (
    <AuthPanel className="auth-panel-enter">
      <div
        aria-labelledby="reset-password-title"
      >
        <AuthHeader
          title="Create a new password"
          description="Choose a strong password that you haven’t used before."
          titleId="reset-password-title"
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
            label="New password"
            htmlFor="newPassword"
            error={
              errors.newPassword
                ?.message
            }
            hint={
              !errors.newPassword
                ? 'Use 12–72 characters with uppercase, lowercase, a number and a symbol.'
                : undefined
            }
          >
            <div className="relative">
              <AuthInput
                id="newPassword"
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                autoComplete="new-password"
                autoFocus
                disabled={
                  isSubmitting
                }
                hasError={
                  Boolean(
                    errors.newPassword,
                  )
                }
                aria-invalid={
                  errors.newPassword
                    ? 'true'
                    : 'false'
                }
                className="pr-12"
                {...register(
                  'newPassword',
                )}
              />

              <PasswordVisibilityButton
                visible={
                  showPassword
                }
                fieldLabel="new password"
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
            label="Confirm new password"
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
            loadingLabel="Resetting password…"
          >
            Reset password
          </AuthButton>
        </form>

        <p className="mt-5 text-center text-sm text-[#657972]">
          <Link
            to="/login"
            className="font-semibold text-[#16805f] transition hover:text-[#0d4f3f] hover:underline"
          >
            Return to sign in
          </Link>
        </p>
      </div>
    </AuthPanel>
  )
}