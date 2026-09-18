import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link, NavLink } from 'react-router'

import salifLogoGreen from '../../assets/brand/salif-logo-green.svg'

interface PublicPageLayoutProps {
  children: ReactNode
}

const navigation = [
  { to: '/support', label: 'Support' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
]

export default function PublicPageLayout({
  children,
}: PublicPageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f4f1e8] text-[#123e33]">
      <a
        href="#main-content"
        className="sr-only z-[60] rounded-lg bg-white px-4 py-3 text-sm font-semibold focus:fixed focus:left-4 focus:top-4 focus:not-sr-only"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 shrink-0 border-b border-[#d9d4c8] bg-[#fffdf8]">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-8 gap-y-5 px-5 py-5 sm:px-8 lg:px-12">
          <Link
            to="/"
            aria-label="Salif home"
            className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#16805f]"
          >
            <img
              src={salifLogoGreen}
              alt=""
              className="h-auto w-27 sm:w-31"
            />
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full bg-[#0d4f3f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#146b52] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#16805f] sm:order-3"
          >
            Sign in
            <ArrowRight size={15} aria-hidden />
          </Link>

          <nav
            aria-label="Public pages"
            className="flex w-full items-center gap-7 text-sm sm:order-2 sm:ml-auto sm:w-auto"
          >
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-sm py-1 font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#16805f] ${
                    isActive
                      ? 'text-[#0d4f3f] underline decoration-[#d09b3c] decoration-2 underline-offset-8'
                      : 'text-[#657972] hover:text-[#0d4f3f]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-[1240px] flex-1 scroll-mt-40 px-5 py-10 sm:scroll-mt-24 sm:px-8 sm:py-14 lg:px-12 lg:py-16"
      >
        {children}
      </main>

      <footer className="bg-[#092f28] text-[#a9c9bd]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-5 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <div>
            <p className="text-sm font-semibold text-white">
              Personal finance, made clearer.
            </p>

            <p className="mt-2 text-xs">
              © {new Date().getFullYear()} Salif. All rights reserved.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-5 text-xs"
          >
            {[
              { to: '/', label: 'Home' },
              ...navigation,
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-sm transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d7a84d]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}