import { zodResolver } from '@hookform/resolvers/zod'
import {
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router'

import { ApiClientError } from '../../../api/ApiClientError'
import PasswordVisibilityButton from '../components/PasswordVisibilityButton'
import { useAuth } from '../context/useAuth'
import {
  loginSchema,
  type LoginFormValues,
} from '../validation/loginSchema'

const inputClasses =
  'block w-full rounded-xl border border-[#d6d2c8] bg-[#fffdf8] px-3.5 py-3 ' +
  'text-sm text-[#092f28] outline-none transition placeholder:text-slate-400 ' +
  'focus:border-[#16805f] focus:ring-2 focus:ring-[#16805f]/20 ' +
  'disabled:cursor-not-allowed disabled:bg-[#efede6]'

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

export default function LoginPage() {
  const [showPassword, setShowPassword] =
    useState(false)

  const [submitError, setSubmitError] =
    useState<string | null>(null)

  const { login, status } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const redirectTo = getRedirectPath(
    location.state,
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
    resolver: zodResolver(loginSchema),
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
      const result = await login({
        email: values.email.trim(),
        password: values.password,
      })

      if (result.status === 'MFA_REQUIRED') {
        if (!result.mfaChallenge) {
          setSubmitError(
            'Salif returned an invalid authentication challenge.',
          )
          return
        }

        navigate('/login/mfa', {
          replace: true,
          state: {
            challenge: result.mfaChallenge,
            from: redirectTo,
          },
        })

        return
      }

      navigate(redirectTo, {
        replace: true,
      })
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
      }

      if (error.validationErrors?.password) {
        setError('password', {
          type: 'server',
          message:
            error.validationErrors.password,
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
          ? 'We couldn’t connect to Salif right now. Please try again in a moment.'
          : error.message,
      )
    }
  }

  if (status === 'authenticated') {
    return (
      <Navigate
        to={redirectTo}
        replace
      />
    )
  }

  return (
    <section
      className="auth-panel-enter rounded-[2rem] border border-white/80 bg-white/64 p-6 shadow-[0_26px_80px_rgba(9,47,40,0.14)] ring-1 ring-[#0d4f3f]/5 backdrop-blur-2xl sm:p-8"
      aria-labelledby="login-title"
    >
      <header>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#16805f]">
          <span className="grid size-7 place-items-center rounded-full bg-[#e0eee8]">
            <LockKeyhole
              size={14}
              aria-hidden
            />
          </span>

          Welcome back
        </div>

        <h1
          id="login-title"
          className="mt-4 font-serif text-4xl leading-tight tracking-[-0.025em] text-[#092f28]"
        >
          Sign in to Salif
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#657972]">
          Pick up where you left off and keep your money
          moving with purpose.
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
            className="text-sm font-semibold text-[#173c32]"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            disabled={isSubmitting}
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

        <div>
          <div className="flex items-center justify-between gap-4">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-[#173c32]"
            >
              Password
            </label>

            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-[#16805f] transition hover:text-[#0d4f3f] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative mt-2">
            <input
              id="password"
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              autoComplete="current-password"
              disabled={isSubmitting}
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
              className={`${inputClasses} pr-12`}
              {...register('password')}
            />

            <PasswordVisibilityButton
              visible={showPassword}
              fieldLabel="password"
              onToggle={() =>
                setShowPassword(
                  (visible) => !visible,
                )
              }
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
            className="auth-message-in rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            role="alert"
          >
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={
            isSubmitting ||
            status === 'checking'
          }
          className="flex w-full justify-center rounded-full bg-[#0d4f3f] px-4 py-3 font-semibold text-white shadow-[0_10px_25px_rgba(13,79,63,0.18)] transition hover:-translate-y-0.5 hover:bg-[#092f28] focus:outline-none focus:ring-2 focus:ring-[#16805f] focus:ring-offset-2 disabled:translate-y-0 disabled:opacity-60"
        >
          {isSubmitting
            ? 'Signing in…'
            : 'Sign in'}
        </button>
      </form>

      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[#edf3ef] px-4 py-3 text-xs leading-5 text-[#526b63]">
        <ShieldCheck
          size={17}
          className="mt-0.5 shrink-0 text-[#16805f]"
          aria-hidden
        />

        <span>
          Protected by secure sessions and optional
          multi-factor authentication.
        </span>
      </div>

      <p className="mt-6 text-center text-sm text-[#657972]">
        Don’t have an account?{' '}

        <Link
          to="/register"
          className="font-semibold text-[#16805f] transition hover:text-[#0d4f3f] hover:underline"
        >
          Create an account
        </Link>
      </p>
    </section>
  )
}