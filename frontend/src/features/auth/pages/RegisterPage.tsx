import { zodResolver } from '@hookform/resolvers/zod'
import {
  Check,
  CheckCircle2,
  LoaderCircle,
  ShieldCheck,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'

import { ApiClientError } from '../../../api/ApiClientError'
import { authApi } from '../api/authApi'
import PasswordVisibilityButton from '../components/PasswordVisibilityButton'
import {
  formatCooldown,
  useRequestCooldown,
} from '../hooks/useRequestCooldown'
import {
  registrationSchema,
  type RegistrationFormValues,
} from '../validation/registrationSchema'
import GoogleSignInButton from '../components/GoogleSignInButton'
import { useAuth } from '../context/useAuth'


const VERIFICATION_COOLDOWN_KEY =
  'salif:cooldown:email-verification'

const inputClasses =
  'block w-full rounded-xl border border-[#d6d2c8] bg-[#fffdf8] px-3.5 py-2.5 ' +
  'text-sm text-[#092f28] outline-none transition placeholder:text-slate-400 ' +
  'focus:border-[#16805f] focus:ring-2 focus:ring-[#16805f]/20 ' +
  'disabled:cursor-not-allowed disabled:bg-[#efede6]'

const registrationFields = new Set<
  keyof RegistrationFormValues
>([
  'firstName',
  'lastName',
  'email',
  'password',
  'confirmPassword',
])

function isRegistrationField(
  field: string,
): field is keyof RegistrationFormValues {
  return registrationFields.has(
    field as keyof RegistrationFormValues,
  )
}

function RegistrationSteps({
  complete = false,
}: {
  readonly complete?: boolean
}) {
  return (
    <div
      className="mb-6 flex items-center gap-3"
      aria-label={
        complete
          ? 'Step 2 of 2: verify your email'
          : 'Step 1 of 2: create your account'
      }
    >
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${complete
          ? 'bg-[#e0eee8] text-[#16805f]'
          : 'bg-[#0d4f3f] text-white'
          }`}
      >
        {complete ? (
          <Check
            size={15}
            aria-hidden
          />
        ) : (
          '1'
        )}
      </span>

      <span
        className={`text-xs font-semibold ${complete
          ? 'text-[#657972]'
          : 'text-[#173c32]'
          }`}
      >
        Create account
      </span>

      <span className="h-px flex-1 bg-[#d6d2c8]" />

      <span
        className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${complete
          ? 'bg-[#0d4f3f] text-white'
          : 'border border-[#d6d2c8] bg-[#f4f1e8] text-[#657972]'
          }`}
      >
        2
      </span>

      <span
        className={`text-xs font-semibold ${complete
          ? 'text-[#173c32]'
          : 'text-[#657972]'
          }`}
      >
        Verify email
      </span>
    </div>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()

  const {
    googleLogin,
    status,
  } = useAuth()

  const [
    googleSubmitting,
    setGoogleSubmitting,
  ] = useState(false)

  const [submitError, setSubmitError] =
    useState<string | null>(null)

  const [registeredEmail, setRegisteredEmail] =
    useState<string | null>(null)

  const [showPassword, setShowPassword] =
    useState(false)

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false)

  const verificationCooldown = useRequestCooldown(
    VERIFICATION_COOLDOWN_KEY,
  )

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  const acceptTerms =
    watch('acceptTerms')

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
          'Your account was created. Check your email and verify your address before signing in.',
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

  async function onSubmit(
    values: RegistrationFormValues,
  ) {
    setSubmitError(null)

    try {
      const response = await authApi.register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
      })

      verificationCooldown.startCooldown()
      setRegisteredEmail(response.data.email)
    } catch (error) {
      if (!(error instanceof ApiClientError)) {
        setSubmitError(
          'Something went wrong. Please try again.',
        )
        return
      }

      let hasFieldError = false

      if (error.validationErrors) {
        Object.entries(
          error.validationErrors,
        ).forEach(([field, message]) => {
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
          ? 'We couldn’t connect to Salif right now. Please try again in a moment.'
          : error.message,
      )
    }
  }

  if (registeredEmail) {
    return (
      <section
        className="auth-panel-enter rounded-[2rem] border border-white/80 bg-white/66 p-6 shadow-[0_26px_80px_rgba(9,47,40,0.14)] ring-1 ring-[#0d4f3f]/5 backdrop-blur-2xl sm:p-8"
        aria-labelledby="registration-title"
      >
        <RegistrationSteps complete />

        <div className="text-center">
          <span className="auth-success-pop mx-auto grid size-16 place-items-center rounded-full bg-[#e0eee8] text-[#16805f] ring-8 ring-[#f2f6f3]">
            <CheckCircle2
              size={31}
              aria-hidden
            />
          </span>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#16805f]">
            Account created
          </p>

          <h1
            id="registration-title"
            className="mt-2 font-serif text-4xl tracking-[-0.025em] text-[#092f28]"
          >
            Check your email
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#657972]">
            We sent a verification link to{' '}

            <strong className="font-semibold text-[#173c32]">
              {registeredEmail}
            </strong>
            .
          </p>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#d7e5de] bg-[#edf3ef] px-4 py-3 text-sm leading-6 text-[#526b63]">
          <ShieldCheck
            size={18}
            className="mt-0.5 shrink-0 text-[#16805f]"
            aria-hidden
          />

          <span>
            Check your spam folder if it does not arrive.
            Another link becomes available when the timer
            finishes.
          </span>
        </div>

        {verificationCooldown.isCoolingDown ? (
          <button
            type="button"
            disabled
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#dce8e1] px-4 py-3 font-semibold text-[#527064]"
          >
            <LoaderCircle
              size={17}
              className="animate-spin"
              aria-hidden
            />

            Resend available in{' '}

            {formatCooldown(
              verificationCooldown.remainingSeconds,
            )}
          </button>
        ) : (
          <Link
            to={`/resend-verification?email=${encodeURIComponent(
              registeredEmail,
            )}`}
            className="mt-6 inline-flex w-full justify-center rounded-full bg-[#0d4f3f] px-4 py-3 font-semibold text-white transition hover:bg-[#092f28] focus:outline-none focus:ring-2 focus:ring-[#16805f] focus:ring-offset-2"
          >
            Resend verification email
          </Link>
        )}

        <Link
          to="/login"
          className="mt-4 block text-center text-sm font-semibold text-[#526b63] transition hover:text-[#092f28] hover:underline"
        >
          Return to sign in
        </Link>
      </section>
    )
  }

  return (
    <section
      className="auth-panel-enter rounded-[2rem] border border-white/80 bg-white/66 p-5 shadow-[0_26px_80px_rgba(9,47,40,0.14)] ring-1 ring-[#0d4f3f]/5 backdrop-blur-2xl sm:p-7"
      aria-labelledby="registration-title"
    >
      <RegistrationSteps />

      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#16805f]">
          Get started
        </p>

        <h1
          id="registration-title"
          className="mt-2 font-serif text-4xl leading-tight tracking-[-0.025em] text-[#092f28]"
        >
          Create your account
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#657972]">
          A clearer picture of your money starts here.
        </p>
      </header>

      <form
        className="mt-5 space-y-3.5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="grid gap-3.5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="firstName"
              className="text-sm font-semibold text-[#173c32]"
            >
              First name
            </label>

            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              disabled={isSubmitting}
              aria-invalid={
                errors.firstName
                  ? 'true'
                  : 'false'
              }
              aria-describedby={
                errors.firstName
                  ? 'firstName-error'
                  : undefined
              }
              className={`mt-1.5 ${inputClasses}`}
              {...register('firstName')}
            />

            {errors.firstName && (
              <p
                id="firstName-error"
                className="mt-1.5 text-xs text-red-600"
                role="alert"
              >
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="text-sm font-semibold text-[#173c32]"
            >
              Last name
            </label>

            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              disabled={isSubmitting}
              aria-invalid={
                errors.lastName
                  ? 'true'
                  : 'false'
              }
              aria-describedby={
                errors.lastName
                  ? 'lastName-error'
                  : undefined
              }
              className={`mt-1.5 ${inputClasses}`}
              {...register('lastName')}
            />

            {errors.lastName && (
              <p
                id="lastName-error"
                className="mt-1.5 text-xs text-red-600"
                role="alert"
              >
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

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
            className={`mt-1.5 ${inputClasses}`}
            {...register('email')}
          />

          {errors.email && (
            <p
              id="email-error"
              className="mt-1.5 text-xs text-red-600"
              role="alert"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="password"
              className="text-sm font-semibold text-[#173c32]"
            >
              Password
            </label>

            <div className="relative mt-1.5">
              <input
                id="password"
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                autoComplete="new-password"
                disabled={isSubmitting}
                aria-invalid={
                  errors.password
                    ? 'true'
                    : 'false'
                }
                aria-describedby={
                  errors.password
                    ? 'password-error'
                    : 'password-help'
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
                className="mt-1.5 text-xs text-red-600"
                role="alert"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="text-sm font-semibold text-[#173c32]"
            >
              Confirm password
            </label>

            <div className="relative mt-1.5">
              <input
                id="confirmPassword"
                type={
                  showConfirmPassword
                    ? 'text'
                    : 'password'
                }
                autoComplete="new-password"
                disabled={isSubmitting}
                aria-invalid={
                  errors.confirmPassword
                    ? 'true'
                    : 'false'
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
                visible={showConfirmPassword}
                fieldLabel="confirmed password"
                onToggle={() =>
                  setShowConfirmPassword(
                    (visible) => !visible,
                  )
                }
              />
            </div>

            {errors.confirmPassword && (
              <p
                id="confirmPassword-error"
                className="mt-1.5 text-xs text-red-600"
                role="alert"
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        {!errors.password && (
          <p
            id="password-help"
            className="text-xs leading-5 text-[#657972]"
          >
            Use 12–72 characters with uppercase,
            lowercase, a number and a symbol.
          </p>
        )}

        <div className="rounded-xl border border-[#d7e5de] bg-[#f2f6f3] p-3">
          <div className="flex items-start gap-2.5">
            <input
              id="acceptTerms"
              type="checkbox"
              disabled={isSubmitting}
              aria-label="I agree to Salif’s Terms of Service and Privacy Policy"
              aria-invalid={
                errors.acceptTerms
                  ? 'true'
                  : 'false'
              }
              aria-describedby={
                errors.acceptTerms
                  ? 'acceptTerms-error'
                  : undefined
              }
              className="mt-0.5 size-4 shrink-0 rounded border-[#aebdb6] accent-[#16805f]"
              {...register('acceptTerms')}
            />

            <p className="text-xs leading-5 text-[#526b63]">
              <label
                htmlFor="acceptTerms"
                className="cursor-pointer"
              >
                I agree to Salif’s{' '}
              </label>

              <Link
                to="/terms"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#16805f] hover:text-[#0d4f3f] hover:underline"
              >
                Terms of Service
              </Link>{' '}
              and{' '}

              <Link
                to="/privacy"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#16805f] hover:text-[#0d4f3f] hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          {errors.acceptTerms && (
            <p
              id="acceptTerms-error"
              className="mt-2 text-xs font-medium text-red-600"
              role="alert"
            >
              {errors.acceptTerms.message}
            </p>
          )}

          <div className="space-y-4">
            <GoogleSignInButton
              text="signup_with"
              disabled={
                !acceptTerms ||
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

            <div className="flex items-center gap-4">
              <span className="h-px flex-1 bg-[#d6d2c8]" />

              <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-[#8a958f]">
                or sign up with email
              </span>

              <span className="h-px flex-1 bg-[#d6d2c8]" />
            </div>
          </div>
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
          disabled={isSubmitting}
          className="flex w-full justify-center rounded-full bg-[#0d4f3f] px-4 py-3 font-semibold text-white shadow-[0_10px_25px_rgba(13,79,63,0.18)] transition hover:-translate-y-0.5 hover:bg-[#092f28] focus:outline-none focus:ring-2 focus:ring-[#16805f] focus:ring-offset-2 disabled:translate-y-0 disabled:opacity-60"
        >
          {isSubmitting
            ? 'Creating account…'
            : 'Create account'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-[#657972]">
        Already have an account?{' '}

        <Link
          to="/login"
          className="font-semibold text-[#16805f] transition hover:text-[#0d4f3f] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </section>
  )
}