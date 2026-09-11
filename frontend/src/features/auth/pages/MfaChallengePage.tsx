import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  KeyRound,
  ShieldCheck,
} from 'lucide-react'
import { useState } from 'react'
import {
  Controller,
  useForm,
} from 'react-hook-form'
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router'

import { ApiClientError } from '../../../api/ApiClientError'
import type { MfaChallengeResponse } from '../api/types'
import OtpCodeInput from '../components/OtpCodeInput'
import { useAuth } from '../context/useAuth'
import {
  mfaCodeSchema,
  mfaRecoverySchema,
  type MfaCodeFormValues,
  type MfaRecoveryFormValues,
} from '../validation/mfaSchemas'

interface MfaLocationState {
  challenge: MfaChallengeResponse
  from: string
}

const inputClasses =
  'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 ' +
  'outline-none transition placeholder:text-slate-400 focus:border-[#1F7A5C] focus:ring-2 ' +
  'focus:ring-[#1F7A5C]/20 disabled:cursor-not-allowed disabled:bg-slate-100'

function getLocationState(
  value: unknown,
): MfaLocationState | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  const candidate = value as {
    challenge?: unknown
    from?: unknown
  }

  if (
    typeof candidate.challenge !== 'object' ||
    candidate.challenge === null
  ) {
    return null
  }

  const challenge = candidate.challenge as {
    challengeToken?: unknown
    expiresAt?: unknown
  }

  if (
    typeof challenge.challengeToken !== 'string' ||
    typeof challenge.expiresAt !== 'string'
  ) {
    return null
  }

  const from =
    typeof candidate.from === 'string' &&
    candidate.from.startsWith('/') &&
    !candidate.from.startsWith('//')
      ? candidate.from
      : '/dashboard'

  return {
    challenge: {
      challengeToken: challenge.challengeToken,
      expiresAt: challenge.expiresAt,
    },
    from,
  }
}

function challengeExpiry(expiresAt: string) {
  const date = new Date(expiresAt)

  if (Number.isNaN(date.getTime())) {
    return 'This challenge expires shortly.'
  }

  return `This challenge expires at ${new Intl.DateTimeFormat(
    'en-ZA',
    {
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(date)}.`
}

function errorMessage(error: unknown) {
  if (!(error instanceof ApiClientError)) {
    return 'Something went wrong. Please try again.'
  }

  if (error.status === 429) {
    return 'Too many attempts. Please sign in again to request a new challenge.'
  }

  if (error.status === 401) {
    return 'That code is invalid or the challenge has expired.'
  }

  return error.isNetworkError
    ? 'We couldn’t connect to Salif right now. Please try again in a moment.'
    : error.message
}

export default function MfaChallengePage() {
  const [useRecoveryCode, setUseRecoveryCode] =
    useState(false)
  const [submitError, setSubmitError] =
    useState<string | null>(null)

  const location = useLocation()
  const navigate = useNavigate()
  const state = getLocationState(location.state)
  const {
    recoverMfa,
    status,
    verifyMfa,
  } = useAuth()

  const codeForm = useForm<MfaCodeFormValues>({
    resolver: zodResolver(mfaCodeSchema),
    defaultValues: {
      code: '',
    },
  })

  const recoveryForm =
    useForm<MfaRecoveryFormValues>({
      resolver: zodResolver(mfaRecoverySchema),
      defaultValues: {
        recoveryCode: '',
      },
    })

  if (!state) {
    return <Navigate to="/login" replace />
  }

  if (status === 'authenticated') {
    return <Navigate to={state.from} replace />
  }

  const challenge = state.challenge
  const redirectTo = state.from

  async function submitCode(
    values: MfaCodeFormValues,
  ) {
    setSubmitError(null)

    try {
      await verifyMfa({
        challengeToken:
          challenge.challengeToken,
        code: values.code.trim(),
      })

      navigate(redirectTo, { replace: true })
    } catch (error) {
      setSubmitError(errorMessage(error))
    }
  }

  async function submitRecoveryCode(
    values: MfaRecoveryFormValues,
  ) {
    setSubmitError(null)

    try {
      await recoverMfa({
        challengeToken:
          challenge.challengeToken,
        recoveryCode:
          values.recoveryCode.trim(),
      })

      navigate(redirectTo, { replace: true })
    } catch (error) {
      setSubmitError(errorMessage(error))
    }
  }

  const isSubmitting =
    codeForm.formState.isSubmitting ||
    recoveryForm.formState.isSubmitting

  return (
    <section
      className="w-full max-w-md"
      aria-labelledby="mfa-title"
    >
      <header>
        <span className="grid size-12 place-items-center rounded-2xl bg-[#e0eee8] text-[#1F7A5C]">
          {useRecoveryCode ? (
            <KeyRound size={22} aria-hidden />
          ) : (
            <ShieldCheck size={23} aria-hidden />
          )}
        </span>

        <p className="mt-6 text-sm font-semibold text-[#1F7A5C]">
          One more step
        </p>

        <h1
          id="mfa-title"
          className="mt-2 text-3xl font-semibold tracking-tight text-slate-950"
        >
          {useRecoveryCode
            ? 'Use a recovery code'
            : 'Confirm it’s you'}
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {useRecoveryCode
            ? 'Enter one of the recovery codes you saved when you enabled two-factor authentication.'
            : 'Enter the 6-digit code from your authenticator app.'}
        </p>

        <p className="mt-2 text-xs text-slate-500">
          {challengeExpiry(challenge.expiresAt)}
        </p>
      </header>

      {useRecoveryCode ? (
        <form
          className="mt-8 space-y-5"
          onSubmit={recoveryForm.handleSubmit(
            submitRecoveryCode,
          )}
          noValidate
        >
          <div>
            <label
              htmlFor="recoveryCode"
              className="text-sm font-medium text-slate-800"
            >
              Recovery code
            </label>

            <input
              id="recoveryCode"
              type="text"
              autoComplete="off"
              spellCheck={false}
              disabled={isSubmitting}
              aria-invalid={
                recoveryForm.formState.errors
                  .recoveryCode
                  ? 'true'
                  : 'false'
              }
              aria-describedby={
                recoveryForm.formState.errors
                  .recoveryCode
                  ? 'recovery-code-error'
                  : undefined
              }
              className={`mt-2 ${inputClasses}`}
              {...recoveryForm.register(
                'recoveryCode',
              )}
            />

            {recoveryForm.formState.errors
              .recoveryCode && (
              <p
                id="recovery-code-error"
                className="mt-1.5 text-sm text-red-600"
                role="alert"
              >
                {
                  recoveryForm.formState.errors
                    .recoveryCode.message
                }
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
            className="flex w-full cursor-pointer justify-center rounded-lg bg-[#1F7A5C] px-4 py-2.5 font-semibold text-white transition hover:bg-[#19664D] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? 'Checking…'
              : 'Use recovery code'}
          </button>
        </form>
      ) : (
        <form
          className="mt-8 space-y-5"
          onSubmit={codeForm.handleSubmit(
            submitCode,
          )}
          noValidate
        >
          <div>
            <label
              htmlFor="code"
              className="text-sm font-medium text-slate-800"
            >
              Authenticator code
            </label>

            <div className="mt-3">
              <Controller
                name="code"
                control={codeForm.control}
                render={({ field }) => (
                  <OtpCodeInput
                    id="code"
                    name={field.name}
                    value={field.value}
                    disabled={isSubmitting}
                    invalid={Boolean(
                      codeForm.formState.errors.code,
                    )}
                    describedBy={
                      codeForm.formState.errors.code
                        ? 'code-error'
                        : undefined
                    }
                    inputRef={field.ref}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            {codeForm.formState.errors.code && (
              <p
                id="code-error"
                className="mt-1.5 text-sm text-red-600"
                role="alert"
              >
                {
                  codeForm.formState.errors.code
                    .message
                }
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
            className="flex w-full cursor-pointer justify-center rounded-lg bg-[#1F7A5C] px-4 py-2.5 font-semibold text-white transition hover:bg-[#19664D] focus:outline-none focus:ring-2 focus:ring-[#1F7A5C] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? 'Verifying…'
              : 'Verify and continue'}
          </button>
        </form>
      )}

      <div className="mt-6 space-y-4 text-center">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => {
            setSubmitError(null)
            setUseRecoveryCode(
              (current) => !current,
            )
          }}
          className="cursor-pointer text-sm font-semibold text-[#1F7A5C] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
        >
          {useRecoveryCode
            ? 'Use authenticator app instead'
            : 'Use a recovery code instead'}
        </button>

        <div>
          <Link
            to="/login"
            replace
            className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600 hover:text-slate-950"
          >
            <ArrowLeft size={15} aria-hidden />
            Back to sign in
          </Link>
        </div>
      </div>
    </section>
  )
}