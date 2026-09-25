import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
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

import { ApiClientError } from '@/api/ApiClientError'
import type { MfaChallengeResponse } from '@/features/auth/api/types'
import AuthAlert from '@/features/auth/components/AuthAlert'
import AuthButton from '@/features/auth/components/AuthButton'
import AuthField from '@/features/auth/components/AuthField'
import AuthHeader from '@/features/auth/components/AuthHeader'
import AuthInput from '@/features/auth/components/AuthInput'
import AuthPanel from '@/features/auth/components/AuthPanel'
import OtpCodeInput from '@/features/auth/components/OtpCodeInput'
import { useAuth } from '@/features/auth/context/useAuth'
import {
  mfaCodeSchema,
  mfaRecoverySchema,
  type MfaCodeFormValues,
  type MfaRecoveryFormValues,
} from '@/features/auth/validation/mfaSchemas'

interface MfaLocationState {
  challenge: MfaChallengeResponse
  from: string
}

function getLocationState(
  value: unknown,
): MfaLocationState | null {
  if (
    typeof value !== 'object' ||
    value === null
  ) {
    return null
  }

  const candidate = value as {
    challenge?: unknown
    from?: unknown
  }

  if (
    typeof candidate.challenge !==
      'object' ||
    candidate.challenge === null
  ) {
    return null
  }

  const challenge =
    candidate.challenge as {
      challengeToken?: unknown
      expiresAt?: unknown
    }

  if (
    typeof challenge.challengeToken !==
      'string' ||
    typeof challenge.expiresAt !==
      'string'
  ) {
    return null
  }

  const from =
    typeof candidate.from ===
      'string' &&
    candidate.from.startsWith('/') &&
    !candidate.from.startsWith('//')
      ? candidate.from
      : '/dashboard'

  return {
    challenge: {
      challengeToken:
        challenge.challengeToken,
      expiresAt:
        challenge.expiresAt,
    },
    from,
  }
}

function challengeExpiry(
  expiresAt: string,
) {
  const date =
    new Date(expiresAt)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
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

function errorMessage(
  error: unknown,
) {
  if (
    !(
      error instanceof
      ApiClientError
    )
  ) {
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
  const [
    useRecoveryCode,
    setUseRecoveryCode,
  ] = useState(false)

  const [
    submitError,
    setSubmitError,
  ] = useState<string | null>(
    null,
  )

  const location =
    useLocation()

  const navigate =
    useNavigate()

  const state =
    getLocationState(
      location.state,
    )

  const {
    recoverMfa,
    status,
    verifyMfa,
  } = useAuth()

  const codeForm =
    useForm<MfaCodeFormValues>({
      resolver: zodResolver(
        mfaCodeSchema,
      ),
      defaultValues: {
        code: '',
      },
    })

  const recoveryForm =
    useForm<MfaRecoveryFormValues>({
      resolver: zodResolver(
        mfaRecoverySchema,
      ),
      defaultValues: {
        recoveryCode: '',
      },
    })

  if (!state) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (
    status ===
    'authenticated'
  ) {
    return (
      <Navigate
        to={state.from}
        replace
      />
    )
  }

  const challenge =
    state.challenge

  const redirectTo =
    state.from

  async function submitCode(
    values: MfaCodeFormValues,
  ) {
    setSubmitError(null)

    try {
      await verifyMfa({
        challengeToken:
          challenge.challengeToken,
        code:
          values.code.trim(),
      })

      navigate(
        redirectTo,
        {
          replace: true,
        },
      )
    } catch (error) {
      setSubmitError(
        errorMessage(error),
      )
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

      navigate(
        redirectTo,
        {
          replace: true,
        },
      )
    } catch (error) {
      setSubmitError(
        errorMessage(error),
      )
    }
  }

  const isSubmitting =
    codeForm.formState
      .isSubmitting ||
    recoveryForm.formState
      .isSubmitting

  return (
    <AuthPanel className="auth-panel-enter">
      <div
        aria-labelledby="mfa-title"
      >
        <AuthHeader
          title={
            useRecoveryCode
              ? 'Use a recovery code'
              : 'Confirm it’s you'
          }
          description={
            useRecoveryCode
              ? 'Enter one of the recovery codes you saved when you enabled two-factor authentication.'
              : 'Enter the 6-digit code from your authenticator app.'
          }
          titleId="mfa-title"
        />

        <p className="mt-2 text-xs text-[#7a8881]">
          {challengeExpiry(
            challenge.expiresAt,
          )}
        </p>

        {useRecoveryCode ? (
          <form
            className="mt-6 space-y-4"
            onSubmit={
              recoveryForm.handleSubmit(
                submitRecoveryCode,
              )
            }
            noValidate
          >
            <AuthField
              label="Recovery code"
              htmlFor="recoveryCode"
              error={
                recoveryForm
                  .formState
                  .errors
                  .recoveryCode
                  ?.message
              }
            >
              <AuthInput
                id="recoveryCode"
                type="text"
                autoComplete="off"
                spellCheck={false}
                autoFocus
                disabled={
                  isSubmitting
                }
                hasError={
                  Boolean(
                    recoveryForm
                      .formState
                      .errors
                      .recoveryCode,
                  )
                }
                aria-invalid={
                  recoveryForm
                    .formState
                    .errors
                    .recoveryCode
                    ? 'true'
                    : 'false'
                }
                {...recoveryForm.register(
                  'recoveryCode',
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
                isSubmitting
              }
              loading={
                isSubmitting
              }
              loadingLabel="Checking…"
            >
              Use recovery code
            </AuthButton>
          </form>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={
              codeForm.handleSubmit(
                submitCode,
              )
            }
            noValidate
          >
            <AuthField
              label="Authenticator code"
              htmlFor="code"
              error={
                codeForm
                  .formState
                  .errors
                  .code
                  ?.message
              }
            >
              <Controller
                name="code"
                control={
                  codeForm.control
                }
                render={({
                  field,
                }) => (
                  <OtpCodeInput
                    id="code"
                    name={
                      field.name
                    }
                    value={
                      field.value
                    }
                    disabled={
                      isSubmitting
                    }
                    invalid={
                      Boolean(
                        codeForm
                          .formState
                          .errors
                          .code,
                      )
                    }
                    describedBy={
                      codeForm
                        .formState
                        .errors
                        .code
                        ? 'code-error'
                        : undefined
                    }
                    inputRef={
                      field.ref
                    }
                    onBlur={
                      field.onBlur
                    }
                    onChange={
                      field.onChange
                    }
                  />
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
                isSubmitting
              }
              loading={
                isSubmitting
              }
              loadingLabel="Verifying…"
            >
              Verify and continue
            </AuthButton>
          </form>
        )}

        <div className="mt-5 space-y-4 text-center">
          <button
            type="button"
            disabled={
              isSubmitting
            }
            onClick={() => {
              setSubmitError(null)

              setUseRecoveryCode(
                (current) =>
                  !current,
              )
            }}
            className="
              cursor-pointer
              text-sm
              font-semibold
              text-[#16805f]
              transition
              hover:text-[#0d4f3f]
              hover:underline
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {useRecoveryCode
              ? 'Use authenticator app instead'
              : 'Use a recovery code instead'}
          </button>

          <div>
            <Link
              to="/login"
              replace
              className="
                inline-flex
                items-center
                gap-1.5
                text-sm
                text-[#657972]
                transition
                hover:text-[#173c32]
              "
            >
              <ArrowLeft
                size={14}
                aria-hidden
              />

              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </AuthPanel>
  )
}