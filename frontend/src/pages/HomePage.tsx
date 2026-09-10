import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  ChartNoAxesCombined,
  Check,
  LockKeyhole,
  ShieldCheck,
  Target,
  WalletCards,
} from 'lucide-react'
import { Link } from 'react-router'

import salifLogoDark from '../assets/brand/salif-logo-green.png'
import { useAuth } from '../features/auth/context/useAuth'

const features = [
  {
    icon: WalletCards,
    eyebrow: 'ONE CLEAR VIEW',
    title: 'Know what you have',
    description:
      'Bring your accounts and everyday transactions together without losing sight of the details.',
    accent:
      'bg-[#dcebe2] text-[#21634f]',
  },
  {
    icon: CalendarClock,
    eyebrow: 'PLAN AHEAD',
    title: 'See what comes next',
    description:
      'Keep recurring payments, overdue commitments and upcoming expenses where you can act on them.',
    accent:
      'bg-[#f1e5c8] text-[#8a6727]',
  },
  {
    icon: Target,
    eyebrow: 'SAVE WITH PURPOSE',
    title: 'Give every goal a finish line',
    description:
      'Turn progress into something visible with savings goals, contributions and monthly budgets.',
    accent:
      'bg-[#e3e9ed] text-[#466775]',
  },
]

const monthlyBars = [
  {
    income: 72,
    spending: 47,
    label: 'Jan',
  },
  {
    income: 82,
    spending: 58,
    label: 'Feb',
  },
  {
    income: 66,
    spending: 44,
    label: 'Mar',
  },
  {
    income: 91,
    spending: 62,
    label: 'Apr',
  },
  {
    income: 78,
    spending: 51,
    label: 'May',
  },
  {
    income: 95,
    spending: 67,
    label: 'Jun',
  },
]

function BrandLogo() {
  return (
    <img
      src={salifLogoDark}
      alt="Salif"
      className="h-auto w-28 sm:w-32"
    />
  )
}

function FinancePreview() {
  return (
    <div className="relative mx-auto w-full max-w-[560px] pb-10 sm:pb-12">
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#174f43] p-5 text-white shadow-[0_28px_80px_rgba(23,79,67,0.25)] sm:p-7">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-[#a9c9bc]">
              YOUR MONTH AT A GLANCE
            </p>

            <p className="mt-3 font-serif text-3xl sm:text-4xl">
              R13,430
            </p>

            <p className="mt-1 text-xs text-[#bcd9c5]">
              left after planned spending
            </p>
          </div>

          <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-[#deebe5]">
            September
          </span>
        </div>

        <div className="mt-8 rounded-2xl bg-white/[0.07] p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#a9c9bc]">
                Cash flow
              </p>

              <p className="mt-1 text-sm font-semibold">
                Six-month rhythm
              </p>
            </div>

            <ChartNoAxesCombined
              size={20}
              className="text-[#d8b56d]"
              aria-hidden
            />
          </div>

          <div className="mt-6 flex h-36 items-end justify-between gap-2 sm:gap-4">
            {monthlyBars.map((month) => (
              <div
                key={month.label}
                className="flex h-full min-w-0 flex-1 flex-col justify-end"
              >
                <div className="flex flex-1 items-end justify-center gap-1 sm:gap-1.5">
                  <span
                    className="w-2.5 rounded-t-full bg-[#8fc1a5] sm:w-3.5"
                    style={{
                      height: `${month.income}%`,
                    }}
                    title={`${month.label} income`}
                  />

                  <span
                    className="w-2.5 rounded-t-full bg-[#d8b56d] sm:w-3.5"
                    style={{
                      height: `${month.spending}%`,
                    }}
                    title={`${month.label} spending`}
                  />
                </div>

                <span className="mt-2 text-center text-[10px] text-[#9ebeb2]">
                  {month.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-5 border-t border-white/10 pt-4 text-[11px] text-[#bfd3cb]">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#8fc1a5]" />
              Money in
            </span>

            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#d8b56d]" />
              Money out
            </span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-3 right-3 rounded-2xl border border-[#dedbd2] bg-[#fffdf8] p-4 shadow-xl sm:left-auto sm:right-[-1rem] sm:w-[270px]">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e2eee7] text-[#276754]">
            <Target size={18} aria-hidden />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-[#173c32]">
                Emergency fund
              </p>

              <span className="text-xs font-semibold text-[#1F7A5C]">
                68%
              </span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e6e6df]">
              <div className="h-full w-[68%] rounded-full bg-[#7fa88e]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { status } = useAuth()

  const isAuthenticated =
    status === 'authenticated'

  const primaryDestination = isAuthenticated
    ? '/dashboard'
    : '/register'

  const primaryLabel = isAuthenticated
    ? 'Open dashboard'
    : 'Start with Salif'

  return (
    <div className="min-h-screen bg-[#f7f5ef] text-[#173c32]">
      <header className="border-b border-[#e1ded5] bg-[#f7f5ef]/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-[1240px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link
            to="/"
            aria-label="Salif home"
            className="cursor-pointer"
          >
            <BrandLogo />
          </Link>

          <nav
            className="hidden items-center gap-8 md:flex"
            aria-label="Home navigation"
          >
            <a
              href="#features"
              className="text-sm font-medium text-[#526b63] transition hover:text-[#173c32]"
            >
              Features
            </a>

            <a
              href="#how-it-helps"
              className="text-sm font-medium text-[#526b63] transition hover:text-[#173c32]"
            >
              How it helps
            </a>

            <a
              href="#security"
              className="text-sm font-medium text-[#526b63] transition hover:text-[#173c32]"
            >
              Security
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {!isAuthenticated && (
              <Link
                to="/login"
                className="hidden cursor-pointer px-3 py-2 text-sm font-semibold text-[#174f43] sm:inline-flex"
              >
                Sign in
              </Link>
            )}

            <Link
              to={primaryDestination}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#174f43] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#103d34]"
            >
              {primaryLabel}
              <ArrowRight
                size={16}
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div
            className="absolute -left-28 top-16 size-72 rounded-full bg-[#dfece4]/70 blur-3xl"
            aria-hidden
          />

          <div
            className="absolute -right-24 bottom-0 size-80 rounded-full bg-[#efe2bf]/45 blur-3xl"
            aria-hidden
          />

          <div className="relative mx-auto grid max-w-[1240px] gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-12 lg:py-24">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d8ddd6] bg-white/60 px-3 py-1.5 text-xs font-semibold text-[#46675d]">
                <BadgeCheck
                  size={15}
                  className="text-[#1F7A5C]"
                  aria-hidden
                />
                PERSONAL FINANCE, IN ORDER
              </div>

              <h1 className="mt-7 max-w-2xl font-serif text-5xl leading-[0.98] tracking-[-0.04em] text-[#173c32] sm:text-6xl lg:text-[4.7rem]">
                See your money clearly.{' '}
                <span className="text-[#1F7A5C]">
                  Save with purpose.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-7 text-[#5e716a] sm:text-lg sm:leading-8">
                Salif gives your accounts, spending,
                budgets and goals one calm place to make
                sense together.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={primaryDestination}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#174f43] px-6 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#103d34] hover:shadow-lg"
                >
                  {primaryLabel}
                  <ArrowRight
                    size={17}
                    aria-hidden
                  />
                </Link>

                {!isAuthenticated && (
                  <Link
                    to="/login"
                    className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#cfd5ce] bg-white/60 px-6 py-3.5 font-semibold text-[#174f43] transition hover:border-[#8fa99d] hover:bg-white"
                  >
                    I already have an account
                  </Link>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-[#657972]">
                <span className="flex items-center gap-2">
                  <Check
                    size={15}
                    className="text-[#1F7A5C]"
                    aria-hidden
                  />
                  No noisy spreadsheets
                </span>

                <span className="flex items-center gap-2">
                  <Check
                    size={15}
                    className="text-[#1F7A5C]"
                    aria-hidden
                  />
                  Built around your goals
                </span>
              </div>
            </div>

            <FinancePreview />
          </div>
        </section>

        <section
          id="features"
          className="border-y border-[#e1ded5] bg-[#fffdf8]"
        >
          <div className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-[#1F7A5C]">
                  A BETTER MONEY ROUTINE
                </p>

                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.03em] sm:text-5xl">
                  Less noise. More knowing.
                </h2>
              </div>

              <p className="max-w-2xl text-sm leading-7 text-[#657972] lg:justify-self-end lg:text-base">
                Salif is designed to help you understand
                today, prepare for what is coming and keep
                meaningful goals moving forward.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon

                return (
                  <article
                    key={feature.title}
                    className="group rounded-3xl border border-[#dedbd2] bg-[#f9f7f1] p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_45px_rgba(23,60,50,0.08)] sm:p-7"
                  >
                    <span
                      className={`grid size-11 place-items-center rounded-2xl ${feature.accent}`}
                    >
                      <Icon
                        size={21}
                        aria-hidden
                      />
                    </span>

                    <p className="mt-7 text-[11px] font-semibold tracking-[0.15em] text-[#657972]">
                      {feature.eyebrow}
                    </p>

                    <h3 className="mt-3 font-serif text-2xl">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-[#657972]">
                      {feature.description}
                    </p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section
          id="how-it-helps"
          className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28"
        >
          <div className="overflow-hidden rounded-[2rem] bg-[#e3ede6]">
            <div className="grid lg:grid-cols-2">
              <div className="p-7 sm:p-10 lg:p-14">
                <p className="text-xs font-semibold tracking-[0.16em] text-[#1F7A5C]">
                  FROM REACTIVE TO READY
                </p>

                <h2 className="mt-4 max-w-xl font-serif text-4xl leading-tight tracking-[-0.03em] sm:text-5xl">
                  Your money should not surprise you.
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-7 text-[#5d7169] sm:text-base">
                  Separate overdue payments from what is
                  coming up, follow your monthly cash flow
                  and see how today’s decisions affect your
                  goals.
                </p>

                <Link
                  to={primaryDestination}
                  className="mt-8 inline-flex cursor-pointer items-center gap-2 font-semibold text-[#174f43] hover:underline"
                >
                  Build your financial picture
                  <ArrowRight
                    size={17}
                    aria-hidden
                  />
                </Link>
              </div>

              <div className="bg-[#174f43] p-7 text-white sm:p-10 lg:p-12">
                <p className="text-xs font-semibold tracking-[0.15em] text-[#a9c9bc]">
                  THIS WEEK
                </p>

                <div className="mt-7 space-y-3">
                  <div className="rounded-2xl bg-white/[0.08] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">
                          Rent
                        </p>

                        <p className="mt-1 text-xs text-[#bcd9c5]">
                          Due tomorrow
                        </p>
                      </div>

                      <p className="font-serif text-xl">
                        R8,500
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/[0.08] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">
                          Monthly budget
                        </p>

                        <p className="mt-1 text-xs text-[#bcd9c5]">
                          64% used
                        </p>
                      </div>

                      <span className="rounded-full bg-[#d8b56d]/20 px-3 py-1 text-xs font-semibold text-[#f0d699]">
                        On track
                      </span>
                    </div>

                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-[64%] rounded-full bg-[#d8b56d]" />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/[0.08] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">
                          Travel goal
                        </p>

                        <p className="mt-1 text-xs text-[#bcd9c5]">
                          R1,200 added this month
                        </p>
                      </div>

                      <span className="grid size-9 place-items-center rounded-full bg-[#bcd9c5] text-[#174f43]">
                        <Target
                          size={17}
                          aria-hidden
                        />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="security"
          className="border-y border-[#e1ded5] bg-[#fffdf8]"
        >
          <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-12 lg:py-24">
            <div className="relative mx-auto grid size-56 place-items-center rounded-full bg-[#e5f0ea] sm:size-64">
              <div className="grid size-36 place-items-center rounded-full border border-[#a9cbb9] bg-[#f7fbf8] text-[#1F7A5C] shadow-sm sm:size-40">
                <ShieldCheck
                  size={62}
                  strokeWidth={1.4}
                  aria-hidden
                />
              </div>

              <span className="absolute right-3 top-7 grid size-11 place-items-center rounded-full bg-[#174f43] text-white shadow-lg">
                <LockKeyhole
                  size={19}
                  aria-hidden
                />
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-[#1F7A5C]">
                SECURITY THAT STAYS VISIBLE
              </p>

              <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.03em] sm:text-5xl">
                Your financial information deserves more
                than a password.
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#657972] sm:text-base">
                Salif combines verified email changes,
                protected sessions and optional two-factor
                authentication to keep account access in
                your hands.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  'Two-factor authentication',
                  'Recovery codes',
                  'Verified email changes',
                  'Session revocation',
                ].map((item) => (
                  <p
                    key={item}
                    className="flex items-center gap-3 text-sm font-medium text-[#405d54]"
                  >
                    <span className="grid size-6 place-items-center rounded-full bg-[#e1ede5] text-[#1F7A5C]">
                      <Check
                        size={14}
                        aria-hidden
                      />
                    </span>
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-[1060px] rounded-[2rem] bg-[#173c32] px-6 py-14 text-center text-white shadow-[0_24px_70px_rgba(23,60,50,0.18)] sm:px-12 sm:py-16">
            <p className="text-xs font-semibold tracking-[0.16em] text-[#a9c9bc]">
              START WITH WHAT YOU HAVE
            </p>

            <h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">
              Give your money a calmer place to make sense.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#c5d7d0]">
              Build a clearer view of your finances one
              account, budget and goal at a time.
            </p>

            <Link
              to={primaryDestination}
              className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#f7f3e9] px-6 py-3.5 font-semibold text-[#174f43] transition hover:-translate-y-0.5 hover:bg-white"
            >
              {primaryLabel}
              <ArrowRight
                size={17}
                aria-hidden
              />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#dedbd2] bg-[#f0eee7]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-5 px-5 py-8 text-sm text-[#657972] sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <div>
            <BrandLogo />

            <p className="mt-1 text-xs">
              See it. Save it.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link
              to="/login"
              className="cursor-pointer hover:text-[#173c32]"
            >
              Sign in
            </Link>

            <Link
              to="/register"
              className="cursor-pointer hover:text-[#173c32]"
            >
              Create account
            </Link>

            <a
              href="#security"
              className="cursor-pointer hover:text-[#173c32]"
            >
              Security
            </a>
          </div>

          <p className="text-xs">
            © {new Date().getFullYear()} Salif
          </p>
        </div>
      </footer>
    </div>
  )
}