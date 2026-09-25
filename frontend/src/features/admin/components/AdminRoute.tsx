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
            className="mx-auto animate-spin text-[#1f7a5c]"
            aria-hidden
          />

          <p className="mt-3 text-sm text-[#607069]">
            Confirming admin access…
          </p>
        </div>
      </main>
    )
  }

  const isAdmin = profileQuery.data?.roles.includes(
    'ROLE_ADMIN',
  )

  if (profileQuery.isError || !isAdmin) {
    return (
      <main className="grid min-h-[calc(100vh-4rem)] place-items-center px-6 lg:min-h-screen">
        <section className="w-full max-w-lg rounded-[2rem] border border-[#dedbd2] bg-[#fffdf8] p-8 text-center shadow-[0_20px_60px_rgba(23,79,67,0.08)]">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#f5e8df] text-[#a6533f]">
            <ShieldAlert
              size={27}
              aria-hidden
            />
          </span>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#9a6c45]">
            Restricted area
          </p>

          <h1 className="mt-2 font-serif text-3xl text-[#173c32]">
            Admin access required
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#607069]">
            {profileQuery.isError
              ? 'We could not confirm your access right now. Please try again.'
              : 'Your account does not have permission to manage Salif users.'}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {profileQuery.isError && (
              <button
                type="button"
                onClick={() => void profileQuery.refetch()}
                className="cursor-pointer rounded-full bg-[#174f43] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f3f35]"
              >
                Try again
              </button>
            )}

            <Link
              to="/dashboard"
              className="cursor-pointer rounded-full border border-[#cfcac0] px-5 py-2.5 text-sm font-semibold text-[#173c32] transition hover:bg-[#f1eee6]"
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
