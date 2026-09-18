import { useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  MailCheck,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'

import { ApiClientError } from '../../../api/ApiClientError'
import RefreshButton from '../../../components/actions/RefreshButton'
import PageHeader from '../../../components/layout/PageHeader'
import PageShell from '../../../components/layout/PageShell'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorPanel from '../../../components/ui/ErrorPanel'
import Pagination from '../../../components/ui/Pagination'
import type { UserStatus } from '../../profile/api/types'
import type { AdminUser } from '../api/types'
import { useAdminUsers } from '../hooks/useAdminUsers'

const PAGE_SIZE = 12

type UserFilter = 'ALL' | 'ACTIVE' | 'PENDING' | 'RESTRICTED' | 'ADMINS'

const filterOptions = [
  { value: 'ALL', label: 'Everyone' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING', label: 'Awaiting verification' },
  { value: 'RESTRICTED', label: 'Restricted' },
  { value: 'ADMINS', label: 'Administrators' },
] satisfies ReadonlyArray<{ value: UserFilter; label: string }>

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

const avatarClasses = [
  'bg-[#e1ece4] text-[#39725d]',
  'bg-[#eee4d3] text-[#8c6938]',
  'bg-[#e2e9ee] text-[#526f83]',
  'bg-[#ede4e9] text-[#846476]',
]

const dateFormatter = new Intl.DateTimeFormat('en-ZA', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const countFormatter = new Intl.NumberFormat('en-ZA')

function formatDate(value: string | null) {
  if (!value) return 'Never'

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? 'Unavailable'
    : dateFormatter.format(date)
}

function userInitials(user: AdminUser) {
  const initials =
    `${user.firstName.trim().charAt(0)}${user.lastName.trim().charAt(0)}`

  return initials.toUpperCase() || '?'
}

function avatarClass(userId: string) {
  let value = 0

  for (const character of userId) {
    value += character.charCodeAt(0)
  }

  return avatarClasses[value % avatarClasses.length]
}

function isRestricted(user: AdminUser) {
  return user.status === 'LOCKED' || user.status === 'DEACTIVATED'
}

function matchesFilter(user: AdminUser, filter: UserFilter) {
  switch (filter) {
    case 'ACTIVE':
      return user.status === 'ACTIVE'
    case 'PENDING':
      return user.status === 'PENDING_VERIFICATION'
    case 'RESTRICTED':
      return isRestricted(user)
    case 'ADMINS':
      return user.roles.includes('ROLE_ADMIN')
    default:
      return true
  }
}

function UserRow({ user }: { user: AdminUser }) {
  const isAdmin = user.roles.includes('ROLE_ADMIN')

  return (
    <Link
      to={`/admin/users/${user.id}`}
      className="group relative grid gap-5 border-t border-[#ebe7dd] px-5 py-6 transition duration-200 first:border-t-0 hover:bg-[#f6f5ed] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#39725d] sm:px-7 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,1fr)_2.5rem] lg:items-center"
    >
      <span
        aria-hidden
        className="absolute inset-y-5 left-0 w-1 rounded-r-full bg-[#39725d] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      />

      <div className="flex min-w-0 items-center gap-4">
        <span
          className={`grid size-12 shrink-0 place-items-center rounded-2xl text-sm font-bold ring-1 ring-black/5 ${avatarClass(user.id)}`}
          aria-hidden
        >
          {userInitials(user)}
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="break-words font-semibold text-[#173c32]">
              {user.firstName} {user.lastName}
            </h3>

            {isAdmin && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#eee5d5] px-1.5 py-0.5 text-[10px] font-bold text-[#8c6938]">
                <ShieldCheck size={11} aria-hidden />
                ADMIN
              </span>
            )}
          </div>

          <p className="mt-1 truncate text-sm text-[#71807b]" title={user.email}>
            {user.email}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 lg:block">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold ${statusClasses[user.status]}`}
        >
          <span
            className="size-1.5 shrink-0 rounded-full bg-current"
            aria-hidden
          />
          {statusLabels[user.status]}
        </span>

        <p className="flex items-center gap-1.5 text-xs text-[#71807b] lg:mt-2">
          {user.emailVerified ? (
            <MailCheck size={13} className="text-[#39725d]" aria-hidden />
          ) : (
            <Clock3 size={13} className="text-[#956624]" aria-hidden />
          )}
          {user.emailVerified ? 'Email verified' : 'Email not verified'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 lg:block">
        <p className="text-sm font-medium text-[#455b53]">
          {user.lastLoginAt
            ? formatDate(user.lastLoginAt)
            : 'No sign-in yet'}
        </p>

        <p className="text-xs text-[#87938e] lg:mt-1.5">
          Joined {formatDate(user.createdAt)}
        </p>
      </div>

      <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#39725d] lg:grid lg:size-10 lg:place-items-center lg:rounded-full lg:border lg:border-[#e0dfd5] lg:bg-[#fffdf8] lg:transition lg:group-hover:border-[#174f43] lg:group-hover:bg-[#174f43] lg:group-hover:text-white">
        <span className="lg:sr-only">
          View user
        </span>
        <ArrowRight
          size={17}
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
      className="animate-pulse divide-y divide-[#ebe7dd]"
    >
      {[1, 2, 3, 4].map((row) => (
        <div key={row} className="flex items-center gap-4 px-5 py-6 sm:px-7">
          <div className="size-12 shrink-0 rounded-2xl bg-[#e7e8df]" />

          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 max-w-full rounded bg-[#e7e8df]" />
            <div className="h-3 w-56 max-w-full rounded bg-[#eeece5]" />
          </div>

          <div className="hidden h-7 w-24 rounded-full bg-[#eeece5] sm:block" />
        </div>
      ))}
    </div>
  )
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState<UserFilter>('ALL')

  const usersQuery = useAdminUsers(page, PAGE_SIZE)
  const users = usersQuery.data?.items ?? []
  const hasCurrentData = usersQuery.isSuccess

  const counts: Record<UserFilter, number> = {
    ALL: users.length,
    ACTIVE: users.filter((user) => user.status === 'ACTIVE').length,
    PENDING: users.filter(
      (user) => user.status === 'PENDING_VERIFICATION',
    ).length,
    RESTRICTED: users.filter(isRestricted).length,
    ADMINS: users.filter((user) => user.roles.includes('ROLE_ADMIN')).length,
  }

  const filteredUsers = users.filter((user) => matchesFilter(user, filter))

  const verifiedCount = users.filter((user) => user.emailVerified).length

  const totalUsers = hasCurrentData
    ? countFormatter.format(usersQuery.data.totalElements)
    : '—'

  const pageLabel = hasCurrentData
    ? `Page ${usersQuery.data.page + 1} of ${Math.max(usersQuery.data.totalPages, 1)}`
    : 'User directory'

  function changePage(nextPage: number) {
    setPage(nextPage)
    setFilter('ALL')
  }

  function displayCount(value: number) {
    return hasCurrentData ? countFormatter.format(value) : '—'
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Administration"
        title="People & access"
        description="A clearer view of the people using Salif."
        actions={
          <RefreshButton
            isRefreshing={usersQuery.isFetching}
            onRefresh={usersQuery.refetch}
            label="Refresh users"
          />
        }
      />

      <section
        aria-label="User overview"
        className="feature-reveal feature-reveal-delay-1 relative mt-8 overflow-hidden rounded-[2rem] bg-[#174f43] text-white shadow-[0_20px_60px_rgba(23,79,67,0.13)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-36 size-96 rounded-full border border-white/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-2 -top-16 size-56 rounded-full border border-white/10"
        />

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12 lg:p-10">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d3e5da]">
              <UsersRound size={13} aria-hidden />
              The Salif directory
            </span>

            <h2 className="mt-5 max-w-lg font-serif text-3xl leading-tight tracking-[-0.025em] sm:text-4xl">
              Every account.
              <br />
              A clear picture.
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-[#c5dbd1]">
              Review account status, check verification and open a user’s
              profile to manage their access.
            </p>
          </div>

          <div className="border-t border-white/15 pt-6 lg:min-w-52 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c9b58a]">
              Total registered users
            </p>

            <p className="mt-2 break-all font-serif text-6xl leading-none tracking-[-0.04em] sm:text-7xl">
              {totalUsers}
            </p>

            <div className="mt-5 inline-flex items-center gap-2 text-xs text-[#c5dbd1]">
              <ArrowDown size={13} aria-hidden />
              Newest accounts first
            </div>
          </div>
        </div>

        <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-black/10 px-6 py-3.5 text-xs sm:px-8 lg:px-10">
          <p className="text-[#d6e6dd]">
            {pageLabel}
            {hasCurrentData && (
              <span className="text-[#adcabc]">
                {' · '}
                {users.length} {users.length === 1 ? 'user' : 'users'} loaded
              </span>
            )}
          </p>

          <p className="inline-flex items-center gap-2 text-[#d6e6dd]">
            <MailCheck size={14} aria-hidden />
            {displayCount(verifiedCount)} email verified on this page
          </p>
        </div>
      </section>

      <section
        aria-label="Account statuses on this page"
        className="feature-reveal feature-reveal-delay-2 mt-5 grid gap-3 sm:grid-cols-3"
      >
        <article className="flex items-center gap-4 rounded-2xl border border-[#d5e1d6] bg-[#edf3ec] px-5 py-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/75 text-[#39725d]">
            <CheckCircle2 size={21} aria-hidden />
          </span>

          <div>
            <p className="flex items-baseline gap-2">
              <span className="font-serif text-3xl text-[#173c32]">
                {displayCount(counts.ACTIVE)}
              </span>
              <span className="text-sm font-semibold text-[#39725d]">
                Active
              </span>
            </p>
            <p className="mt-0.5 text-xs text-[#71807b]">
              On this page
            </p>
          </div>
        </article>

        <article className="flex items-center gap-4 rounded-2xl border border-[#e7ddc7] bg-[#f7f1e3] px-5 py-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/75 text-[#956624]">
            <Clock3 size={21} aria-hidden />
          </span>

          <div>
            <p className="flex items-baseline gap-2">
              <span className="font-serif text-3xl text-[#173c32]">
                {displayCount(counts.PENDING)}
              </span>
              <span className="text-sm font-semibold text-[#956624]">
                Pending
              </span>
            </p>
            <p className="mt-0.5 text-xs text-[#81765f]">
              Awaiting verification on this page
            </p>
          </div>
        </article>

        <article className="flex items-center gap-4 rounded-2xl border border-[#e7d8ce] bg-[#f5ebe5] px-5 py-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/75 text-[#a6533f]">
            <LockKeyhole size={21} aria-hidden />
          </span>

          <div>
            <p className="flex items-baseline gap-2">
              <span className="font-serif text-3xl text-[#173c32]">
                {displayCount(counts.RESTRICTED)}
              </span>
              <span className="text-sm font-semibold text-[#a6533f]">
                Restricted
              </span>
            </p>
            <p className="mt-0.5 text-xs text-[#88746a]">
              Locked or deactivated on this page
            </p>
          </div>
        </article>
      </section>

      <section
        aria-labelledby="user-directory-title"
        className="feature-reveal feature-reveal-delay-3 mt-8 overflow-hidden rounded-[1.75rem] border border-[#dedbd2] bg-[#fffdf8] shadow-[0_8px_30px_rgba(34,57,48,0.035)]"
      >
        <header className="px-5 pb-5 pt-6 sm:px-7 sm:pt-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#87938e]">
                Your community
              </p>

              <h2
                id="user-directory-title"
                className="mt-1.5 font-serif text-3xl tracking-[-0.02em] text-[#173c32]"
              >
                User directory
              </h2>

              <p className="mt-2 text-sm text-[#71807b]">
                Select a person to view their account and session history.
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-[#e6decd] bg-[#f7f2e8] px-3 py-2 text-xs font-medium text-[#8b6c3d]">
              <ShieldCheck size={14} aria-hidden />
              {displayCount(counts.ADMINS)} admins on this page
            </span>
          </div>

          <div className="mt-6 border-t border-[#ebe7dd] pt-5">
            <p
              id="user-filter-label"
              className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#87938e]"
            >
              Filter this page
            </p>

            <div
              role="group"
              aria-labelledby="user-filter-label"
              className="flex flex-wrap gap-2"
            >
              {filterOptions.map((option) => {
                const isSelected = filter === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isSelected}
                    disabled={!hasCurrentData}
                    onClick={() => setFilter(option.value)}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39725d] disabled:cursor-not-allowed disabled:opacity-50 ${
                      isSelected
                        ? 'border-[#174f43] bg-[#174f43] text-white'
                        : 'border-[#e3e0d6] bg-transparent text-[#657972] hover:border-[#aabeb1] hover:bg-[#f1f4ed] hover:text-[#173c32]'
                    }`}
                  >
                    {option.label}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                        isSelected
                          ? 'bg-white/15 text-white'
                          : 'bg-[#eeece4] text-[#71807b]'
                      }`}
                    >
                      {displayCount(counts[option.value])}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </header>

        {usersQuery.isPending && <DirectorySkeleton />}

        {usersQuery.isError && (
          <div className="px-5 pb-6 sm:px-7">
            <ErrorPanel
              title="We couldn’t load Salif users"
              message={
                usersQuery.error instanceof ApiClientError
                  ? usersQuery.error.message
                  : 'Please try again.'
              }
              onRetry={() => void usersQuery.refetch()}
            />
          </div>
        )}

        {usersQuery.isSuccess && users.length === 0 && (
          <div className="px-5 pb-6 sm:px-7">
            <EmptyState
              icon={<UsersRound size={25} aria-hidden />}
              title="No users found"
              description="Registered users will appear here as soon as their accounts are created."
              variant="solid"
            />
          </div>
        )}

        {usersQuery.isSuccess &&
          users.length > 0 &&
          filteredUsers.length === 0 && (
            <div className="px-5 pb-6 sm:px-7">
              <EmptyState
                icon={<UsersRound size={25} aria-hidden />}
                title="No matches on this page"
                description="Try another filter or move to a different page of the directory."
                action={
                  <button
                    type="button"
                    onClick={() => setFilter('ALL')}
                    className="mt-6 cursor-pointer rounded-full bg-[#174f43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#236a58]"
                  >
                    Show everyone on this page
                  </button>
                }
              />
            </div>
          )}

        {usersQuery.isSuccess && filteredUsers.length > 0 && (
          <>
            <div className="hidden grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,1fr)_2.5rem] gap-5 border-y border-[#ebe7dd] bg-[#f7f5ee] px-7 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#87938e] lg:grid">
              <span>Person & role</span>
              <span>Account status</span>
              <span>Last sign-in</span>
              <span className="sr-only">View user</span>
            </div>

            <div>
              {filteredUsers.map((user) => (
                <UserRow key={user.id} user={user} />
              ))}
            </div>
          </>
        )}

        {usersQuery.isSuccess && usersQuery.data.totalPages > 0 && (
          <footer className="border-t border-[#dedbd2] bg-[#f9f7f1] px-5 py-4 sm:px-7">
            <Pagination
              label="User pages"
              page={usersQuery.data.page}
              totalPages={usersQuery.data.totalPages}
              onPageChange={changePage}
              isFetching={usersQuery.isFetching}
              summary={
                <>
                  {filteredUsers.length} of {users.length} shown on this page
                  <span className="mx-2 text-[#c2beb5]">·</span>
                  {countFormatter.format(usersQuery.data.totalElements)} total
                  {' · '}
                  Page {usersQuery.data.page + 1} of {usersQuery.data.totalPages}
                </>
              }
            />
          </footer>
        )}
      </section>

      <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-[#87938e]">
        <ShieldCheck
          size={14}
          className="mt-0.5 shrink-0 text-[#39725d]"
          aria-hidden
        />
        Account actions remain inside each user’s profile for review and
        confirmation.
      </p>
    </PageShell>
  )
}