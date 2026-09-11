import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import { useState } from 'react'

import { ApiClientError } from '../../../api/ApiClientError'
import type { MfaSetup } from '../api/types'
import {
  useMfaStatus,
  useStartMfaSetup,
} from '../hooks/useMfaManagement'
import MfaDisableDialog from './MfaDisableDialog'
import MfaRecoveryCodesDialog from './MfaRecoveryCodesDialog'
import MfaSetupDialog from './MfaSetupDialog'

type Notice = {
  tone: 'success' | 'error'
  message: string
}

function formatEnabledDate(
  value: string | null,
) {
  if (!value) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat('en-ZA', {
    dateStyle: 'medium',
  }).format(date)
}

export default function TwoFactorAuthenticationCard() {
  const statusQuery = useMfaStatus()
  const startSetup = useStartMfaSetup()

  const [setup, setSetup] =
    useState<MfaSetup | null>(null)

  const [
    showDisableDialog,
    setShowDisableDialog,
  ] = useState(false)

  const [
    showRecoveryDialog,
    setShowRecoveryDialog,
  ] = useState(false)

  const [notice, setNotice] =
    useState<Notice | null>(null)

  async function beginSetup() {
    setNotice(null)

    try {
      const response =
        await startSetup.mutateAsync()

      setSetup(response)
    } catch (error) {
      setNotice({
        tone: 'error',
        message:
          error instanceof ApiClientError
            ? error.message
            : 'Unable to start two-factor authentication setup.',
      })
    }
  }

  function finishSetup() {
    setSetup(null)

    setNotice({
      tone: 'success',
      message:
        'Two-factor authentication is now protecting your account.',
    })
  }

  function finishDisable() {
    setShowDisableDialog(false)

    setNotice({
      tone: 'success',
      message:
        'Two-factor authentication has been disabled.',
    })
  }

  const status = statusQuery.data

  const enabledDate = status
    ? formatEnabledDate(status.enabledAt)
    : null

  return (
    <>
      <section className="overflow-hidden rounded-3xl border border-[#dedbd2] bg-[#fffdf8]">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="flex gap-4">
            <span
              className={`grid size-11 shrink-0 place-items-center rounded-full ${
                status?.enabled
                  ? 'bg-[#dcece2] text-[#1F7A5C]'
                  : 'bg-[#eee9dc] text-[#8a7650]'
              }`}
            >
              <ShieldCheck
                size={21}
                aria-hidden
              />
            </span>

            <div>
              <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
                SIGN-IN SECURITY
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h2 className="font-serif text-3xl tracking-[-0.02em] text-[#173c32]">
                  Two-factor authentication
                </h2>

                {status && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      status.enabled
                        ? 'bg-[#dcece2] text-[#1F7A5C]'
                        : 'bg-[#eee9dc] text-[#796844]'
                    }`}
                  >
                    {status.enabled
                      ? 'Enabled'
                      : 'Not enabled'}
                  </span>
                )}
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#657972]">
                Add an authenticator code after
                your password to make your account
                much harder to access without your
                permission.
              </p>
            </div>
          </div>

          {statusQuery.isPending ? (
            <div className="flex items-center gap-2 text-sm text-[#657972]">
              <LoaderCircle
                size={17}
                className="animate-spin"
                aria-hidden
              />

              Checking status
            </div>
          ) : statusQuery.isError ? (
            <button
              type="button"
              onClick={() =>
                statusQuery.refetch()
              }
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[#174f43] px-5 py-2.5 text-sm font-semibold text-[#174f43] transition hover:bg-[#174f43] hover:text-white"
            >
              <RefreshCw
                size={16}
                aria-hidden
              />

              Try again
            </button>
          ) : status?.enabled ? (
            <button
              type="button"
              onClick={() =>
                setShowDisableDialog(true)
              }
              className="cursor-pointer rounded-full border border-[#d8b8ac] px-5 py-2.5 text-sm font-semibold text-[#9b4d38] transition hover:bg-[#f8e8e1]"
            >
              Disable
            </button>
          ) : (
            <button
              type="button"
              disabled={startSetup.isPending}
              onClick={beginSetup}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#174f43] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#103d34] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {startSetup.isPending && (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                  aria-hidden
                />
              )}

              {startSetup.isPending
                ? 'Preparing setup'
                : status?.setupPending
                  ? 'Restart setup'
                  : 'Set up now'}
            </button>
          )}
        </div>

        {statusQuery.isError && (
          <div className="mx-6 mb-6 flex items-start gap-3 rounded-2xl bg-[#f8e8e1] px-4 py-3 text-sm text-[#8d432f] sm:mx-8 sm:mb-8">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
              aria-hidden
            />

            <p>
              We couldn’t check your two-factor
              authentication status.
            </p>
          </div>
        )}

        {notice && (
          <div
            role={
              notice.tone === 'error'
                ? 'alert'
                : 'status'
            }
            className={`mx-6 mb-6 flex items-start gap-3 rounded-2xl px-4 py-3 text-sm sm:mx-8 sm:mb-8 ${
              notice.tone === 'success'
                ? 'bg-[#e5f1e8] text-[#28654f]'
                : 'bg-[#f8e8e1] text-[#8d432f]'
            }`}
          >
            {notice.tone === 'success' ? (
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0"
                aria-hidden
              />
            ) : (
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
                aria-hidden
              />
            )}

            <p>{notice.message}</p>
          </div>
        )}

        {status?.enabled && (
          <div className="grid border-t border-[#e4e1d8] bg-[#f6f7f2] sm:grid-cols-2">
            <div className="flex items-center gap-4 px-6 py-5 sm:px-8">
              <CheckCircle2
                size={20}
                className="shrink-0 text-[#4f806f]"
                aria-hidden
              />

              <div>
                <p className="text-sm font-semibold text-[#294e43]">
                  Authenticator connected
                </p>

                <p className="mt-1 text-xs text-[#657972]">
                  {enabledDate
                    ? `Enabled ${enabledDate}`
                    : 'Active on your account'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-[#e4e1d8] px-6 py-5 sm:border-l sm:border-t-0 sm:px-8">
              <div className="flex items-center gap-4">
                <KeyRound
                  size={20}
                  className="shrink-0 text-[#4f806f]"
                  aria-hidden
                />

                <div>
                  <p className="text-sm font-semibold text-[#294e43]">
                    {
                      status.remainingRecoveryCodes
                    }{' '}
                    recovery codes left
                  </p>

                  <p className="mt-1 text-xs text-[#657972]">
                    One-time emergency access
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowRecoveryDialog(true)
                }
                className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-[#4f806f] transition hover:bg-[#e3ebe4] hover:text-[#174f43]"
                aria-label="Generate new recovery codes"
                title="Generate new recovery codes"
              >
                <RefreshCw
                  size={17}
                  aria-hidden
                />
              </button>
            </div>
          </div>
        )}
      </section>

      {setup && (
        <MfaSetupDialog
          setup={setup}
          onClose={() => setSetup(null)}
          onEnabled={finishSetup}
        />
      )}

      {showDisableDialog && (
        <MfaDisableDialog
          onClose={() =>
            setShowDisableDialog(false)
          }
          onDisabled={finishDisable}
        />
      )}

      {showRecoveryDialog && (
        <MfaRecoveryCodesDialog
          onClose={() =>
            setShowRecoveryDialog(false)
          }
        />
      )}
    </>
  )
}