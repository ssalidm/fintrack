import { Link } from 'react-router'

import salifLogoLight from '@/assets/brand/salif-logo-light.svg'

export default function PublicFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#092f28] text-[#a9c9bd]">
      {/* Footer atmosphere */}

      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        {/* grid */}
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,rgba(255,255,255,0.28)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.28)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:linear-gradient(to_top,black_0%,rgba(0,0,0,0.75)_65%,transparent_100%)]" />

        {/* rings */}
        <div className="absolute -bottom-40 -left-28 size-[360px] rounded-full border border-white/10" />

        <div className="absolute -bottom-24 -left-12 size-[245px] rounded-full border border-white/[0.07]" />

        {/* green wash */}
        <div className="absolute -left-28 bottom-[-12rem] size-[28rem] rounded-full bg-[#16805f]/20 blur-[100px]" />

        {/* gold wash */}
        <div className="absolute -right-32 -top-44 size-[26rem] rounded-full bg-[#d7a84d]/15 blur-[110px]" />

        {/* angled lines */}
        <div className="absolute right-[7%] top-14 h-px w-40 rotate-[-12deg] bg-white/10" />

        <div className="absolute right-[5%] top-24 h-px w-24 rotate-[-12deg] bg-[#d7a84d]/20" />
      </div>

      <div className="relative mx-auto max-w-[1240px] px-5 pb-7 pt-12 sm:px-8 lg:px-12 lg:pt-14">
        <div className="grid gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.8fr]">
          <div>
            <Link
              to="/"
              aria-label="Salif home"
              className="inline-flex"
            >
              <img
                src={salifLogoLight}
                alt="Salif"
                className="h-auto w-27 sm:w-30"
              />
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-[#a9c9bd]">
              Personal finance, made clearer.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              Explore
            </p>

            <nav
              aria-label="Product footer navigation"
              className="mt-4 flex flex-col items-start gap-3 text-sm"
            >
              <a
                href="/#features"
                className="transition hover:text-white"
              >
                Features
              </a>

              <a
                href="/#security"
                className="transition hover:text-white"
              >
                Security
              </a>

              <Link
                to="/support"
                className="transition hover:text-white"
              >
                Support
              </Link>
            </nav>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              Legal
            </p>

            <nav
              aria-label="Legal footer navigation"
              className="mt-4 flex flex-col items-start gap-3 text-sm"
            >
              <Link
                to="/privacy"
                className="transition hover:text-white"
              >
                Privacy
              </Link>

              <Link
                to="/terms"
                className="transition hover:text-white"
              >
                Terms
              </Link>

              <Link
                to="/login"
                className="transition hover:text-white"
              >
                Sign in
              </Link>
            </nav>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs text-[#789f91] sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy;{' '}
            {new Date().getFullYear()}{' '}
            Salif. All rights reserved.
          </p>

          <p>
            Personal finance, in order.
          </p>
        </div>
      </div>
    </footer>
  )
}