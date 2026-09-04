import {useState} from 'react'
import {zodResolver} from '@hookform/resolvers/zod'
import {Link, Navigate, useLocation, useNavigate} from 'react-router'
import {useForm} from 'react-hook-form'
import {ApiClientError} from '../../../api/ApiClientError'
import PasswordVisibilityButton from '../components/PasswordVisibilityButton'
import {useAuth} from '../context/useAuth'
import {loginSchema, type LoginFormValues,} from '../validation/loginSchema'

const inputClasses =
  'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950' +
  'outline-none transition placeholder:text-slate-400 focus:border-[#1F7A5C] focus:ring-2' +
  'focus:ring-[#1F7A5C]/20 disabled:cursor-not-allowed disabled:bg-slate-100'


function getRedirectPath(state: unknown): string {
  if (typeof state !== 'object' || state === null) {
    return '/dashboard'
  }

  const {from} = state as { from?: unknown }

  if (
    typeof from === 'string' &&
    from.startsWith('/') &&
    !from.startsWith('//')
  ) {
    return from
  }

  return '/dashboard'
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {login, status} = useAuth()
  const navigate = useNavigate()

  const location = useLocation()
  const redirectTo = getRedirectPath(location.state)

  const {
    register,
    handleSubmit,
    setError,
    formState: {errors, isSubmitting},
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginFormValues) {
    setSubmitError(null)

    try {
      await login({
        email: values.email.trim(),
        password: values.password,
      })

      navigate(redirectTo, {replace: true})
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
      }

      if (error.validationErrors?.password) {
        setError('password', {
          type: 'server',
          message: error.validationErrors.password,
        })
      }

      if (
        error.validationErrors?.email ||
        error.validationErrors?.password
      ) {
        return
      }

      setSubmitError(
        error.isNetworkError
          ? 'Unable to reach Salif. Check that the backend is running.'
          : error.message,
      )
    }
  }

  if (status === 'authenticated') {
    return <Navigate to={redirectTo} replace/>
  }

  return (
    <section className="w-full max-w-md" aria-labelledby="login-title">
      <header>
        <p className="text-sm font-semibold text-[#1F7A5C]">Welcome back</p>

        <h1
          id="login-title"
          className="mt-2 text-3xl font-semibold tracking-tight text-slate-950"
        >
          Sign in to Salif
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Continue managing your finances.
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

        <div>
          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-800"
            >
              Password
            </label>

            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-[#1F7A5C] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative mt-2">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              disabled={isSubmitting}
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={
                errors.password ? 'password-error' : undefined
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

          {errors.password && (
            <p
              id="password-error"
              className="mt-1.5 text-sm text-red-600"
              role="alert"
            >
              {errors.password.message}
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
          disabled={isSubmitting || status === 'checking'}
          className="flex w-full justify-center rounded-lg bg-[#1F7A5C] px-4 py-2.5 font-semibold text-white transition hover:bg-[#19664D] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Don’t have an account?{' '}
        <Link
          to="/register"
          className="font-semibold text-[#1F7A5C] hover:underline"
        >
          Create an account
        </Link>
      </p>
    </section>
  )
}
