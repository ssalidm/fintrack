import {
  Laptop,
  LoaderCircle,
} from 'lucide-react'

import SettingsList from '../../../components/settings/SettingsList'
import type { UserSession } from '../api/types'
import {
  useProfileSessions,
  useRevokeOtherProfileSessions,
  useRevokeProfileSession,
} from '../hooks/useProfileSessions'

import { useState } from 'react'
import SessionSignOutDialog from './SessionSignOutDialog'

function describeUserAgent(
  userAgent: string | null,
) {
  if (!userAgent) {
    return 'Unknown browser'
  }

  let browser = 'Browser'

  if (userAgent.includes('Edg/')) {
    browser = 'Microsoft Edge'
  } else if (userAgent.includes('Chrome/')) {
    browser = 'Google Chrome'
  } else if (userAgent.includes('Firefox/')) {
    browser = 'Mozilla Firefox'
  } else if (
    userAgent.includes('Safari/') &&
    !userAgent.includes('Chrome/')
  ) {
    browser = 'Safari'
  }

  let platform = ''

  if (userAgent.includes('Windows')) {
    platform = 'Windows'
  } else if (
    userAgent.includes('iPhone') ||
    userAgent.includes('iPad')
  ) {
    platform = 'iOS'
  } else if (userAgent.includes('Android')) {
    platform = 'Android'
  } else if (userAgent.includes('Mac OS')) {
    platform = 'macOS'
  } else if (userAgent.includes('Linux')) {
    platform = 'Linux'
  }

  return platform
    ? `${browser} on ${platform}`
    : browser
}

function formatLastSeen(
  session: UserSession,
) {
  if (session.current) {
    return 'Active now'
  }

  const timestamp =
    new Date(session.lastSeenAt).getTime()

  if (Number.isNaN(timestamp)) {
    return 'Last activity unavailable'
  }

  const elapsedSeconds =
    Math.max(
      0,
      Math.floor(
        (Date.now() - timestamp) / 1000,
      ),
    )

  if (elapsedSeconds < 60) {
    return 'Active less than a minute ago'
  }

  const minutes =
    Math.floor(elapsedSeconds / 60)

  if (minutes < 60) {
    return `Active ${minutes} ${minutes === 1
      ? 'minute'
      : 'minutes'
      } ago`
  }

  const hours =
    Math.floor(minutes / 60)

  if (hours < 24) {
    return `Active ${hours} ${hours === 1
      ? 'hour'
      : 'hours'
      } ago`
  }

  const days =
    Math.floor(hours / 24)

  if (days < 30) {
    return `Active ${days} ${days === 1
      ? 'day'
      : 'days'
      } ago`
  }

  return `Last active ${new Intl.DateTimeFormat(
    'en-ZA',
    {
      dateStyle: 'medium',
    },
  ).format(new Date(session.lastSeenAt))}`
}

type PendingSessionAction =
  | {
    type: 'single'
    session: UserSession
  }
  | {
    type: 'others'
  }

  const sessionsBtnClass = "inline-flex items-center gap-2 rounded-full" +
              " bg-[#ad573e] px-3.5 py-2" + 
              " text-xs font-semibold text-white transition hover:bg-[#91442f]" + 
              " disabled:cursor-not-allowed disabled:opacity-50"

export default function ProfileSessions() {

  const [pendingAction, setPendingAction,] =
    useState<PendingSessionAction | null>(null)


  const sessionsQuery =
    useProfileSessions()

  const revokeSession =
    useRevokeProfileSession()

  const revokeOthers =
    useRevokeOtherProfileSessions()

  const isRevoking =
    revokeSession.isPending ||
    revokeOthers.isPending

  async function handleConfirmedSignOut() {
    if (!pendingAction) {
      return
    }

    try {
      if (
        pendingAction.type === 'single'
      ) {
        await revokeSession.mutateAsync(
          pendingAction.session.id,
        )
      } else {
        await revokeOthers.mutateAsync()
      }

      setPendingAction(null)
    } catch {
      // Mutation state keeps the dialog open
      // and displays the request error.
    }
  }

  if (sessionsQuery.isPending) {
    return (
      <div className="mt-5 space-y-3">
        <div className="h-16 animate-pulse rounded-lg bg-surface-muted" />
        <div className="h-16 animate-pulse rounded-lg bg-surface-muted" />
      </div>
    )
  }

  if (sessionsQuery.isError) {
    return (
      <div className="mt-5">
        <p className="text-sm text-danger">
          Unable to load your active sessions.
        </p>

        <button
          type="button"
          onClick={() =>
            sessionsQuery.refetch()
          }
          className="
            mt-3
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
          Try again
        </button>
      </div>
    )
  }

  const sessions =
    sessionsQuery.data ?? []

  const otherSessions =
    sessions.filter(
      (session) =>
        !session.current,
    )

  return (
    <>
      <SettingsList className="mt-5">
        {sessions.map(
          (session) => (
            <SessionRow
              key={session.id}
              session={session}
              signingOut={
                revokeSession.isPending &&
                revokeSession.variables ===
                session.id
              }
              onSignOut={() =>
                setPendingAction({
                  type: 'single',
                  session
                })
              }
            />
          ),
        )}
      </SettingsList>

      {revokeSession.isError && (
        <p
          role="alert"
          className="mt-3 text-sm font-medium text-danger"
        >
          Unable to sign out that session.
        </p>
      )}

      {revokeOthers.isError && (
        <p
          role="alert"
          className="mt-3 text-sm font-medium text-danger"
        >
          Unable to sign out your other sessions.
        </p>
      )}

      {otherSessions.length > 0 && (
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            disabled={
              revokeOthers.isPending ||
              revokeSession.isPending
            }
            onClick={() =>
              setPendingAction({
                type: 'others'
              })
            }
            className={sessionsBtnClass}
          >
            {revokeOthers.isPending && (
              <LoaderCircle
                size={14}
                className="animate-spin"
                aria-hidden
              />
            )}

            {revokeOthers.isPending
              ? 'Signing out…'
              : 'Sign out all other sessions'}
          </button>
        </div>
      )}

      {pendingAction && (
        <SessionSignOutDialog
          title={
            pendingAction.type === 'single'
              ? 'Sign out this session?'
              : 'Sign out all other sessions?'
          }
          description={
            pendingAction.type === 'single'
              ? `This will sign out ${describeUserAgent(
                pendingAction.session.userAgent,
              )}. That device will need to sign in again.`
              : 'Every other device signed in to your Salif account will be signed out. This device will remain signed in.'
          }
          isPending={isRevoking}
          errorMessage={
            revokeSession.isError ||
              revokeOthers.isError
              ? 'We could not sign out the selected session. Please try again.'
              : null
          }
          onCancel={() => {
            if (!isRevoking) {
              setPendingAction(null)
            }
          }}
          onConfirm={() =>
            void handleConfirmedSignOut()
          }
        />
      )}
    </>
  )
}

interface SessionRowProps {
  readonly session: UserSession
  readonly signingOut: boolean
  readonly onSignOut: () => void
}

function SessionRow({
  session,
  signingOut,
  onSignOut,
}: SessionRowProps) {
  return (
    <div
      className="
        grid
        gap-3
        py-5
        md:grid-cols-[180px_minmax(0,1fr)_auto]
        md:items-center
        md:gap-8
      "
    >
      <div className="flex items-center gap-3">
        <span
          className="
            grid size-9
            shrink-0
            place-items-center
            rounded-lg
            bg-surface-muted
            text-muted
          "
        >
          <Laptop
            size={17}
            aria-hidden
          />
        </span>

        <span className="text-sm font-medium text-muted">
          Device
        </span>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-ink">
            {describeUserAgent(
              session.userAgent,
            )}
          </p>

          {session.current && (
            <span
              className="
                rounded-full
                bg-success-soft
                px-2 py-0.5
                text-[11px]
                font-semibold
                text-success
              "
            >
              This device
            </span>
          )}
        </div>

        <p className="mt-1 text-xs text-subtle">
          {formatLastSeen(session)}
        </p>
      </div>

      <div className="flex min-w-[86px] md:justify-end">
        {!session.current && (
          <button
            type="button"
            disabled={signingOut}
            onClick={onSignOut}
            className={sessionsBtnClass}
          >
            {signingOut && (
              <LoaderCircle
                size={14}
                className="animate-spin"
                aria-hidden
              />
            )}

            {signingOut
              ? 'Signing out'
              : 'Sign out'}
          </button>
        )}
      </div>
    </div>


  )

}