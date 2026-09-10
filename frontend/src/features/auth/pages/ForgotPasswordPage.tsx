import {zodResolver} from '@hookform/resolvers/zod'
import {
  CheckCircle2,
  KeyRound,
  LoaderCircle,
} from 'lucide-react'
import {useState} from 'react'
import {useForm} from 'react-hook-form'
import {Link} from 'react-router'

import {ApiClientError} from '../../../api/ApiClientError'
import {authApi} from '../api/authApi'
import {
  formatCooldown,
  useRequestCooldown,
} from '../hooks/useRequestCooldown'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../validation/forgotPasswordSchema'

const PASSWORD_RESET_COOLDOWN_KEY =
  'salif:cooldown:password-reset'

const inputClasses =
  'block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 ' +
  'text-slate-950 outline-none transition placeholder:text-slate-400 ' +
  'focus:border-[#1F7A5C] focus:ring-2 focus:ring-[#1F7A5C]/20 ' +
  'disabled:cursor-not-allowed disabled:bg-slate-100'

export default function ForgotPasswordPage() {
  const [successMessage, setSuccessMessage] =
    useState<string | null>(null)

  const [submittedEmail, setSubmittedEmail] =
    useState('')

  const [submitError, setSubmitError] =
    useState<string | null>(null)

  const [isRequesting, setIsRequesting] =
    useState(false)

  const cooldown = useRequestCooldown(
    PASSWORD_RESET_COOLDOWN_KEY,
  )

  const {
    register,
    handleSubmit,
    setError,
    formState: {errors},
  } = useForm<ForgotPasswordFormValues>({
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
      const email = emailAddress.trim()

      const response =
        await authApi.forgotPassword({
          email,
        })

      setSubmittedEmail(email)

      setSuccessMessage(
        response.message ||
          'If an eligible account exists, password reset instructions will be sent.',
      )

      cooldown.startCooldown()
    } catch (error) {
      if (!(error instanceof ApiClientError)) {
        setSubmitError(
          'Something went wrong. Please try again.',
        )
        return
      }

      if (error.validationErrors?.email) {
        setError('email', {
          type: 'server',
          message:
            error.validationErrors.email,
        })
        return
      }

      setSubmitError(
        error.isNetworkError
          ? 'Unable to reach Salif. Check that the backend is running.'
          : error.message,
      )
    } finally {
      setIsRequesting(false)
    }
  }

  async function onSubmit(
    values: ForgotPasswordFormValues,
  ) {
    await requestPasswordReset(values.email)
  }

  if (successMessage) {
    return (
      <section
        className="w-full max-w-md text-center"
        aria-labelledby="forgot-password-title"
      >
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-[#1F7A5C]">
          <CheckCircle2
            size={28}
            aria-hidden
          />
        </span>

        <p className="mt-5 text-sm font-semibold text-[#1F7A5C]">
          Request received
        </p>

        <h1
          id="forgot-password-title"
          className="mt-2 font-serif text-4xl text-[#173c32]"
        >
          Check your inbox
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          {successMessage}
        </p>

        <p className="mt-2 break-all text-sm font-semibold text-slate-800">
          {submittedEmail}
        </p>

        {submitError && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {submitError}
          </p>
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
          className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#1F7A5C] px-5 py-3 font-semibold text-[#1F7A5C] transition hover:bg-[#e8f2ed] disabled:cursor-not-allowed disabled:border-[#cbd8d1] disabled:bg-[#eef3f0] disabled:text-[#6e837a]"
        >
          {(cooldown.isCoolingDown ||
            isRequesting) && (
            <LoaderCircle
              size={17}
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
          className="mt-4 inline-flex cursor-pointer font-semibold text-slate-700 hover:text-slate-950 hover:underline"
        >
          Return to sign in
        </Link>
      </section>
    )
  }

  return (
    <section
      className="w-full max-w-md"
      aria-labelledby="forgot-password-title"
    >
      <span className="grid size-11 place-items-center rounded-2xl bg-[#e5f0ea] text-[#1F7A5C]">
        <KeyRound size={21} aria-hidden/>
      </span>

      <header className="mt-5">
        <p className="text-xs font-semibold tracking-[0.14em] text-[#1F7A5C]">
          ACCOUNT RECOVERY
        </p>

        <h1
          id="forgot-password-title"
          className="mt-2 font-serif text-4xl text-[#173c32]"
        >
          Forgot your password?
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Enter your account email. We’ll send reset
          instructions if the account is eligible.
        </p>
      </header>

      <form
        className="mt-7 space-y-5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div>
          <label
            htmlFor="email"
            className="text-sm font-medium text-slate-800"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            disabled={isRequesting}
            aria-invalid={
              errors.email ? 'true' : 'false'
            }
            aria-describedby={
              errors.email
                ? 'email-error'
                : undefined
            }
            className={`mt-2 ${inputClasses}`}
            {...register('email')}
          />

          {errors.email && (
            <p
              id="email-error"
              className="mt-1.5 text-sm text-red-600"
              role="alert"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        {submitError && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={
            isRequesting ||
            cooldown.isCoolingDown
          }
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#1F7A5C] px-4 py-3 font-semibold text-white transition hover:bg-[#19664D] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {(isRequesting ||
            cooldown.isCoolingDown) && (
            <LoaderCircle
              size={17}
              className="animate-spin"
              aria-hidden
            />
          )}

          {isRequesting
            ? 'Sending…'
            : cooldown.isCoolingDown
              ? `Available in ${formatCooldown(
                  cooldown.remainingSeconds,
                )}`
              : 'Send reset instructions'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link
          to="/login"
          className="cursor-pointer font-semibold text-[#1F7A5C] hover:underline"
        >
          Return to sign in
        </Link>
      </p>
    </section>
  )
}