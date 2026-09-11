import {zodResolver} from '@hookform/resolvers/zod'
import {
  CheckCircle2,
  LoaderCircle,
} from 'lucide-react'
import {useState} from 'react'
import {useForm} from 'react-hook-form'
import {Link} from 'react-router'

import {ApiClientError} from '../../../api/ApiClientError'
import {authApi} from '../api/authApi'
import LegalNoticeDialog, {
  type LegalDocument,
} from '../components/LegalNoticeDialog'
import PasswordVisibilityButton from '../components/PasswordVisibilityButton'
import {
  formatCooldown,
  useRequestCooldown,
} from '../hooks/useRequestCooldown'
import {
  registrationSchema,
  type RegistrationFormValues,
} from '../validation/registrationSchema'

const VERIFICATION_COOLDOWN_KEY =
  'salif:cooldown:email-verification'

const inputClasses =
  'block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 ' +
  'text-sm text-slate-950 outline-none transition placeholder:text-slate-400 ' +
  'focus:border-[#1F7A5C] focus:ring-2 focus:ring-[#1F7A5C]/20 ' +
  'disabled:cursor-not-allowed disabled:bg-slate-100'

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

export default function RegisterPage() {
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

  const [legalDocument, setLegalDocument] =
    useState<LegalDocument | null>(null)

  const verificationCooldown = useRequestCooldown(
    VERIFICATION_COOLDOWN_KEY,
  )

  const {
    register,
    handleSubmit,
    setError,
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
        className="w-full max-w-md text-center"
        aria-labelledby="registration-title"
      >
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-[#1F7A5C]">
          <CheckCircle2
            size={28}
            aria-hidden
          />
        </span>

        <p className="mt-5 text-sm font-semibold text-[#1F7A5C]">
          Account created
        </p>

        <h1
          id="registration-title"
          className="mt-2 font-serif text-4xl text-[#173c32]"
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

        <div className="mt-6 rounded-2xl border border-[#dfe7e1] bg-[#eef5f1] px-4 py-3 text-left text-sm leading-6 text-[#526b63]">
          Check your spam folder if it does not arrive.
          To protect your inbox, another link can only
          be requested after the timer finishes.
        </div>

        {verificationCooldown.isCoolingDown ? (
          <button
            type="button"
            disabled
            className="mt-6 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-[#dce8e1] px-4 py-3 font-semibold text-[#527064]"
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
            to={`/resend-verification?email=${encodeURIComponent(registeredEmail)}`}
            className="mt-6 inline-flex w-full cursor-pointer justify-center rounded-full bg-[#1F7A5C] px-4 py-3 font-semibold text-white transition hover:bg-[#19664D] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C] focus:ring-offset-2"
          >
            Resend verification email
          </Link>
        )}

        <Link
          to="/login"
          className="mt-4 block cursor-pointer text-sm font-semibold text-slate-700 hover:text-slate-950 hover:underline"
        >
          Return to sign in
        </Link>
      </section>
    )
  }

  return (
    <>
      <section
        className="w-full max-w-md"
        aria-labelledby="registration-title"
      >
        <header>
          <p className="text-xs font-semibold tracking-[0.14em] text-[#1F7A5C]">
            GET STARTED
          </p>

          <h1
            id="registration-title"
            className="mt-2 font-serif text-4xl leading-tight text-[#173c32]"
          >
            Create your account
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            A clearer picture of your money starts here.
          </p>
        </header>

        <form
          className="mt-6 space-y-4"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
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
                className="text-sm font-medium text-slate-800"
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-800"
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
                className="text-sm font-medium text-slate-800"
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
              className="text-xs leading-5 text-slate-500"
            >
              Use 12–72 characters with uppercase,
              lowercase, a number and a symbol.
            </p>
          )}

          <div className="rounded-xl border border-[#dfe7e1] bg-[#f2f6f3] p-3">
            <div className="flex items-start gap-2.5">
              <input
                id="acceptTerms"
                type="checkbox"
                disabled={isSubmitting}
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
                className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-slate-300 accent-[#1F7A5C]"
                {...register('acceptTerms')}
              />

              <p className="text-xs leading-5 text-slate-600">
                <label
                  htmlFor="acceptTerms"
                  className="cursor-pointer"
                >
                  I agree to Salif’s{' '}
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setLegalDocument('terms')
                  }
                  className="cursor-pointer font-semibold text-[#1F7A5C] hover:underline"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() =>
                    setLegalDocument('privacy')
                  }
                  className="cursor-pointer font-semibold text-[#1F7A5C] hover:underline"
                >
                  Privacy Policy
                </button>
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
          </div>

          {submitError && (
            <div
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full cursor-pointer justify-center rounded-full bg-[#1F7A5C] px-4 py-3 font-semibold text-white transition hover:bg-[#19664D] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? 'Creating account…'
              : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="cursor-pointer font-semibold text-[#1F7A5C] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </section>

      {legalDocument && (
        <LegalNoticeDialog
          document={legalDocument}
          onClose={() =>
            setLegalDocument(null)
          }
        />
      )}
    </>
  )
}