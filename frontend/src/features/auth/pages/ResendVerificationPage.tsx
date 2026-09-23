import { zodResolver } from '@hookform/resolvers/zod'
import {
  CheckCircle2,
  LoaderCircle,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Link,
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
import {
  formatCooldown,
  useRequestCooldown,
} from '../hooks/useRequestCooldown'
import {
  resendVerificationSchema,
  type ResendVerificationFormValues,
} from '../validation/resendVerificationSchema'

const VERIFICATION_COOLDOWN_KEY =
  'salif:cooldown:email-verification'

export default function ResendVerificationPage() {
  const [searchParams] =
    useSearchParams()

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

  const [
    isRequesting,
    setIsRequesting,
  ] = useState(false)

  const cooldown =
    useRequestCooldown(
      VERIFICATION_COOLDOWN_KEY,
    )

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: {
      errors,
    },
  } =
    useForm<ResendVerificationFormValues>({
      resolver: zodResolver(
        resendVerificationSchema,
      ),
      defaultValues: {
        email:
          searchParams
            .get('email')
            ?.trim() ?? '',
      },
    })

  async function requestVerification(
    emailAddress: string,
  ) {
    if (cooldown.isCoolingDown) {
      return
    }

    setSubmitError(null)
    setIsRequesting(true)

    try {
      const response =
        await authApi.resendVerification({
          email:
            emailAddress.trim(),
        })

      setSuccessMessage(
        response.message ||
          'If an eligible account exists, a verification email will be sent.',
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
    values: ResendVerificationFormValues,
  ) {
    await requestVerification(
      values.email,
    )
  }

  if (successMessage) {
    return (
      <AuthPanel className="auth-panel-enter">
        <div
          aria-labelledby="resend-title"
        >
          <span className="mb-5 grid size-10 place-items-center rounded-full bg-[#e5f1eb] text-[#16805f]">
            <CheckCircle2
              size={20}
              aria-hidden
            />
          </span>

          <AuthHeader
            title="Check your email"
            description={
              successMessage
            }
            titleId="resend-title"
          />

          <p className="mt-3 break-all text-sm font-semibold text-[#173c32]">
            {getValues('email')}
          </p>

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
              void requestVerification(
                getValues('email'),
              )
            }
            className="
              mt-6
              flex h-10 w-full
              cursor-pointer
              items-center
              justify-center
              gap-2
              rounded-full
              border border-[#16805f]
              px-4
              text-sm font-semibold
              text-[#16805f]
              transition
              hover:bg-[#e8f2ed]
              disabled:cursor-not-allowed
              disabled:border-[#cbd8d1]
              disabled:bg-[#eef3f0]
              disabled:text-[#6e837a]
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
                : 'Send another verification email'}
          </button>

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

  return (
    <AuthPanel className="auth-panel-enter">
      <div
        aria-labelledby="resend-title"
      >
        <AuthHeader
          title="Request a new link"
          description="Enter your account email and we’ll send another verification link if the account is eligible."
          titleId="resend-title"
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
              : 'Send verification email'}
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