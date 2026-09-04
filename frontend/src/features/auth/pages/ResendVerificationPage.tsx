import {useState} from 'react'
import {zodResolver} from '@hookform/resolvers/zod'
import {Link, useSearchParams} from 'react-router'
import {useForm} from 'react-hook-form'
import {ApiClientError} from '../../../api/ApiClientError'
import {authApi} from '../api/authApi'
import {
  resendVerificationSchema,
  type ResendVerificationFormValues,
} from '../validation/resendVerificationSchema'

const inputClasses =
  'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950' + '' +
  'outline-none transition placeholder:text-slate-400 focus:border-[#1F7A5C] focus:ring-2' +
  'focus:ring-[#1F7A5C]/20 disabled:cursor-not-allowed disabled:bg-slate-100'

export default function ResendVerificationPage() {
  const [searchParams] = useSearchParams()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: {errors, isSubmitting},
  } = useForm<ResendVerificationFormValues>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {
      email: searchParams.get('email')?.trim() ?? '',
    },
  })

  async function onSubmit(values: ResendVerificationFormValues) {
    setSubmitError(null)

    try {
      const response = await authApi.resendVerification({
        email: values.email.trim(),
      })

      setSuccessMessage(
        response.message ||
        'If an eligible account exists, a verification email will be sent.',
      )
    } catch (error) {
      if (!(error instanceof ApiClientError)) {
        setSubmitError('Something went wrong. Please try again.')
        return
      }

      if (error.validationErrors?.email) {
        setError('email', {
          type: 'server',
          message: error.validationErrors.email,
        })
        return
      }

      setSubmitError(
        error.isNetworkError
          ? 'Unable to reach Salif. Check that the backend is running.'
          : error.message,
      )
    }
  }

  if (successMessage) {
    return (
      <section
        className="w-full max-w-md text-center"
        aria-labelledby="resend-title"
      >
        <div
          className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-[#1F7A5C]"
          aria-hidden="true"
        >
          <svg
            className="size-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 12 4 4L19 6"/>
          </svg>
        </div>

        <p className="mt-5 text-sm font-semibold text-[#1F7A5C]">
          Request received
        </p>

        <h1
          id="resend-title"
          className="mt-2 text-3xl font-semibold text-slate-950"
        >
          Check your email
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          {successMessage}
        </p>

        <p className="mt-2 text-sm font-medium text-slate-800">
          {getValues('email')}
        </p>

        <Link
          to="/login"
          className="mt-7 inline-flex rounded-lg bg-[#1F7A5C] px-5 py-2.5 font-semibold text-white transition hover:bg-[#19664D] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C] focus:ring-offset-2"
        >
          Return to sign in
        </Link>
      </section>
    )
  }

  return (
    <section
      className="w-full max-w-md"
      aria-labelledby="resend-title"
    >
      <header>
        <p className="text-sm font-semibold text-[#1F7A5C]">
          Email verification
        </p>

        <h1
          id="resend-title"
          className="mt-2 text-3xl font-semibold tracking-tight text-slate-950"
        >
          Request a new link
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Enter your account email and we’ll send another verification link if
          the account is eligible.
        </p>
      </header>

      <form
        className="mt-8 space-y-5"
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
            disabled={isSubmitting}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
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
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full justify-center rounded-lg bg-[#1F7A5C] px-4 py-2.5 font-semibold text-white transition hover:bg-[#19664D] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Sending…' : 'Send verification email'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link
          to="/login"
          className="font-semibold text-[#1F7A5C] hover:underline"
        >
          Return to sign in
        </Link>
      </p>
    </section>
  )
}
