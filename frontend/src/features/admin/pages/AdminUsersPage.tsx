import { useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  MailCheck,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'

import { ApiClientError } from '@/api/ApiClientError'
import RefreshButton from '@/components/actions/RefreshButton'
import PageHeader from '@/components/layout/PageHeader'
import PageShell from '@/components/layout/PageShell'
import EmptyState from '@/components/ui/EmptyState'
import ErrorPanel from '@/components/ui/ErrorPanel'
import Pagination from '@/components/ui/Pagination'
import type { UserStatus } from '@/features/profile/api/types'
import type { AdminUser } from '@/features/admin/api/types'
import { useAdminUsers } from '@/features/admin/hooks/useAdminUsers'

const PAGE_SIZE = 12

type UserFilter =
  | 'ALL'
  | 'ACTIVE'
  | 'PENDING'
  | 'RESTRICTED'
  | 'ADMINS'

const filterOptions = [
  {
    value: 'ALL',
    label: 'Everyone',
  },
  {
    value: 'ACTIVE',
    label: 'Active',
  },
  {
    value: 'PENDING',
    label: 'Awaiting verification',
  },
  {
    value: 'RESTRICTED',
    label: 'Restricted',
  },
  {
    value: 'ADMINS',
    label: 'Administrators',
  },
] satisfies ReadonlyArray<{
  value: UserFilter
  label: string
}>

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

const avatarClasses = [
  'bg-accent-soft text-accent',
  'bg-warning-soft text-warning',
  'bg-surface-strong text-primary',
  'bg-danger-soft text-danger',
]

const dateFormatter =
  new Intl.DateTimeFormat(
    'en-ZA',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  )

const countFormatter =
  new Intl.NumberFormat(
    'en-ZA',
  )

function formatDate(
  value: string | null,
) {
  if (!value) {
    return 'Never'
  }

  const date =
    new Date(value)

  return Number.isNaN(
    date.getTime(),
  )
    ? 'Unavailable'
    : dateFormatter.format(
        date,
      )
}

function userInitials(
  user: AdminUser,
) {
  const initials =
    `${user.firstName
      .trim()
      .charAt(0)}${user.lastName
      .trim()
      .charAt(0)}`

  return (
    initials.toUpperCase() ||
    '?'
  )
}

function avatarClass(
  userId: string,
) {
  let value = 0

  for (
    const character of userId
  ) {
    value +=
      character.charCodeAt(
        0,
      )
  }

  return avatarClasses[
    value %
      avatarClasses.length
  ]
}

function isRestricted(
  user: AdminUser,
) {
  return (
    user.status === 'LOCKED' ||
    user.status ===
      'DEACTIVATED'
  )
}

function matchesFilter(
  user: AdminUser,
  filter: UserFilter,
) {
  switch (filter) {
    case 'ACTIVE':
      return (
        user.status === 'ACTIVE'
      )
    case 'PENDING':
      return (
        user.status ===
        'PENDING_VERIFICATION'
      )
    case 'RESTRICTED':
      return isRestricted(
        user,
      )
    case 'ADMINS':
      return user.roles.includes(
        'ROLE_ADMIN',
      )
    default:
      return true
  }
}

function UserRow({
  user,
}: {
  user: AdminUser
}) {
  const isAdmin =
    user.roles.includes(
      'ROLE_ADMIN',
    )

  return (
    <Link
      to={`/admin/users/${user.id}`}
      className="group relative grid gap-4 px-5 py-4 transition hover:bg-surface-muted/35 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent sm:px-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,1fr)_2.5rem] lg:items-center"
    >
      <span
        aria-hidden
        className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-accent opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      />

      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-xl text-xs font-bold ${avatarClass(
            user.id,
          )}`}
          aria-hidden
        >
          {userInitials(
            user,
          )}
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-ink">
              {user.firstName}{' '}
              {user.lastName}
            </h3>

            {isAdmin && (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-warning">
                <ShieldCheck
                  size={10}
                  aria-hidden
                />
                Admin
              </span>
            )}
          </div>

          <p
            className="mt-1 truncate text-xs text-subtle"
            title={
              user.email
            }
          >
            {user.email}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 lg:block">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusClasses[
            user.status
          ]}`}
        >
          <span
            className="size-1.5 shrink-0 rounded-full bg-current"
            aria-hidden
          />

          {
            statusLabels[
              user.status
            ]
          }
        </span>

        <p className="flex items-center gap-1.5 text-xs text-muted lg:mt-2">
          {user.emailVerified ? (
            <MailCheck
              size={13}
              className="text-success"
              aria-hidden
            />
          ) : (
            <Clock3
              size={13}
              className="text-warning"
              aria-hidden
            />
          )}

          {user.emailVerified
            ? 'Email verified'
            : 'Email not verified'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 lg:block">
        <p className="text-sm font-medium text-ink">
          {user.lastLoginAt
            ? formatDate(
                user.lastLoginAt,
              )
            : 'No sign-in yet'}
        </p>

        <p className="mt-1 text-xs text-subtle">
          Joined{' '}
          {formatDate(
            user.createdAt,
          )}
        </p>
      </div>

      <span className="inline-flex items-center gap-2 text-xs font-semibold text-accent lg:grid lg:size-9 lg:place-items-center lg:rounded-full lg:border lg:border-line lg:bg-surface lg:transition lg:group-hover:border-primary lg:group-hover:bg-primary lg:group-hover:text-inverse">
        <span className="lg:sr-only">
          View user
        </span>

        <ArrowRight
          size={16}
          className="transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </Link>
  )
}

function DirectorySkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading users"
      className="animate-pulse divide-y divide-line/50"
    >
      {[1, 2, 3, 4].map(
        (row) => (
          <div
            key={row}
            className="flex items-center gap-4 px-5 py-5 sm:px-6"
          >
            <div className="size-10 shrink-0 rounded-xl bg-surface-muted" />

            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 max-w-full rounded bg-surface-muted" />
              <div className="h-3 w-56 max-w-full rounded bg-surface-muted/70" />
            </div>

            <div className="hidden h-7 w-24 rounded-full bg-surface-muted sm:block" />
          </div>
        ),
      )}
    </div>
  )
}

export default function AdminUsersPage() {
  const [
    page,
    setPage,
  ] = useState(0)

  const [
    filter,
    setFilter,
  ] =
    useState<UserFilter>(
      'ALL',
    )

  const usersQuery =
    useAdminUsers(
      page,
      PAGE_SIZE,
    )

  const users =
    usersQuery.data?.items ??
    []

  const hasCurrentData =
    usersQuery.isSuccess

  const counts: Record<
    UserFilter,
    number
  > = {
    ALL: users.length,
    ACTIVE: users.filter(
      (user) =>
        user.status ===
        'ACTIVE',
    ).length,
    PENDING: users.filter(
      (user) =>
        user.status ===
        'PENDING_VERIFICATION',
    ).length,
    RESTRICTED:
      users.filter(
        isRestricted,
      ).length,
    ADMINS: users.filter(
      (user) =>
        user.roles.includes(
          'ROLE_ADMIN',
        ),
    ).length,
  }

  const filteredUsers =
    users.filter((user) =>
      matchesFilter(
        user,
        filter,
      ),
    )

  const verifiedCount =
    users.filter(
      (user) =>
        user.emailVerified,
    ).length

  const totalUsers =
    hasCurrentData
      ? countFormatter.format(
          usersQuery.data
            .totalElements,
        )
      : '—'

  function changePage(
    nextPage: number,
  ) {
    setPage(nextPage)
    setFilter('ALL')
  }

  function displayCount(
    value: number,
  ) {
    return hasCurrentData
      ? countFormatter.format(
          value,
        )
      : '—'
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Administration"
        title="People & access"
        description="Review Salif accounts, verification state and access from one place."
        actions={
          <RefreshButton
            isRefreshing={
              usersQuery.isFetching
            }
            onRefresh={
              usersQuery.refetch
            }
            label="Refresh users"
            iconOnly
          />
        }
      />

      <section
        aria-label="User overview"
        className="feature-reveal feature-reveal-delay-1 mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <article className="rounded-2xl border border-line/50 bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent">
              <UsersRound
                size={17}
                aria-hidden
              />
            </span>

            <p className="type-eyebrow">
              Total
            </p>
          </div>

          <p className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-ink">
            {totalUsers}
          </p>

          <p className="mt-1 text-xs text-muted">
            registered users
          </p>
        </article>

        <article className="rounded-2xl border border-line/50 bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-success-soft text-success">
              <CheckCircle2
                size={17}
                aria-hidden
              />
            </span>

            <p className="type-eyebrow">
              Active
            </p>
          </div>

          <p className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-ink">
            {displayCount(
              counts.ACTIVE,
            )}
          </p>

          <p className="mt-1 text-xs text-muted">
            on this page
          </p>
        </article>

        <article className="rounded-2xl border border-line/50 bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-warning-soft text-warning">
              <Clock3
                size={17}
                aria-hidden
              />
            </span>

            <p className="type-eyebrow">
              Pending
            </p>
          </div>

          <p className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-ink">
            {displayCount(
              counts.PENDING,
            )}
          </p>

          <p className="mt-1 text-xs text-muted">
            awaiting verification
          </p>
        </article>

        <article className="rounded-2xl border border-line/50 bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-danger-soft text-danger">
              <LockKeyhole
                size={17}
                aria-hidden
              />
            </span>

            <p className="type-eyebrow">
              Restricted
            </p>
          </div>

          <p className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-ink">
            {displayCount(
              counts.RESTRICTED,
            )}
          </p>

          <p className="mt-1 text-xs text-muted">
            locked or deactivated
          </p>
        </article>
      </section>

      <section
        aria-labelledby="user-directory-title"
        className="feature-reveal feature-reveal-delay-2 mt-8 overflow-hidden rounded-2xl border border-line/50 bg-surface shadow-[0_10px_30px_rgba(23,60,50,0.04)]"
      >
        <header className="px-5 pb-5 pt-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="type-eyebrow">
                User directory
              </p>

              <h2
                id="user-directory-title"
                className="mt-1 text-lg font-semibold text-ink"
              >
                Accounts
              </h2>

              <p className="mt-1 text-sm text-muted">
                Select a person to
                review their account
                and session history.
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-warning-soft px-3 py-2 text-xs font-semibold text-warning">
              <ShieldCheck
                size={14}
                aria-hidden
              />

              {displayCount(
                counts.ADMINS,
              )}{' '}
              admins on this page
            </span>
          </div>

          <div className="mt-5 border-t border-line/50 pt-4">
            <div className="flex flex-wrap gap-2">
              {filterOptions.map(
                (option) => {
                  const isSelected =
                    filter ===
                    option.value

                  return (
                    <button
                      key={
                        option.value
                      }
                      type="button"
                      aria-pressed={
                        isSelected
                      }
                      disabled={
                        !hasCurrentData
                      }
                      onClick={() =>
                        setFilter(
                          option.value,
                        )
                      }
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        isSelected
                          ? 'border-primary bg-primary text-inverse'
                          : 'border-line bg-surface text-muted hover:bg-surface-muted hover:text-ink'
                      }`}
                    >
                      {
                        option.label
                      }

                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                          isSelected
                            ? 'bg-white/15 text-inverse'
                            : 'bg-surface-strong text-muted'
                        }`}
                      >
                        {displayCount(
                          counts[
                            option.value
                          ],
                        )}
                      </span>
                    </button>
                  )
                },
              )}
            </div>

            {hasCurrentData && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-subtle">
                <span>
                  {
                    users.length
                  }{' '}
                  {users.length ===
                  1
                    ? 'user'
                    : 'users'}{' '}
                  loaded
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <MailCheck
                    size={13}
                    aria-hidden
                  />

                  {verifiedCount}{' '}
                  email verified
                </span>
              </div>
            )}
          </div>
        </header>

        {usersQuery.isPending && (
          <DirectorySkeleton />
        )}

        {usersQuery.isError && (
          <div className="px-5 pb-6 sm:px-6">
            <ErrorPanel
              title="We couldn’t load Salif users"
              message={
                usersQuery.error instanceof
                ApiClientError
                  ? usersQuery
                      .error.message
                  : 'Please try again.'
              }
              onRetry={() =>
                void usersQuery.refetch()
              }
            />
          </div>
        )}

        {usersQuery.isSuccess &&
          users.length === 0 && (
            <div className="px-5 pb-6 sm:px-6">
              <EmptyState
                icon={
                  <UsersRound
                    size={22}
                    aria-hidden
                  />
                }
                title="No users found"
                description="Registered users will appear here as soon as their accounts are created."
                variant="solid"
              />
            </div>
          )}

        {usersQuery.isSuccess &&
          users.length > 0 &&
          filteredUsers.length ===
            0 && (
            <div className="px-5 pb-6 sm:px-6">
              <EmptyState
                icon={
                  <UsersRound
                    size={22}
                    aria-hidden
                  />
                }
                title="No matches on this page"
                description="Try another filter or move to a different page of the directory."
                action={
                  <button
                    type="button"
                    onClick={() =>
                      setFilter(
                        'ALL',
                      )
                    }
                    className="mt-5 cursor-pointer rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-inverse transition hover:bg-primary-hover"
                  >
                    Show everyone
                  </button>
                }
                variant="solid"
              />
            </div>
          )}

        {usersQuery.isSuccess &&
          filteredUsers.length >
            0 && (
            <>
              <div className="hidden grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,1fr)_2.5rem] gap-4 border-y border-line/50 bg-surface-muted/60 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle lg:grid">
                <span>
                  Person & role
                </span>
                <span>
                  Account status
                </span>
                <span>
                  Last sign-in
                </span>
                <span className="sr-only">
                  View user
                </span>
              </div>

              <div className="divide-y divide-line/50">
                {filteredUsers.map(
                  (user) => (
                    <UserRow
                      key={
                        user.id
                      }
                      user={user}
                    />
                  ),
                )}
              </div>
            </>
          )}

        {usersQuery.isSuccess &&
          usersQuery.data
            .totalPages > 0 && (
            <footer className="border-t border-line/50 bg-surface-muted/50 px-5 py-4 sm:px-6">
              <Pagination
                label="User pages"
                page={
                  usersQuery.data
                    .page
                }
                totalPages={
                  usersQuery.data
                    .totalPages
                }
                onPageChange={
                  changePage
                }
                isFetching={
                  usersQuery.isFetching
                }
                summary={
                  <>
                    {
                      filteredUsers.length
                    }{' '}
                    of{' '}
                    {
                      users.length
                    }{' '}
                    shown
                    {' · '}
                    {countFormatter.format(
                      usersQuery
                        .data
                        .totalElements,
                    )}{' '}
                    total
                  </>
                }
              />
            </footer>
          )}
      </section>

      <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-subtle">
        <ShieldCheck
          size={14}
          className="mt-0.5 shrink-0 text-accent"
          aria-hidden
        />

        Account actions remain
        inside each user’s profile
        for review and
        confirmation.
      </p>
    </PageShell>
  )
}
