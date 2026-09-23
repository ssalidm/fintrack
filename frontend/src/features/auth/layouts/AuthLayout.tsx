import {
  LockKeyhole,
} from 'lucide-react'
import {
  Link,
  Outlet,
} from 'react-router'

import salifLogoGreen from '../../../assets/brand/salif-logo-green.svg'

function AuthLayout() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[radial-gradient(circle_at_15%_10%,rgba(22,128,95,0.16),transparent_28%),radial-gradient(circle_at_88%_84%,rgba(215,168,77,0.18),transparent_30%),linear-gradient(145deg,#e8efe9_0%,#f7f3e9_48%,#e3ece7_100%)]">
      <div
        className="auth-surface-grid pointer-events-none absolute inset-0 -z-10 opacity-45"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -left-28 top-[18%] -z-10 size-72 rounded-full bg-[#16805f]/10 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -right-28 bottom-[8%] -z-10 size-80 rounded-full bg-[#d7a84d]/12 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute right-[10%] top-[12%] -z-10 size-40 rounded-full border border-white/60 bg-white/20 backdrop-blur-3xl"
        aria-hidden="true"
      />

      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <Link
            to="/"
            aria-label="Salif home"
            className="inline-flex"
          >
            <img
              src={salifLogoGreen}
              alt=""
              className="h-auto w-28 object-contain sm:w-32"
            />
          </Link>

          <span className="flex items-center gap-2 text-xs font-medium text-[#657972]">
            <LockKeyhole
              size={14}
              aria-hidden
            />

            Secure access
          </span>
        </div>
      </header>

      <main
        className="
    flex min-h-screen
    items-center
    px-3
    pb-6
    pt-20

    sm:px-6
    sm:pb-10
    sm:pt-24

    lg:px-10
    lg:py-24
  "
      >
        <div className="relative z-10 mx-auto w-full min-w-0">
          <Outlet />
        </div>
      </main>

      <footer className="absolute inset-x-0 bottom-0 hidden pb-5 text-center text-xs text-[#7b8983] sm:block">
        Your financial information stays private and protected.
      </footer>
    </div>
  )
}

export default AuthLayout