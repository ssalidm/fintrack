import {useState} from 'react'
import {zodResolver} from '@hookform/resolvers/zod'
import {Link} from 'react-router'
import {useForm} from 'react-hook-form'
import {ApiClientError} from '../../../api/ApiClientError'
import {authApi} from '../api/authApi'
import {
  registrationSchema,
  type RegistrationFormValues,
} from '../validation/registrationSchema'
import PasswordVisibilityButton from "../components/PasswordVisibilityButton.tsx";

const inputClasses =
  'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#1F7A5C] focus:ring-2 focus:ring-[#1F7A5C]/20 disabled:cursor-not-allowed disabled:bg-slate-100'


const registrationFields = new Set<keyof RegistrationFormValues>([
  'firstName',
  'lastName',
  'email',
  'password',
  'confirmPassword',
])

function isRegistrationField(
  field: string,
): field is keyof RegistrationFormValues {
  return registrationFields.has(field as keyof RegistrationFormValues)
}

export default function RegisterPage() {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: {errors, isSubmitting},
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: RegistrationFormValues) {
    setSubmitError(null)

    try {
      const response = await authApi.register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
      })

      setRegisteredEmail(response.data.email)
    } catch (error) {
      if (!(error instanceof ApiClientError)) {
        setSubmitError('Something went wrong. Please try again.')
        return
      }

      let hasFieldError = false

      if (error.validationErrors) {
        Object.entries(error.validationErrors).forEach(([field, message]) => {
          if (isRegistrationField(field)) {
            setError(field, {
              type: 'server',
              message,
            })
            hasFieldError = true
          }
        })
      }

      if (hasFieldError) {
        return
      }

      setSubmitError(
        error.isNetworkError
          ? 'Unable to reach Salif. Check that the backend is running.'
          : error.message,
      )
    }
  }

  if (registeredEmail) {
    return (
      <section className="w-full max-w-md text-center" aria-labelledby="registration-title">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-[#1F7A5C]">
          <svg
            className="size-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 7l9 6 9-6" />
            <rect x="3" y="5" width="18" height="14" rx="2" />
          </svg>
        </div>

        <p className="mt-5 text-sm font-semibold text-[#1F7A5C]">
          Account created
        </p>

        <h1
          id="registration-title"
          className="mt-2 text-3xl font-semibold text-slate-950"
        >
          Check your email
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          We sent a verification link to{' '}
          <strong className="font-semibold text-slate-900">
            {registeredEmail}
          </strong>
          .
        </p>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm leading-6 text-slate-600">
          Didn't get it? Check your spam folder, or request a new link below.
        </div>

        <Link
          to={`/resend-verification?email=${encodeURIComponent(registeredEmail)}`}
          className="mt-7 inline-flex w-full justify-center rounded-lg bg-[#1F7A5C] px-4 py-2.5 font-semibold text-white transition hover:bg-[#19664D] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C] focus:ring-offset-2"
        >
          Resend verification email
        </Link>

        <Link
          to="/login"
          className="mt-4 block text-sm font-semibold text-slate-700 hover:text-slate-950 hover:underline"
        >
          Return to sign in
        </Link>
      </section>
    )
  }

  return (
    <section className="w-full max-w-md" aria-labelledby="registration-title">
      <header>
        <p className="text-sm font-semibold text-[#1F7A5C]">Get started</p>

        <h1
          id="registration-title"
          className="mt-2 text-3xl font-semibold tracking-tight text-slate-950"
        >
          Create your account
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Start tracking your finances with Salif.
        </p>
      </header>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="firstName"
              className="text-sm font-medium text-slate-800"
            >
              First name
            </label>

            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              disabled={isSubmitting}
              aria-invalid={errors.firstName ? 'true' : 'false'}
              aria-describedby={
                errors.firstName ? 'firstName-error' : undefined
              }
              className={`mt-2 ${inputClasses}`}
              {...register('firstName')}
            />

            {errors.firstName && (
              <p
                id="firstName-error"
                className="mt-1.5 text-sm text-red-600"
                role="alert"
              >
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="text-sm font-medium text-slate-800"
            >
              Last name
            </label>

            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              disabled={isSubmitting}
              aria-invalid={errors.lastName ? 'true' : 'false'}
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              className={`mt-2 ${inputClasses}`}
              {...register('lastName')}
            />

            {errors.lastName && (
              <p
                id="lastName-error"
                className="mt-1.5 text-sm text-red-600"
                role="alert"
              >
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-medium text-slate-800">
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

        <div>
          <label
            htmlFor="password"
            className="text-sm font-medium text-slate-800"
          >
            Password
          </label>

          <div className="relative mt-2">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              disabled={isSubmitting}
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={
                errors.password ? 'password-error' : 'password-help'
              }
              className={`${inputClasses} pr-12`}
              {...register('password')}
            />

            <PasswordVisibilityButton
              visible={showPassword}
              fieldLabel="password"
              onToggle={() => setShowPassword((visible) => !visible)}
            />
          </div>

          {errors.password ? (
            <p
              id="password-error"
              className="mt-1.5 text-sm text-red-600"
              role="alert"
            >
              {errors.password.message}
            </p>
          ) : (
            <p id="password-help" className="mt-1.5 text-xs text-slate-500">
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
            Confirm password
          </label>

          <div className="relative mt-2">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              disabled={isSubmitting}
              aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              aria-describedby={
                errors.confirmPassword ? 'confirmPassword-error' : undefined
              }
              className={`${inputClasses} pr-12`}
              {...register('confirmPassword')}
            />

            <PasswordVisibilityButton
              visible={showConfirmPassword}
              fieldLabel="confirmed password"
              onToggle={() =>
                setShowConfirmPassword((visible) => !visible)
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
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-[#1F7A5C] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </section>
  )
}
