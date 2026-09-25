import {
  ArrowLeft,
  Ban,
  CalendarDays,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  KeyRound,
  Laptop2,
  MailCheck,
  RotateCcw,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react'
import { useState } from 'react'
import {
  Link,
  useParams,
} from 'react-router'

import { ApiClientError } from '@/api/ApiClientError'
import RefreshButton from '@/components/actions/RefreshButton'
import PageHeader from '@/components/layout/PageHeader'
import PageShell from '@/components/layout/PageShell'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog'
import ErrorPanel from '@/components/ui/ErrorPanel'
import Pagination from '@/components/ui/Pagination'
import type { UserStatus } from '@/features/profile/api/types'
import { useProfile } from '@/features/profile/hooks/useProfile'
import type {
  AdminUser,
  AdminUserSession,
} from '@/features/admin/api/types'
import {
  useActivateAdminUser,
  useDeactivateAdminUser,
  useRevokeAdminUserSessions,
} from '../hooks/useAdminUserMutations'
import {
  useAdminUser,
  useAdminUserSessions,
} from '@/features/admin/hooks/useAdminUsers'

const SESSION_PAGE_SIZE = 8

const statusLabels = {
  ACTIVE: 'Active',
  PENDING_VERIFICATION:
    'Pending verification',
  LOCKED: 'Locked',
  DEACTIVATED:
    'Deactivated',
} satisfies Record<
  UserStatus,
  string
>

const statusClasses = {
  ACTIVE:
    'bg-success-soft text-success',
  PENDING_VERIFICATION:
    'bg-warning-soft text-warning',
  LOCKED:
    'bg-danger-soft text-danger',
  DEACTIVATED:
    'bg-surface-strong text-muted',
} satisfies Record<
  UserStatus,
  string
>

type ConfirmationAction =
  | 'activate'
  | 'deactivate'
  | 'revoke-sessions'

function formatDateTime(
  value: string | null,
) {
  if (!value) {
    return 'Never'
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return 'Unavailable'
  }

  return new Intl.DateTimeFormat(
    'en-ZA',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(date)
}

function userInitials(
  user: AdminUser,
) {
  return `${user.firstName.charAt(
    0,
  )}${user.lastName.charAt(
    0,
  )}`.toUpperCase()
}

function describeUserAgent(
  userAgent: string | null,
) {
  if (!userAgent) {
    return 'Unknown device'
  }

  const browser =
    userAgent.includes(
      'Edg/',
    )
      ? 'Microsoft Edge'
      : userAgent.includes(
        'Chrome/',
      )
        ? 'Google Chrome'
        : userAgent.includes(
          'Firefox/',
        )
          ? 'Mozilla Firefox'
          : userAgent.includes(
            'Safari/',
          )
            ? 'Safari'
            : 'Browser session'

  const platform =
    userAgent.includes(
      'Windows',
    )
      ? 'Windows'
      : userAgent.includes(
        'Android',
      )
        ? 'Android'
        : userAgent.includes(
          'iPhone',
        ) ||
          userAgent.includes(
            'iPad',
          )
          ? 'iOS'
          : userAgent.includes(
            'Mac OS',
          )
            ? 'macOS'
            : userAgent.includes(
              'Linux',
            )
              ? 'Linux'
              : null

  return platform
    ? `${browser} on ${platform}`
    : browser
}

interface DetailItemProps {
  label: string
  value: string
}

function DetailItem({
  label,
  value,
}: DetailItemProps) {
  return (
    <div>
      <dt className="type-eyebrow">
        {label}
      </dt>

      <dd className="mt-1.5 break-words text-sm font-medium text-ink">
        {value}
      </dd>
    </div>
  )
}

interface SessionRowProps {
  session: AdminUserSession
}

function SessionRow({
  session,
}: SessionRowProps) {
  return (
    <article className="grid gap-4 px-5 py-4 sm:grid-cols-[minmax(0,1.5fr)_1fr_auto] sm:items-center sm:px-6">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl ${session.active
              ? 'bg-success-soft text-success'
              : 'bg-surface-strong text-muted'
            }`}
        >
          <Laptop2
            size={16}
            aria-hidden
          />
        </span>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            {describeUserAgent(
              session.userAgent,
            )}
          </p>

          <p
            className="mt-1 truncate text-xs text-subtle"
            title={
              session.userAgent ??
              undefined
            }
          >
            {session.userAgent ??
              'No user-agent information'}
          </p>
        </div>
      </div>

      <div className="text-xs leading-5 text-muted">
        <p>
          Last seen{' '}
          {formatDateTime(
            session.lastSeenAt,
          )}
        </p>

        <p>
          Created{' '}
          {formatDateTime(
            session.createdAt,
          )}
        </p>
      </div>

      <div className="sm:text-right">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${session.active
              ? 'bg-success-soft text-success'
              : 'bg-surface-strong text-muted'
            }`}
        >
          {session.active
            ? 'Active'
            : 'Ended'}
        </span>

        <p className="mt-1.5 text-[11px] text-subtle">
          {session.active
            ? `Expires ${formatDateTime(
              session.expiresAt,
            )}`
            : session.revocationReason ??
            'Expired'}
        </p>
      </div>
    </article>
  )
}

export default function AdminUserDetailsPage() {
  const {
    userId = '',
  } = useParams()

  const [
    sessionPage,
    setSessionPage,
  ] = useState(0)

  const [
    confirmation,
    setConfirmation,
  ] =
    useState<ConfirmationAction | null>(
      null,
    )

  const [
    actionError,
    setActionError,
  ] = useState<string | null>(
    null,
  )

  const [
    successMessage,
    setSuccessMessage,
  ] = useState<string | null>(
    null,
  )

  const profileQuery =
    useProfile()

  const userQuery =
    useAdminUser(userId)

  const user =
    userQuery.data

  const targetIsAdmin =
    user?.roles.includes(
      'ROLE_ADMIN',
    ) ?? false

  const targetIsSelf =
    profileQuery.data?.id ===
    user?.id

  const canManageUser =
    Boolean(
      user &&
      !targetIsAdmin &&
      !targetIsSelf,
    )

  const sessionsQuery =
    useAdminUserSessions(
      canManageUser
        ? userId
        : '',
      sessionPage,
      SESSION_PAGE_SIZE,
    )

  const activateUser =
    useActivateAdminUser()

  const deactivateUser =
    useDeactivateAdminUser()

  const revokeSessions =
    useRevokeAdminUserSessions()

  const actionIsPending =
    activateUser.isPending ||
    deactivateUser.isPending ||
    revokeSessions.isPending

  async function refreshDetails() {
    await Promise.all([
      userQuery.refetch(),
      canManageUser
        ? sessionsQuery.refetch()
        : Promise.resolve(),
    ])
  }

  async function confirmAction() {
    if (
      !user ||
      !confirmation
    ) {
      return
    }

    setActionError(null)
    setSuccessMessage(null)

    try {
      if (
        confirmation ===
        'activate'
      ) {
        await activateUser.mutateAsync(
          {
            userId: user.id,
            version:
              user.version,
          },
        )

        setSuccessMessage(
          `${user.firstName}'s account is active again.`,
        )
      } else if (
        confirmation ===
        'deactivate'
      ) {
        await deactivateUser.mutateAsync(
          {
            userId: user.id,
            version:
              user.version,
          },
        )

        setSuccessMessage(
          `${user.firstName}'s account was deactivated and all sessions were ended.`,
        )
      } else {
        await revokeSessions.mutateAsync(
          {
            userId: user.id,
          },
        )

        setSuccessMessage(
          `All of ${user.firstName}'s active sessions were ended.`,
        )
      }

      setConfirmation(null)
    } catch (error) {
      setActionError(
        error instanceof
          ApiClientError
          ? error.message
          : 'The admin action could not be completed.',
      )
    }
  }

  if (
    userQuery.isPending
  ) {
    return (
      <PageShell>
        <div className="animate-pulse">
          <div className="h-5 w-32 rounded bg-surface-muted" />
          <div className="mt-8 h-14 w-80 max-w-full rounded bg-surface-muted" />
          <div className="mt-8 h-48 rounded-2xl bg-surface-muted/70" />
          <div className="mt-6 h-64 rounded-2xl bg-surface-muted/70" />
        </div>
      </PageShell>
    )
  }

  if (
    userQuery.isError ||
    !user
  ) {
    return (
      <PageShell>
        <Link
          to="/admin/users"
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-accent transition hover:text-primary"
        >
          <ArrowLeft
            size={17}
            aria-hidden
          />

          Back to users
        </Link>

        <ErrorPanel
          title="We couldn’t load this user"
          message={
            userQuery.error instanceof
              ApiClientError
              ? userQuery.error
                .message
              : 'The user may no longer exist or the request could not be completed.'
          }
          onRetry={() =>
            void userQuery.refetch()
          }
          className="mt-8"
        />
      </PageShell>
    )
  }

  const confirmationCopy = {
    activate: {
      title:
        'Reactivate this account?',
      description:
        `${user.firstName} will be able to sign in again. Previously revoked sessions will remain closed.`,
      confirmLabel:
        'Reactivate account',
      icon: RotateCcw,
      tone: 'primary',
    },
    deactivate: {
      title:
        'Deactivate this account?',
      description:
        `${user.firstName} will immediately lose access and every active session will be revoked.`,
      confirmLabel:
        'Deactivate account',
      icon: Ban,
      tone: 'danger',
    },
    'revoke-sessions': {
      title:
        'End all active sessions?',
      description:
        `${user.firstName} will be signed out on every device and will need to authenticate again.`,
      confirmLabel:
        'End all sessions',
      icon: ShieldOff,
      tone: 'danger',
    },
  } satisfies Record<
    ConfirmationAction,
    {
      title: string
      description: string
      confirmLabel: string
      icon: typeof Ban
      tone:
      | 'primary'
      | 'danger'
    }
  >

  return (
    <PageShell>
      <PageHeader
        eyebrow={
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 text-accent transition hover:text-primary"
          >
            <ArrowLeft
              size={14}
              aria-hidden
            />

            User management
          </Link>
        }
        title={`${user.firstName} ${user.lastName}`}
        description={
          user.email
        }
        actions={
          <>
            <RefreshButton
              isRefreshing={
                userQuery.isFetching ||
                sessionsQuery.isFetching
              }
              onRefresh={
                refreshDetails
              }
              label="Refresh user details"
              iconOnly
            />

            {canManageUser &&
              (user.status ===
                'DEACTIVATED' ? (
                <button
                  type="button"
                  onClick={() => {
                    setActionError(
                      null,
                    )
                    setConfirmation(
                      'activate',
                    )
                  }}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-inverse transition hover:bg-primary-hover"
                >
                  <RotateCcw
                    size={17}
                    aria-hidden
                  />

                  Reactivate account
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setActionError(
                      null,
                    )
                    setConfirmation(
                      'deactivate',
                    )
                  }}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-danger/20 px-5 py-3 text-sm font-semibold text-danger transition hover:bg-danger-soft"
                >
                  <Ban
                    size={17}
                    aria-hidden
                  />

                  Deactivate account
                </button>
              ))}
          </>
        }
      />

      <section className="feature-reveal feature-reveal-delay-1 mt-10 flex flex-col gap-5 rounded-2xl border border-line/50 bg-surface p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary text-lg font-bold text-inverse">
            {userInitials(
              user,
            )}
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusClasses[
                  user.status
                  ]
                  }`}
              >
                {
                  statusLabels[
                  user.status
                  ]
                }
              </span>

              {targetIsAdmin && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-1 text-[10px] font-semibold text-warning">
                  <ShieldCheck
                    size={12}
                    aria-hidden
                  />

                  Administrator
                </span>
              )}

              {targetIsSelf && (
                <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[10px] font-semibold text-accent">
                  Your account
                </span>
              )}
            </div>

            <p className="mt-2 text-sm text-muted">
              Member since{' '}
              {formatDateTime(
                user.createdAt,
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted">
          <MailCheck
            size={15}
            className={
              user.emailVerified
                ? 'text-success'
                : 'text-warning'
            }
            aria-hidden
          />

          {user.emailVerified
            ? 'Email verified'
            : 'Email not verified'}
        </div>
      </section>

      {successMessage && (
        <div
          className="feature-reveal mt-5 flex items-start gap-3 rounded-2xl border border-success/20 bg-success-soft p-4 text-sm text-success"
          role="status"
        >
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0"
            aria-hidden
          />

          <p>
            {successMessage}
          </p>
        </div>
      )}

      {(targetIsAdmin ||
        targetIsSelf) && (
          <div className="feature-reveal mt-5 flex items-start gap-3 rounded-2xl border border-warning/20 bg-warning-soft p-4 text-sm leading-6 text-warning">
            <ShieldCheck
              size={18}
              className="mt-0.5 shrink-0"
              aria-hidden
            />

            <p>
              {targetIsSelf
                ? 'Your administrator account is read-only here. Use Profile for your own account settings.'
                : 'Administrators are peers in Salif v1, so another administrator’s access and sessions cannot be changed.'}
            </p>
          </div>
        )}

      <section className="feature-reveal feature-reveal-delay-2 mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <article className="rounded-2xl border border-line/50 bg-surface p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent">
              <CircleUserRound
                size={17}
                aria-hidden
              />
            </span>

            <div>
              <p className="type-eyebrow">
                Account record
              </p>

              <h2 className="mt-0.5 text-lg font-semibold text-ink">
                User details
              </h2>
            </div>
          </div>

          <dl className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <DetailItem
              label="Email address"
              value={
                user.email
              }
            />

            <DetailItem
              label="Email verification"
              value={
                user.emailVerified
                  ? 'Verified'
                  : 'Not verified'
              }
            />

            <DetailItem
              label="Created"
              value={formatDateTime(
                user.createdAt,
              )}
            />

            <DetailItem
              label="Last login"
              value={formatDateTime(
                user.lastLoginAt,
              )}
            />

            <DetailItem
              label="Last updated"
              value={formatDateTime(
                user.updatedAt,
              )}
            />

            <DetailItem
              label="Record version"
              value={String(
                user.version,
              )}
            />
          </dl>
        </article>

        <aside className="rounded-2xl border border-line/50 bg-surface p-5 sm:p-6">
          <span className="grid size-9 place-items-center rounded-xl bg-warning-soft text-warning">
            <MailCheck
              size={17}
              aria-hidden
            />
          </span>

          <p className="type-eyebrow mt-5">
            Access snapshot
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">
            {user.emailVerified
              ? 'Verified'
              : 'Unverified'}
          </p>

          <p className="mt-2 text-sm leading-6 text-muted">
            {user.emailVerified
              ? 'This user has completed email verification.'
              : 'This user has not completed email verification yet.'}
          </p>

          <div className="mt-6 border-t border-line/50 pt-5">
            <p className="flex items-center gap-2 text-xs text-muted">
              <CalendarDays
                size={15}
                aria-hidden
              />

              Member since{' '}
              {formatDateTime(
                user.createdAt,
              )}
            </p>
          </div>
        </aside>
      </section>

      {canManageUser && (
        <section className="feature-reveal feature-reveal-delay-3 mt-6 overflow-hidden rounded-2xl border border-line/50 bg-surface">
          <header className="flex flex-wrap items-center justify-between gap-5 border-b border-line/50 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent">
                <KeyRound
                  size={16}
                  aria-hidden
                />
              </span>

              <div>
                <p className="type-eyebrow">
                  Security
                </p>

                <h2 className="mt-0.5 text-lg font-semibold text-ink">
                  Session history
                </h2>
              </div>
            </div>

            <button
              type="button"
              disabled={
                !sessionsQuery.data ||
                sessionsQuery.data
                  .totalElements ===
                0 ||
                revokeSessions.isPending
              }
              onClick={() => {
                setActionError(
                  null,
                )
                setConfirmation(
                  'revoke-sessions',
                )
              }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-danger/20 px-4 py-2.5 text-xs font-semibold text-danger transition hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ShieldOff
                size={15}
                aria-hidden
              />

              End active sessions
            </button>
          </header>

          {sessionsQuery.isPending && (
            <div
              className="animate-pulse"
              aria-busy="true"
            >
              {[1, 2, 3].map(
                (row) => (
                  <div
                    key={row}
                    className="h-20 border-b border-line/50 bg-surface-muted/40 last:border-0"
                  />
                ),
              )}
            </div>
          )}

          {sessionsQuery.isError && (
            <div className="p-5 sm:p-6">
              <ErrorPanel
                title="We couldn’t load this user’s sessions"
                message={
                  sessionsQuery.error instanceof
                    ApiClientError
                    ? sessionsQuery
                      .error
                      .message
                    : 'Please try again.'
                }
                onRetry={() =>
                  void sessionsQuery.refetch()
                }
              />
            </div>
          )}

          {!sessionsQuery.isPending &&
            !sessionsQuery.isError &&
            sessionsQuery.data
              .items.length ===
            0 && (
              <div className="px-6 py-12 text-center">
                <Clock3
                  size={22}
                  className="mx-auto text-subtle"
                  aria-hidden
                />

                <p className="mt-3 font-semibold text-ink">
                  No sessions
                  recorded
                </p>

                <p className="mt-1 text-sm text-muted">
                  This user has no
                  authentication
                  session history yet.
                </p>
              </div>
            )}

          {!sessionsQuery.isPending &&
            !sessionsQuery.isError &&
            sessionsQuery.data.items.map(
              (session) => (
                <div
                  key={
                    session.id
                  }
                  className="border-t border-line/50 first:border-t-0"
                >
                  <SessionRow
                    session={
                      session
                    }
                  />
                </div>
              ),
            )}

          {!sessionsQuery.isPending &&
            !sessionsQuery.isError &&
            sessionsQuery.data
              .totalPages > 1 && (
              <footer className="border-t border-line/50 bg-surface-muted/50 px-5 py-4 sm:px-6">
                <Pagination
                  label="User session pages"
                  page={
                    sessionsQuery
                      .data.page
                  }
                  totalPages={
                    sessionsQuery
                      .data
                      .totalPages
                  }
                  onPageChange={
                    setSessionPage
                  }
                  isFetching={
                    sessionsQuery.isFetching
                  }
                />
              </footer>
            )}
        </section>
      )}

      {confirmation &&
        (() => {
          const copy =
            confirmationCopy[
            confirmation
            ]

          const ConfirmationIcon =
            copy.icon

          return (
            <ConfirmationDialog
              title={
                copy.title
              }
              description={
                copy.description
              }
              icon={
                <ConfirmationIcon
                  size={18}
                  aria-hidden
                />
              }
              confirmLabel={
                copy.confirmLabel
              }
              pendingLabel="Working…"
              cancelLabel="Cancel"
              isPending={
                actionIsPending
              }
              onConfirm={() =>
                void confirmAction()
              }
              onClose={() => {
                setConfirmation(
                  null,
                )
                setActionError(
                  null,
                )
              }}
              tone={copy.tone}
              variant="plain"
            >
              {actionError && (
                <p
                  className="mt-4 rounded-xl border border-danger/20 bg-danger-soft p-3 text-sm text-danger"
                  role="alert"
                >
                  {actionError}
                </p>
              )}
            </ConfirmationDialog>
          )
        })()}
    </PageShell>
  )
}
