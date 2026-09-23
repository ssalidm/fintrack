import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
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
import SettingsList from '../../../components/settings/SettingsList'

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

  return new Intl.DateTimeFormat(
    'en-ZA',
    {
      dateStyle: 'medium',
    },
  ).format(date)
}

export default function TwoFactorAuthenticationCard() {
  const statusQuery =
    useMfaStatus()

  const startSetup =
    useStartMfaSetup()

  const [
    setup,
    setSetup,
  ] = useState<MfaSetup | null>(
    null,
  )

  const [
    showDisableDialog,
    setShowDisableDialog,
  ] = useState(false)

  const [
    showRecoveryDialog,
    setShowRecoveryDialog,
  ] = useState(false)

  const [
    notice,
    setNotice,
  ] = useState<Notice | null>(
    null,
  )

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
          error instanceof
            ApiClientError
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

  const status =
    statusQuery.data

  const enabledDate =
    status
      ? formatEnabledDate(
          status.enabledAt,
        )
      : null

  return (
    <>
      <SettingsList topBorder={false}>
        <div
          className="
            grid
            gap-3
            py-4
            md:grid-cols-[180px_minmax(0,1fr)_auto]
            md:items-center
            md:gap-8
          "
        >
          <p className="text-sm font-medium text-muted">
            Two-factor authentication
          </p>

          <div className="min-w-0">
            {statusQuery.isPending ? (
              <div className="flex items-center gap-2 text-sm text-muted">
                <LoaderCircle
                  size={15}
                  className="animate-spin"
                  aria-hidden
                />

                Checking status
              </div>
            ) : statusQuery.isError ? (
              <p className="text-sm text-danger">
                Status unavailable
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-ink">
                  {status?.enabled
                    ? 'Enabled'
                    : 'Not enabled'}
                </p>

                {status?.enabled && (
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1
                      rounded-full
                      bg-success-soft
                      px-2 py-0.5
                      text-[11px]
                      font-semibold
                      text-success
                    "
                  >
                    <CheckCircle2
                      size={12}
                      aria-hidden
                    />

                    Protected
                  </span>
                )}

                {enabledDate &&
                  status?.enabled && (
                    <span className="text-xs text-subtle">
                      since {enabledDate}
                    </span>
                  )}
              </div>
            )}

            {!statusQuery.isPending &&
              !statusQuery.isError && (
                <p className="mt-1 text-xs leading-5 text-subtle">
                  {status?.enabled
                    ? 'An authenticator code is required when you sign in.'
                    : 'Add an authenticator code for stronger sign-in security.'}
                </p>
              )}
          </div>

          <div className="flex min-w-[86px] md:justify-end">
            {statusQuery.isPending ? null : statusQuery.isError ? (
              <button
                type="button"
                onClick={() =>
                  void statusQuery.refetch()
                }
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-md
                  border border-line-strong
                  bg-surface
                  px-3 py-1.5
                  text-xs font-semibold
                  text-ink
                  transition
                  hover:border-accent
                  hover:text-accent
                "
              >
                <RefreshCw
                  size={13}
                  aria-hidden
                />

                Try again
              </button>
            ) : status?.enabled ? (
              <button
                type="button"
                onClick={() =>
                  setShowDisableDialog(
                    true,
                  )
                }
                className="
                  rounded-full
                  border border-line-strong
                  bg-surface
                  px-3 py-1.5
                  text-xs font-semibold
                  text-ink
                  transition
                  hover:border-danger
                  hover:text-danger
                "
              >
                Disable
              </button>
            ) : (
              <button
                type="button"
                disabled={
                  startSetup.isPending
                }
                onClick={() =>
                  void beginSetup()
                }
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  border border-line-strong
                  bg-surface
                  px-3 py-1.5
                  text-xs font-semibold
                  text-ink
                  transition
                  hover:border-accent
                  hover:text-accent
                  disabled:opacity-50
                "
              >
                {startSetup.isPending && (
                  <LoaderCircle
                    size={13}
                    className="animate-spin"
                    aria-hidden
                  />
                )}

                {startSetup.isPending
                  ? 'Preparing'
                  : status?.setupPending
                    ? 'Restart setup'
                    : 'Set up'}
              </button>
            )}
          </div>
        </div>

        {status?.enabled && (
          <div
            className="
              grid
              gap-3
              py-4
              md:grid-cols-[180px_minmax(0,1fr)_auto]
              md:items-center
              md:gap-8
            "
          >
            <p className="text-sm font-medium text-muted">
              Recovery codes
            </p>

            <div>
              <p className="text-sm font-medium text-ink">
                {
                  status.remainingRecoveryCodes
                }{' '}
                remaining
              </p>

              <p className="mt-1 text-xs leading-5 text-subtle">
                One-time codes for
                emergency account access.
              </p>
            </div>

            <div className="flex min-w-[86px] md:justify-end">
              <button
                type="button"
                onClick={() =>
                  setShowRecoveryDialog(
                    true,
                  )
                }
                className="
                  rounded-full
                  border border-line-strong
                  bg-surface
                  px-3 py-1.5
                  text-xs font-semibold
                  text-ink
                  transition
                  hover:border-accent
                  hover:text-accent
                "
              >
                Regenerate
              </button>
            </div>
          </div>
        )}
      </SettingsList>

      {statusQuery.isError && (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2 text-sm text-danger"
        >
          <AlertCircle
            size={16}
            className="mt-0.5 shrink-0"
            aria-hidden
          />

          <p>
            We couldn’t check your
            two-factor authentication
            status.
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
          className={`mt-3 flex items-start gap-2 text-sm ${
            notice.tone ===
            'success'
              ? 'text-success'
              : 'text-danger'
          }`}
        >
          {notice.tone ===
          'success' ? (
            <CheckCircle2
              size={16}
              className="mt-0.5 shrink-0"
              aria-hidden
            />
          ) : (
            <AlertCircle
              size={16}
              className="mt-0.5 shrink-0"
              aria-hidden
            />
          )}

          <p>
            {notice.message}
          </p>
        </div>
      )}

      {setup && (
        <MfaSetupDialog
          setup={setup}
          onClose={() =>
            setSetup(null)
          }
          onEnabled={
            finishSetup
          }
        />
      )}

      {showDisableDialog && (
        <MfaDisableDialog
          onClose={() =>
            setShowDisableDialog(
              false,
            )
          }
          onDisabled={
            finishDisable
          }
        />
      )}

      {showRecoveryDialog && (
        <MfaRecoveryCodesDialog
          onClose={() =>
            setShowRecoveryDialog(
              false,
            )
          }
        />
      )}
    </>
  )
}