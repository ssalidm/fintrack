import {
  ArrowLeft,
  Ban,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Clock3,
  KeyRound,
  Laptop2,
  MailCheck,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react'
import { useState } from 'react'
import {
  Link,
  useParams,
} from 'react-router'

import { ApiClientError } from '../../../api/ApiClientError'
import PageShell from '../../../components/layout/PageShell'
import { useProfile } from '../../profile/hooks/useProfile'
import type { UserStatus } from '../../profile/api/types'
import type {
  AdminUser,
  AdminUserSession,
} from '../api/types'
import {
  useActivateAdminUser,
  useDeactivateAdminUser,
  useRevokeAdminUserSessions,
} from '../hooks/useAdminUserMutations'
import {
  useAdminUser,
  useAdminUserSessions,
} from '../hooks/useAdminUsers'

const SESSION_PAGE_SIZE = 8

const statusLabels = {
  ACTIVE: 'Active',
  PENDING_VERIFICATION: 'Pending verification',
  LOCKED: 'Locked',
  DEACTIVATED: 'Deactivated',
} satisfies Record<UserStatus, string>

const statusClasses = {
  ACTIVE: 'bg-[#e1eee6] text-[#39725d]',
  PENDING_VERIFICATION: 'bg-[#f5ead1] text-[#956624]',
  LOCKED: 'bg-[#f3dfd7] text-[#a6533f]',
  DEACTIVATED: 'bg-[#e9e7e2] text-[#68736f]',
} satisfies Record<UserStatus, string>

type ConfirmationAction =
  | 'activate'
  | 'deactivate'
  | 'revoke-sessions'

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Never'
  }

  return new Intl.DateTimeFormat('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function userInitials(user: AdminUser) {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
    .toUpperCase()
}

function describeUserAgent(userAgent: string | null) {
  if (!userAgent) {
    return 'Unknown device'
  }

  const browser = userAgent.includes('Edg/')
    ? 'Microsoft Edge'
    : userAgent.includes('Chrome/')
      ? 'Google Chrome'
      : userAgent.includes('Firefox/')
        ? 'Mozilla Firefox'
        : userAgent.includes('Safari/')
          ? 'Safari'
          : 'Browser session'

  const platform = userAgent.includes('Windows')
    ? 'Windows'
    : userAgent.includes('Android')
      ? 'Android'
      : userAgent.includes('iPhone') ||
          userAgent.includes('iPad')
        ? 'iOS'
        : userAgent.includes('Mac OS')
          ? 'macOS'
          : userAgent.includes('Linux')
            ? 'Linux'
            : null

  return platform ? `${browser} on ${platform}` : browser
}

interface DetailItemProps {
  label: string
  value: string
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#87938e]">
        {label}
      </dt>
      <dd className="mt-1.5 break-words text-sm font-medium text-[#284b41]">
        {value}
      </dd>
    </div>
  )
}

interface SessionRowProps {
  session: AdminUserSession
}

function SessionRow({ session }: SessionRowProps) {
  return (
    <article className="grid gap-4 border-t border-[#ebe8e0] px-5 py-5 first:border-t-0 sm:grid-cols-[minmax(0,1.5fr)_1fr_auto] sm:items-center sm:px-7">
      <div className="flex min-w-0 items-start gap-3">
        <span className={`mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl ${
          session.active
            ? 'bg-[#e1eee6] text-[#39725d]'
            : 'bg-[#eceae5] text-[#71807b]'
        }`}>
          <Laptop2 size={18} aria-hidden />
        </span>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#173c32]">
            {describeUserAgent(session.userAgent)}
          </p>
          <p
            className="mt-1 truncate text-xs text-[#71807b]"
            title={session.userAgent ?? undefined}
          >
            {session.userAgent ?? 'No user-agent information'}
          </p>
        </div>
      </div>

      <div className="text-xs leading-5 text-[#657972]">
        <p>Last seen {formatDateTime(session.lastSeenAt)}</p>
        <p>Created {formatDateTime(session.createdAt)}</p>
      </div>

      <div className="sm:text-right">
        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
          session.active
            ? 'bg-[#e1eee6] text-[#39725d]'
            : 'bg-[#eceae5] text-[#68736f]'
        }`}>
          {session.active ? 'Active' : 'Ended'}
        </span>

        <p className="mt-1.5 text-[11px] text-[#87938e]">
          {session.active
            ? `Expires ${formatDateTime(session.expiresAt)}`
            : session.revocationReason ?? 'Expired'}
        </p>
      </div>
    </article>
  )
}

export default function AdminUserDetailsPage() {
  const { userId = '' } = useParams()
  const [sessionPage, setSessionPage] = useState(0)
  const [confirmation, setConfirmation] =
    useState<ConfirmationAction | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const profileQuery = useProfile()
  const userQuery = useAdminUser(userId)
  const user = userQuery.data
  const targetIsAdmin = user?.roles.includes('ROLE_ADMIN') ?? false
  const targetIsSelf = profileQuery.data?.id === user?.id
  const canManageUser = Boolean(user && !targetIsAdmin && !targetIsSelf)

  const sessionsQuery = useAdminUserSessions(
    canManageUser ? userId : '',
    sessionPage,
    SESSION_PAGE_SIZE,
  )

  const activateUser = useActivateAdminUser()
  const deactivateUser = useDeactivateAdminUser()
  const revokeSessions = useRevokeAdminUserSessions()

  const actionIsPending =
    activateUser.isPending ||
    deactivateUser.isPending ||
    revokeSessions.isPending

  async function refreshDetails() {
    await Promise.all([
      userQuery.refetch(),
      canManageUser ? sessionsQuery.refetch() : Promise.resolve(),
    ])
  }

  async function confirmAction() {
    if (!user || !confirmation) {
      return
    }

    setActionError(null)
    setSuccessMessage(null)

    try {
      if (confirmation === 'activate') {
        await activateUser.mutateAsync({
          userId: user.id,
          version: user.version,
        })
        setSuccessMessage(`${user.firstName}'s account is active again.`)
      } else if (confirmation === 'deactivate') {
        await deactivateUser.mutateAsync({
          userId: user.id,
          version: user.version,
        })
        setSuccessMessage(
          `${user.firstName}'s account was deactivated and all sessions were ended.`,
        )
      } else {
        await revokeSessions.mutateAsync({ userId: user.id })
        setSuccessMessage(`All of ${user.firstName}'s active sessions were ended.`)
      }

      setConfirmation(null)
    } catch (error) {
      setActionError(
        error instanceof ApiClientError
          ? error.message
          : 'The admin action could not be completed.',
      )
    }
  }

  if (userQuery.isPending) {
    return (
      <PageShell>
        <div className="animate-pulse">
          <div className="h-5 w-32 rounded bg-[#e2e2dc]" />
          <div className="mt-8 h-14 w-80 max-w-full rounded bg-[#e2e2dc]" />
          <div className="mt-8 h-64 rounded-3xl bg-[#e8e7e1]" />
          <div className="mt-6 h-72 rounded-3xl bg-[#e8e7e1]" />
        </div>
      </PageShell>
    )
  }

  if (userQuery.isError || !user) {
    return (
      <PageShell>
        <Link
          to="/admin/users"
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#39725d] hover:text-[#174f43]"
        >
          <ArrowLeft size={17} aria-hidden />
          Back to users
        </Link>

        <section className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-8" role="alert">
          <h1 className="font-serif text-3xl text-red-950">
            We couldn’t load this user
          </h1>
          <p className="mt-3 text-sm text-red-700">
            {userQuery.error instanceof ApiClientError
              ? userQuery.error.message
              : 'The user may no longer exist or the request could not be completed.'}
          </p>
          <button
            type="button"
            onClick={() => void userQuery.refetch()}
            className="mt-5 cursor-pointer text-sm font-semibold text-red-800 underline underline-offset-4"
          >
            Try again
          </button>
        </section>
      </PageShell>
    )
  }

  const confirmationCopy = {
    activate: {
      title: 'Reactivate this account?',
      description: `${user.firstName} will be able to sign in again. Previously revoked sessions will remain closed.`,
      confirmLabel: 'Reactivate account',
      icon: RotateCcw,
      buttonClass: 'bg-[#174f43] hover:bg-[#236a58]',
    },
    deactivate: {
      title: 'Deactivate this account?',
      description: `${user.firstName} will immediately lose access and every active session will be revoked.`,
      confirmLabel: 'Deactivate account',
      icon: Ban,
      buttonClass: 'bg-[#9b5845] hover:bg-[#834937]',
    },
    'revoke-sessions': {
      title: 'End all active sessions?',
      description: `${user.firstName} will be signed out on every device and will need to authenticate again.`,
      confirmLabel: 'End all sessions',
      icon: ShieldOff,
      buttonClass: 'bg-[#9b5845] hover:bg-[#834937]',
    },
  } satisfies Record<
    ConfirmationAction,
    {
      title: string
      description: string
      confirmLabel: string
      icon: typeof Ban
      buttonClass: string
    }
  >

  return (
    <PageShell>
      <div className="feature-reveal flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/admin/users"
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#39725d] transition hover:text-[#174f43]"
        >
          <ArrowLeft size={17} aria-hidden />
          Back to users
        </Link>

        <button
          type="button"
          disabled={userQuery.isFetching || sessionsQuery.isFetching}
          onClick={() => void refreshDetails()}
          className="grid size-10 cursor-pointer place-items-center rounded-full border border-[#d8d6ce] bg-[#fffdf8] text-[#657972] transition hover:border-[#bd9460] hover:text-[#9a6828] disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Refresh user details"
          title="Refresh user details"
        >
          <RefreshCw
            size={17}
            className={userQuery.isFetching || sessionsQuery.isFetching ? 'animate-spin' : ''}
            aria-hidden
          />
        </button>
      </div>

      <header className="feature-reveal feature-reveal-delay-1 mt-7 overflow-hidden rounded-[2rem] bg-[#174f43] text-white shadow-[0_20px_55px_rgba(23,79,67,0.15)]">
        <div className="grid gap-8 p-7 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
            <span className="grid size-20 shrink-0 place-items-center rounded-3xl bg-[#f7f3e9] font-serif text-3xl text-[#174f43]">
              {userInitials(user)}
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClasses[user.status]}`}>
                  {statusLabels[user.status]}
                </span>

                {targetIsAdmin && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-[#e5f0eb]">
                    <ShieldCheck size={13} aria-hidden />
                    Administrator
                  </span>
                )}

                {targetIsSelf && (
                  <span className="rounded-full bg-[#c8a86b]/20 px-2.5 py-1 text-[11px] font-semibold text-[#f4dcae]">
                    Your account
                  </span>
                )}
              </div>

              <h1 className="mt-3 truncate font-serif text-4xl tracking-[-0.03em] sm:text-5xl">
                {user.firstName} {user.lastName}
              </h1>

              <p className="mt-2 truncate text-sm text-[#c9ddd5]">
                {user.email}
              </p>
            </div>
          </div>

          {canManageUser && (
            <div>
              {user.status === 'DEACTIVATED' ? (
                <button
                  type="button"
                  onClick={() => {
                    setActionError(null)
                    setConfirmation('activate')
                  }}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#f7f3e9] px-5 py-3 text-sm font-semibold text-[#174f43] transition hover:bg-white"
                >
                  <RotateCcw size={17} aria-hidden />
                  Reactivate account
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setActionError(null)
                    setConfirmation('deactivate')
                  }}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <Ban size={17} aria-hidden />
                  Deactivate account
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {successMessage && (
        <div className="feature-reveal mt-5 flex items-start gap-3 rounded-2xl border border-[#bad5c3] bg-[#edf6ef] p-4 text-sm text-[#2f684f]" role="status">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden />
          <p>{successMessage}</p>
        </div>
      )}

      {(targetIsAdmin || targetIsSelf) && (
        <div className="feature-reveal mt-5 flex items-start gap-3 rounded-2xl border border-[#e2d3b8] bg-[#fbf4e7] p-4 text-sm leading-6 text-[#7d5b2e]">
          <ShieldCheck size={18} className="mt-0.5 shrink-0" aria-hidden />
          <p>
            {targetIsSelf
              ? 'Your administrator account is read-only here. Use Profile for your own account settings.'
              : 'Administrators are peers in Salif v1, so another administrator’s access and sessions cannot be changed.'}
          </p>
        </div>
      )}

      <section className="feature-reveal feature-reveal-delay-2 mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <article className="rounded-3xl border border-[#dedbd2] bg-[#fffdf8] p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#dfece3] text-[#39725d]">
              <CircleUserRound size={19} aria-hidden />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#87938e]">
                Account record
              </p>
              <h2 className="mt-0.5 font-serif text-2xl text-[#173c32]">
                User details
              </h2>
            </div>
          </div>

          <dl className="mt-7 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <DetailItem label="Email address" value={user.email} />
            <DetailItem
              label="Email verification"
              value={user.emailVerified ? 'Verified' : 'Not verified'}
            />
            <DetailItem label="Created" value={formatDateTime(user.createdAt)} />
            <DetailItem label="Last login" value={formatDateTime(user.lastLoginAt)} />
            <DetailItem label="Last updated" value={formatDateTime(user.updatedAt)} />
            <DetailItem label="Record version" value={String(user.version)} />
          </dl>
        </article>

        <aside className="rounded-3xl border border-[#dedbd2] bg-[#fffdf8] p-6 sm:p-7">
          <span className="grid size-10 place-items-center rounded-xl bg-[#f3ead8] text-[#8b6c3d]">
            <MailCheck size={19} aria-hidden />
          </span>
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#87938e]">
            Access snapshot
          </p>
          <p className="mt-2 font-serif text-3xl text-[#173c32]">
            {user.emailVerified ? 'Verified' : 'Unverified'}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#657972]">
            {user.emailVerified
              ? 'This user has completed email verification.'
              : 'This user has not completed email verification yet.'}
          </p>

          <div className="mt-6 border-t border-[#ebe8e0] pt-5">
            <p className="flex items-center gap-2 text-xs text-[#657972]">
              <CalendarDays size={15} aria-hidden />
              Member since {formatDateTime(user.createdAt)}
            </p>
          </div>
        </aside>
      </section>

      {canManageUser && (
        <section className="feature-reveal feature-reveal-delay-3 mt-6 overflow-hidden rounded-3xl border border-[#dedbd2] bg-[#fffdf8]">
          <header className="flex flex-wrap items-center justify-between gap-5 border-b border-[#dedbd2] px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#e3ece8] text-[#39725d]">
                <KeyRound size={18} aria-hidden />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#87938e]">
                  Security
                </p>
                <h2 className="mt-0.5 font-serif text-2xl text-[#173c32]">
                  Session history
                </h2>
              </div>
            </div>

            <button
              type="button"
              disabled={
                !sessionsQuery.data ||
                sessionsQuery.data.totalElements === 0 ||
                revokeSessions.isPending
              }
              onClick={() => {
                setActionError(null)
                setConfirmation('revoke-sessions')
              }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#d7c2bb] px-4 py-2.5 text-xs font-semibold text-[#9b5845] transition hover:bg-[#f6ebe7] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ShieldOff size={16} aria-hidden />
              End active sessions
            </button>
          </header>

          {sessionsQuery.isPending && (
            <div className="animate-pulse" aria-busy="true">
              {[1, 2, 3].map((row) => (
                <div
                  key={row}
                  className="h-24 border-b border-[#ebe8e0] bg-[#f2f0ea] last:border-0"
                />
              ))}
            </div>
          )}

          {sessionsQuery.isError && (
            <div className="p-7" role="alert">
              <p className="font-semibold text-[#9b5845]">
                We couldn’t load this user’s sessions.
              </p>
              <p className="mt-2 text-sm text-[#657972]">
                {sessionsQuery.error instanceof ApiClientError
                  ? sessionsQuery.error.message
                  : 'Please try again.'}
              </p>
              <button
                type="button"
                onClick={() => void sessionsQuery.refetch()}
                className="mt-4 cursor-pointer text-sm font-semibold text-[#39725d] underline underline-offset-4"
              >
                Try again
              </button>
            </div>
          )}

          {!sessionsQuery.isPending &&
            !sessionsQuery.isError &&
            sessionsQuery.data.items.length === 0 && (
              <div className="px-6 py-12 text-center">
                <Clock3 size={24} className="mx-auto text-[#87938e]" aria-hidden />
                <p className="mt-3 font-semibold text-[#173c32]">No sessions recorded</p>
                <p className="mt-1 text-sm text-[#71807b]">
                  This user has no authentication session history yet.
                </p>
              </div>
            )}

          {!sessionsQuery.isPending &&
            !sessionsQuery.isError &&
            sessionsQuery.data.items.map((session) => (
              <SessionRow key={session.id} session={session} />
            ))}

          {!sessionsQuery.isPending &&
            !sessionsQuery.isError &&
            sessionsQuery.data.totalPages > 1 && (
              <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[#dedbd2] bg-[#f9f7f1] px-5 py-4 sm:px-7">
                <p className="text-xs text-[#71807b]">
                  Page {sessionsQuery.data.page + 1} of {sessionsQuery.data.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!sessionsQuery.data.hasPrevious || sessionsQuery.isFetching}
                    onClick={() => setSessionPage((current) => Math.max(0, current - 1))}
                    className="grid size-9 cursor-pointer place-items-center rounded-full border border-[#d8d6ce] text-[#173c32] transition hover:bg-[#efede7] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous session page"
                  >
                    <ChevronLeft size={16} aria-hidden />
                  </button>
                  <button
                    type="button"
                    disabled={!sessionsQuery.data.hasNext || sessionsQuery.isFetching}
                    onClick={() => setSessionPage((current) => current + 1)}
                    className="grid size-9 cursor-pointer place-items-center rounded-full bg-[#174f43] text-white transition hover:bg-[#236a58] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next session page"
                  >
                    <ChevronRight size={16} aria-hidden />
                  </button>
                </div>
              </footer>
            )}
        </section>
      )}

      {confirmation && (() => {
        const copy = confirmationCopy[confirmation]
        const ConfirmationIcon = copy.icon

        return (
          <div className="fixed inset-0 z-[80] grid place-items-center p-5">
            <button
              type="button"
              className="absolute inset-0 cursor-pointer bg-[#102e27]/45 backdrop-blur-[2px]"
              onClick={() => {
                if (!actionIsPending) {
                  setConfirmation(null)
                  setActionError(null)
                }
              }}
              aria-label="Cancel admin action"
            />

            <section
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="admin-action-title"
              className="relative w-full max-w-md rounded-3xl bg-[#fffdf8] p-7 shadow-2xl"
            >
              <span className="grid size-11 place-items-center rounded-full bg-[#f2e7df] text-[#9b5845]">
                <ConfirmationIcon size={20} aria-hidden />
              </span>

              <h2 id="admin-action-title" className="mt-5 font-serif text-3xl text-[#173c32]">
                {copy.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#657972]">
                {copy.description}
              </p>

              {actionError && (
                <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">
                  {actionError}
                </p>
              )}

              <div className="mt-7 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={actionIsPending}
                  onClick={() => {
                    setConfirmation(null)
                    setActionError(null)
                  }}
                  className="cursor-pointer rounded-full border border-[#d8d6ce] px-5 py-2.5 text-sm font-semibold text-[#173c32] hover:bg-[#efede7] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={actionIsPending}
                  onClick={() => void confirmAction()}
                  className={`cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${copy.buttonClass}`}
                >
                  {actionIsPending ? 'Working…' : copy.confirmLabel}
                </button>
              </div>
            </section>
          </div>
        )
      })()}
    </PageShell>
  )
}
