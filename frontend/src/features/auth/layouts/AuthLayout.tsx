import {
  LockKeyhole,
  Moon,
  Sun,
} from 'lucide-react'
import {
  Link,
  Outlet,
} from 'react-router'

import salifLogoGreen from '../../../assets/brand/salif-logo-green.svg'
import salifLogoLight from '../../../assets/brand/salif-logo-light.svg'
import { useTheme } from '../../theme/context/useTheme'

function AuthLayout() {
  const {
    resolvedTheme,
    toggleTheme,
  } = useTheme()

  const isDark =
    resolvedTheme === 'dark'

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-app text-ink">
      {/* Background pattern */}
      <div
        className="auth-surface-grid pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      />

      <div
        className="pointer-events-none absolute -left-40 -top-24 -z-10 size-[30rem] rounded-full bg-accent-soft/65 blur-[120px]"
        aria-hidden
      />

      <div
        className="pointer-events-none absolute -right-44 bottom-[-10rem] -z-10 size-[32rem] rounded-full bg-warning-soft/45 blur-[130px]"
        aria-hidden
      />

      {/* Structural background detail */}
      <div
        className="pointer-events-none absolute right-[5%] top-[10%] -z-10 hidden lg:block"
        aria-hidden
      >
        <div className="relative size-[270px]">
          <div className="absolute inset-0 rounded-full border border-line/60" />

          <div className="absolute inset-[42px] rounded-full border border-line/40" />

          <div className="absolute inset-[86px] rounded-full border border-accent/20" />

          <div className="absolute right-[-12px] top-[46px] h-px w-28 rotate-[-12deg] bg-line" />

          <div className="absolute right-[-28px] top-[72px] h-px w-16 rotate-[-12deg] bg-accent/30" />
        </div>
      </div>

      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <Link
            to="/"
            aria-label="Salif home"
            className="inline-flex"
          >
            <img
              src={
                isDark
                  ? salifLogoLight
                  : salifLogoGreen
              }
              alt="Salif"
              className="h-auto w-28 object-contain sm:w-32"
            />
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 text-xs font-medium text-muted sm:flex">
              <LockKeyhole
                size={14}
                aria-hidden
              />

              Secure access
            </span>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                isDark
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
              title={
                isDark
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
              className="grid size-9 place-items-center rounded-full border border-line bg-surface/70 text-muted backdrop-blur-sm transition hover:border-line-strong hover:bg-surface hover:text-ink"
            >
              {isDark ? (
                <Sun
                  size={17}
                  aria-hidden
                />
              ) : (
                <Moon
                  size={17}
                  aria-hidden
                />
              )}
            </button>
          </div>
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

      <footer className="absolute inset-x-0 bottom-0 hidden pb-5 text-center text-xs text-subtle sm:block">
        Your financial information stays private and protected.
      </footer>
    </div>
  )
}

export default AuthLayout