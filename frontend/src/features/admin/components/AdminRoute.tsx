import {
  LoaderCircle,
  ShieldAlert,
} from 'lucide-react'
import {
  Link,
  Outlet,
} from 'react-router'

import { useProfile } from '@/features/profile/hooks/useProfile'

export default function AdminRoute() {
  const profileQuery = useProfile()

  if (profileQuery.isPending) {
    return (
      <main
        className="grid min-h-[calc(100vh-4rem)] place-items-center px-6 lg:min-h-screen"
        aria-busy="true"
      >
        <div className="text-center">
          <LoaderCircle
            size={30}
            className="mx-auto animate-spin text-accent"
            aria-hidden
          />

          <p className="mt-3 text-sm text-muted">
            Confirming admin access…
          </p>
        </div>
      </main>
    )
  }

  const isAdmin =
    profileQuery.data?.roles.includes(
      'ROLE_ADMIN',
    )

  if (
    profileQuery.isError ||
    !isAdmin
  ) {
    return (
      <main className="grid min-h-[calc(100vh-4rem)] place-items-center px-6 lg:min-h-screen">
        <section className="w-full max-w-lg rounded-[2rem] border border-line bg-surface p-8 text-center shadow-[var(--salif-shadow-panel)]">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-danger-soft text-danger">
            <ShieldAlert
              size={27}
              aria-hidden
            />
          </span>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-warning">
            Restricted area
          </p>

          <h1 className="mt-2 font-serif text-3xl text-ink">
            Admin access required
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">
            {profileQuery.isError
              ? 'We could not confirm your access right now. Please try again.'
              : 'Your account does not have permission to manage Salif users.'}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {profileQuery.isError && (
              <button
                type="button"
                onClick={() =>
                  void profileQuery.refetch()
                }
                className="cursor-pointer rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-inverse transition hover:bg-primary-hover"
              >
                Try again
              </button>
            )}

            <Link
              to="/dashboard"
              className="cursor-pointer rounded-full border border-line-strong px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-muted"
            >
              Return to overview
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return <Outlet />
}