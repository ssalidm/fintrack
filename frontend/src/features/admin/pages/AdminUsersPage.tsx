import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { ApiClientError } from '../../../api/ApiClientError'
import PageShell from '../../../components/layout/PageShell'
import Pagination from '../../../components/ui/Pagination'
import type { UserStatus } from '../../profile/api/types'
import type { AdminUser } from '../api/types'
import { useAdminUsers } from '../hooks/useAdminUsers'

const PAGE_SIZE = 12

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

function formatDate(value: string | null) {
  if (!value) return 'Never'

  return new Intl.DateTimeFormat('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function userInitials(user: AdminUser) {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
    .toUpperCase()
}

interface UserIdentityProps {
  user: AdminUser
}

function UserIdentity({ user }: UserIdentityProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#dfece3] text-xs font-bold text-[#39725d]">
        {userInitials(user)}
      </span>

      <span className="min-w-0">
        <span className="block truncate font-semibold text-[#173c32]">
          {user.firstName} {user.lastName}
        </span>

        <span className="mt-0.5 block truncate text-xs text-[#71807b]">
          {user.email}
        </span>
      </span>
    </div>
  )
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(0)
  const usersQuery = useAdminUsers(page, PAGE_SIZE)
  const users = usersQuery.data?.items ?? []

  const visibleActive = users.filter(
    (user) => user.status === 'ACTIVE',
  ).length

  const visibleAdmins = users.filter(
    (user) => user.roles.includes('ROLE_ADMIN'),
  ).length

  const visibleAttention = users.filter(
    (user) =>
      user.status === 'LOCKED' ||
      user.status === 'DEACTIVATED',
  ).length

  return (
    <PageShell>
      <header className="feature-reveal flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[#657972]">
            ADMINISTRATION
          </p>

          <h1 className="mt-4 font-serif text-5xl tracking-[-0.03em] text-[#173c32]">
            User management
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#657972]">
            Review account access, user status, and active sessions from one
            secure workspace.
          </p>
        </div>

        <button
          type="button"
          disabled={usersQuery.isFetching}
          onClick={() => void usersQuery.refetch()}
          className="grid size-11 cursor-pointer place-items-center rounded-full border border-[#d8d6ce] bg-[#fffdf8] text-[#657972] transition hover:border-[#bd9460] hover:text-[#9a6828] disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Refresh users"
          title="Refresh users"
        >
          <RefreshCw
            size={18}
            className={usersQuery.isFetching ? 'animate-spin' : ''}
            aria-hidden
          />
        </button>
      </header>

      <section className="feature-reveal feature-reveal-delay-1 mt-9 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl bg-[#174f43] p-5 text-white shadow-[0_16px_40px_rgba(23,79,67,0.12)]">
          <UsersRound size={20} className="text-[#bcd9c5]" aria-hidden />
          <p className="mt-6 text-3xl font-semibold">
            {usersQuery.data?.totalElements ?? '—'}
          </p>
          <p className="mt-1 text-xs text-[#c9ddd5]">Total users</p>
        </article>

        <article className="rounded-2xl border border-[#dedbd2] bg-[#fffdf8] p-5">
          <UserRoundCheck size={20} className="text-[#39725d]" aria-hidden />
          <p className="mt-6 text-3xl font-semibold text-[#173c32]">
            {usersQuery.isPending ? '—' : visibleActive}
          </p>
          <p className="mt-1 text-xs text-[#71807b]">Active on this page</p>
        </article>

        <article className="rounded-2xl border border-[#dedbd2] bg-[#fffdf8] p-5">
          <ShieldCheck size={20} className="text-[#8b6c3d]" aria-hidden />
          <p className="mt-6 text-3xl font-semibold text-[#173c32]">
            {usersQuery.isPending ? '—' : visibleAdmins}
          </p>
          <p className="mt-1 text-xs text-[#71807b]">Admins on this page</p>
        </article>

        <article className="rounded-2xl border border-[#dedbd2] bg-[#fffdf8] p-5">
          <Clock3 size={20} className="text-[#a6533f]" aria-hidden />
          <p className="mt-6 text-3xl font-semibold text-[#173c32]">
            {usersQuery.isPending ? '—' : visibleAttention}
          </p>
          <p className="mt-1 text-xs text-[#71807b]">Needs attention here</p>
        </article>
      </section>

      {usersQuery.isPending && (
        <section
          className="feature-reveal feature-reveal-delay-2 mt-7 animate-pulse overflow-hidden rounded-3xl border border-[#dedbd2] bg-[#fffdf8]"
          aria-busy="true"
        >
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="h-20 border-b border-[#ebe8e0] bg-[#f2f0ea] last:border-0"
            />
          ))}
        </section>
      )}

      {usersQuery.isError && (
        <section
          className="feature-reveal feature-reveal-delay-2 mt-7 rounded-3xl border border-red-200 bg-red-50 p-7"
          role="alert"
        >
          <h2 className="font-serif text-2xl text-red-950">
            We couldn’t load Salif users
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {usersQuery.error instanceof ApiClientError
              ? usersQuery.error.message
              : 'Please try again.'}
          </p>

          <button
            type="button"
            onClick={() => void usersQuery.refetch()}
            className="mt-5 cursor-pointer text-sm font-semibold text-red-800 underline underline-offset-4"
          >
            Try again
          </button>
        </section>
      )}

      {!usersQuery.isPending &&
        !usersQuery.isError &&
        users.length === 0 && (
          <section className="feature-reveal feature-reveal-delay-2 mt-7 rounded-3xl border border-[#dedbd2] bg-[#fffdf8] px-6 py-16 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#dfece3] text-[#39725d]">
              <UsersRound size={25} aria-hidden />
            </span>

            <h2 className="mt-5 font-serif text-3xl text-[#173c32]">
              No users found
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#657972]">
              Registered users will appear here as soon as their accounts are
              created.
            </p>
          </section>
        )}

      {!usersQuery.isPending &&
        !usersQuery.isError &&
        users.length > 0 && (
          <section className="feature-reveal feature-reveal-delay-2 mt-7 overflow-hidden rounded-3xl border border-[#dedbd2] bg-[#fffdf8]">
            <div className="hidden grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_auto] gap-5 border-b border-[#dedbd2] bg-[#f3f0e8] px-7 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#71807b] md:grid">
              <span>User</span>
              <span>Status</span>
              <span>Role</span>
              <span>Last login</span>
              <span className="sr-only">Open</span>
            </div>

            {users.map((user, index) => {
              const isAdmin = user.roles.includes('ROLE_ADMIN')

              return (
                <Link
                  key={user.id}
                  to={`/admin/users/${user.id}`}
                  className={`group block cursor-pointer px-5 py-5 transition hover:bg-[#f7f4ec] md:grid md:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_auto] md:items-center md:gap-5 md:px-7 ${
                    index > 0 ? 'border-t border-[#ebe8e0]' : ''
                  }`}
                >
                  <UserIdentity user={user} />

                  <div className="mt-4 flex items-center justify-between gap-3 md:mt-0 md:block">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8b9792] md:hidden">
                      Status
                    </span>

                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClasses[user.status]}`}
                    >
                      {statusLabels[user.status]}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 md:mt-0 md:block">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8b9792] md:hidden">
                      Role
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#455b53]">
                      {isAdmin && <ShieldCheck size={14} aria-hidden />}
                      {isAdmin ? 'Admin' : 'User'}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 text-sm text-[#657972] md:mt-0 md:block">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8b9792] md:hidden">
                      Last login
                    </span>
                    <span>{formatDate(user.lastLoginAt)}</span>
                  </div>

                  <ArrowRight
                    size={18}
                    className="mt-4 hidden text-[#9a6828] transition-transform group-hover:translate-x-1 md:mt-0 md:block"
                    aria-hidden
                  />
                </Link>
              )
            })}

            <footer className="border-t border-[#dedbd2] bg-[#f9f7f1] px-5 py-4 sm:px-7">
              <Pagination
                label="User pages"
                page={usersQuery.data.page}
                totalPages={usersQuery.data.totalPages}
                onPageChange={setPage}
                isFetching={usersQuery.isFetching}
                summary={
                  <>
                    Page {usersQuery.data.page + 1} of{' '}
                    {usersQuery.data.totalPages}
                    <span className="mx-2 text-[#c2beb5]">·</span>
                    {usersQuery.data.totalElements} users
                  </>
                }
              />
            </footer>
          </section>
        )}

      <p className="feature-reveal feature-reveal-delay-3 mt-5 flex items-center gap-2 text-xs text-[#71807b]">
        <CheckCircle2 size={14} className="text-[#39725d]" aria-hidden />
        User records are ordered from newest to oldest.
      </p>
    </PageShell>
  )
}