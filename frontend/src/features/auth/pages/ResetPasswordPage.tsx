import {useState} from 'react'
import {zodResolver} from '@hookform/resolvers/zod'
import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router'
import {useForm} from 'react-hook-form'
import {ApiClientError} from '../../../api/ApiClientError'
import {authApi} from '../api/authApi'
import PasswordVisibilityButton from '../components/PasswordVisibilityButton'
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '../validation/resetPasswordSchema'

const inputClasses =
  'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#1F7A5C] focus:ring-2 focus:ring-[#1F7A5C]/20 disabled:cursor-not-allowed disabled:bg-slate-100'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get('token')?.trim() ?? ''

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: {errors, isSubmitting},
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: ResetPasswordFormValues) {
    setSubmitError(null)

    try {
      const response = await authApi.resetPassword({
        token,
        newPassword: values.newPassword,
      })

      setSuccessMessage(
        response.message ||
        'Your password has been reset. Please sign in again.',
      )

      // Remove the consumed token from the address bar.
      navigate('/reset-password', {replace: true})
    } catch (error) {
      if (!(error instanceof ApiClientError)) {
        setSubmitError('Something went wrong. Please try again.')
        return
      }

      if (error.validationErrors?.newPassword) {
        setError('newPassword', {
          type: 'server',
          message: error.validationErrors.newPassword,
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
        aria-labelledby="reset-password-title"
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
          Password updated
        </p>

        <h1
          id="reset-password-title"
          className="mt-2 text-3xl font-semibold text-slate-950"
        >
          Reset successful
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          {successMessage}
        </p>

        <Link
          to="/login"
          className="mt-7 inline-flex rounded-lg bg-[#1F7A5C] px-5 py-2.5 font-semibold text-white transition hover:bg-[#19664D] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C] focus:ring-offset-2"
        >
          Continue to sign in
        </Link>
      </section>
    )
  }

  if (!token) {
    return (
      <section
        className="w-full max-w-md text-center"
        aria-labelledby="reset-password-title"
      >
        <div
          className="mx-auto grid size-14 place-items-center rounded-full bg-red-100 text-red-600"
          aria-hidden="true"
        >
          <svg
            className="size-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M12 8v5"/>
            <path d="M12 17h.01"/>
            <circle cx="12" cy="12" r="9"/>
          </svg>
        </div>

        <h1
          id="reset-password-title"
          className="mt-6 text-3xl font-semibold text-slate-950"
        >
          Reset token missing
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Open the complete password reset link from your email.
        </p>

        <Link
          to="/forgot-password"
          className="mt-7 inline-flex font-semibold text-[#1F7A5C] hover:underline"
        >
          Request a new reset link
        </Link>
      </section>
    )
  }

  return (
    <section
      className="w-full max-w-md"
      aria-labelledby="reset-password-title"
    >
      <header>
        <p className="text-sm font-semibold text-[#1F7A5C]">
          Account recovery
        </p>

        <h1
          id="reset-password-title"
          className="mt-2 text-3xl font-semibold tracking-tight text-slate-950"
        >
          Create a new password
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Choose a strong password that you haven’t used before.
        </p>
      </header>

      <form
        className="mt-8 space-y-5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div>
          <label
            htmlFor="newPassword"
            className="text-sm font-medium text-slate-800"
          >
            New password
          </label>

          <div className="relative mt-2">
            <input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              disabled={isSubmitting}
              aria-invalid={errors.newPassword ? 'true' : 'false'}
              aria-describedby={
                errors.newPassword
                  ? 'newPassword-error'
                  : 'newPassword-help'
              }
              className={`${inputClasses} pr-12`}
              {...register('newPassword')}
            />

            <PasswordVisibilityButton
              visible={showPassword}
              fieldLabel="new password"
              onToggle={() => setShowPassword((visible) => !visible)}
            />
          </div>

          {errors.newPassword ? (
            <p
              id="newPassword-error"
              className="mt-1.5 text-sm text-red-600"
              role="alert"
            >
              {errors.newPassword.message}
            </p>
          ) : (
            <p
              id="newPassword-help"
              className="mt-1.5 text-xs text-slate-500"
            >
              Use 12–72 characters with uppercase, lowercase, number, and
              symbol.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-slate-800"
          >
            Confirm new password
          </label>

          <div className="relative mt-2">
            <input
              id="confirmPassword"
              type={showConfirmation ? 'text' : 'password'}
              autoComplete="new-password"
              disabled={isSubmitting}
              aria-invalid={
                errors.confirmPassword ? 'true' : 'false'
              }
              aria-describedby={
                errors.confirmPassword
                  ? 'confirmPassword-error'
                  : undefined
              }
              className={`${inputClasses} pr-12`}
              {...register('confirmPassword')}
            />

            <PasswordVisibilityButton
              visible={showConfirmation}
              fieldLabel="confirmed password"
              onToggle={() =>
                setShowConfirmation((visible) => !visible)
              }
            />
          </div>

          {errors.confirmPassword && (
            <p
              id="confirmPassword-error"
              className="mt-1.5 text-sm text-red-600"
              role="alert"
            >
              {errors.confirmPassword.message}
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
          {isSubmitting ? 'Resetting password…' : 'Reset password'}
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
