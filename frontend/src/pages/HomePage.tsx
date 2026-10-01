import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  ChartNoAxesCombined,
  Check,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Target,
  WalletCards,
} from 'lucide-react'

import { Link } from 'react-router'

import ScrollReveal from '@/components/motion/ScrollReveal'
import { useAuth } from '@/features/auth/context/useAuth'
import PublicNavbar from '@/components/layout/PublicNavbar'
import PublicFooter from '@/components/layout/PublicFooter'


const features = [
  {
    icon: WalletCards,
    eyebrow: 'ONE CLEAR VIEW',
    title: 'Know what you have',
    description:
      'Bring your accounts and everyday transactions together without losing sight of the details.',
    accent:
      'bg-accent-soft text-accent',
  },
  {
    icon: CalendarClock,
    eyebrow: 'PLAN AHEAD',
    title: 'See what comes next',
    description:
      'Keep recurring payments, overdue commitments and upcoming expenses where you can act on them.',
    accent:
      'bg-warning-soft text-warning',
  },
  {
    icon: Target,
    eyebrow: 'SAVE WITH PURPOSE',
    title: 'Give every goal a finish line',
    description:
      'Turn progress into something visible with savings goals, contributions and monthly budgets.',
    accent:
      'bg-success-soft text-success',
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


function FinancePreview() {
  return (
    <div className="home-hero-enter home-hero-enter-delay-2 relative mx-auto w-full max-w-[500px] pb-10 sm:pb-12">
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d4f3f] p-5 text-white shadow-[0_30px_90px_rgba(13,79,63,0.24)] sm:p-6">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-[#a9d0c1]">
              YOUR MONTH AT A GLANCE
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              R13,430
            </p>

            <p className="mt-1 text-sm text-[#bad8cd]">
              left after planned spending
            </p>
          </div>

          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#ecf6f2]">
            September
          </span>
        </div>

        <div className="mt-7 rounded-2xl border border-white/[0.06] bg-white/[0.07] p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#a9d0c1]">
                Cash flow
              </p>

              <p className="mt-1 text-sm font-semibold">
                Six-month rhythm
              </p>
            </div>

            <span className="grid size-10 place-items-center rounded-xl bg-[#d7a84d]/15 text-[#e4bd70]">
              <ChartNoAxesCombined
                size={20}
                aria-hidden
              />
            </span>
          </div>

          <div className="mt-6 flex h-32 items-end justify-between gap-2 sm:gap-3">
            {monthlyBars.map(
              (
                month,
                index,
              ) => (
                <div
                  key={month.label}
                  className="flex h-full min-w-0 flex-1 flex-col justify-end"
                >
                  <div className="flex flex-1 items-end justify-center gap-1 sm:gap-1.5">
                    <span
                      className="home-chart-bar w-2.5 rounded-t-full bg-[#77bea0] sm:w-3"
                      style={{
                        height: `${month.income}%`,
                        animationDelay: `${300 +
                          index * 55
                          }ms`,
                      }}
                    />

                    <span
                      className="home-chart-bar w-2.5 rounded-t-full bg-[#e0ad51] sm:w-3"
                      style={{
                        height: `${month.spending}%`,
                        animationDelay: `${350 +
                          index * 55
                          }ms`,
                      }}
                    />
                  </div>

                  <span className="mt-2 text-center text-[10px] text-[#a8c9bd]">
                    {month.label}
                  </span>
                </div>
              ),
            )}
          </div>

          <div className="mt-4 flex gap-5 border-t border-white/10 pt-4 text-xs text-[#c5ddd4]">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#77bea0]" />
              Money in
            </span>

            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#e0ad51]" />
              Money out
            </span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-3 right-3 rounded-2xl border border-line bg-surface p-4 shadow-[var(--salif-shadow-card)] sm:left-auto sm:right-[-0.75rem] sm:w-[270px]">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
            <Target
              size={18}
              aria-hidden
            />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-ink">
                Emergency fund
              </p>

              <span className="text-xs font-bold text-accent">
                68%
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-strong">
              <div className="home-progress-bar h-full w-[68%] rounded-full bg-accent" />
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

  const primaryDestination =
    isAuthenticated
      ? '/dashboard'
      : '/register'

  const primaryLabel =
    isAuthenticated
      ? 'Open dashboard'
      : 'Start with Salif'

  return (
    <div className="relative min-h-screen overflow-x-clip bg-app text-ink">
      {/* Shared navbar + hero atmosphere */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[720px] overflow-hidden"
        aria-hidden
      >
        {/* soft brand washes */}
        <div className="absolute -left-40 -top-40 size-[34rem] rounded-full bg-accent-soft/75 blur-[120px]" />

        <div className="absolute -right-44 -top-28 size-[30rem] rounded-full bg-warning-soft/45 blur-[120px]" />

        {/* subtle grid */}
        <div className="absolute inset-0 opacity-[0.26] [background-image:linear-gradient(to_right,var(--salif-color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--salif-color-border)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:linear-gradient(to_bottom,black_0%,rgba(0,0,0,0.68)_60%,transparent_100%)]" />

        {/* architectural circles */}
        <div className="absolute left-[7%] top-24 h-[380px] w-[380px] rounded-full border border-line/50" />

        <div className="absolute left-[7%] top-24 h-[285px] w-[285px] translate-x-[47px] translate-y-[47px] rounded-full border border-line/35" />

        {/* angled detail */}
        <div className="absolute right-[9%] top-32 h-px w-44 rotate-[-12deg] bg-line" />

        <div className="absolute right-[7%] top-44 h-px w-28 rotate-[-12deg] bg-line/70" />
      </div>

      <PublicNavbar />

      <main>
        {/* HERO */}

        <section className="relative z-10">
          <div className="mx-auto grid max-w-[1240px] gap-12 px-5 pb-20 pt-14 sm:px-8 sm:pb-24 sm:pt-18 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-12 lg:pb-28 lg:pt-20">
            <div>
              <div className="home-hero-enter inline-flex items-center gap-2 rounded-full border border-line bg-surface/55 px-3.5 py-2 text-xs font-bold tracking-[0.07em] text-muted shadow-sm backdrop-blur-sm">
                <BadgeCheck
                  size={16}
                  className="text-accent"
                  aria-hidden
                />

                PERSONAL FINANCE, IN ORDER
              </div>

              <h1 className="home-hero-enter home-hero-enter-delay-1 mt-7 max-w-2xl text-5xl font-bold leading-[0.98] tracking-[-0.05em] text-ink sm:text-6xl lg:text-[4.5rem]">
                See your money clearly.

                <span className="block text-accent">
                  Save with purpose.
                </span>
              </h1>

              <div className="home-hero-enter home-hero-enter-delay-2">
                <p className="mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg">
                  Accounts, spending, budgets and goals — together in one clear view.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to={primaryDestination}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-inverse shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover"
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
                      className="inline-flex items-center justify-center rounded-full border border-line-strong bg-surface/55 px-6 py-3.5 font-semibold text-ink backdrop-blur-sm transition hover:border-accent hover:bg-surface"
                    >
                      Sign in
                    </Link>
                  )}
                </div>

                <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-muted">
                  <span className="flex items-center gap-2">
                    <Check
                      size={16}
                      className="text-accent"
                      aria-hidden
                    />

                    No noisy spreadsheets
                  </span>

                  <span className="flex items-center gap-2">
                    <Check
                      size={16}
                      className="text-accent"
                      aria-hidden
                    />

                    Built around your goals
                  </span>
                </div>
              </div>
            </div>

            <FinancePreview />
          </div>
        </section>

        {/* VALUE STRIP */}

        <section className="border-y border-white/10 bg-[#0d4f3f] text-white">
          <div className="mx-auto grid max-w-[1240px] gap-5 px-5 py-5 text-center sm:grid-cols-3 sm:px-8 lg:px-12">
            {[
              [
                'One view',
                'Accounts, balances and activity',
              ],
              [
                'One plan',
                'Budgets, recurring costs and goals',
              ],
              [
                'Your control',
                'Protected access and sessions',
              ],
            ].map(
              (
                [
                  title,
                  description,
                ],
                index,
              ) => (
                <div
                  key={title}
                  className={`py-2 ${index > 0
                    ? 'border-t border-white/10 pt-5 sm:border-l sm:border-t-0 sm:pt-2'
                    : ''
                    }`}
                >
                  <p className="text-lg font-semibold text-white">
                    {title}
                  </p>

                  <p className="mt-1 text-xs text-[#acd0c2]">
                    {description}
                  </p>
                </div>
              ),
            )}
          </div>
        </section>

        {/* FEATURES */}

        <section
          id="features"
          className="home-anchor border-b border-line bg-surface"
        >
          <ScrollReveal className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-accent">
                  A BETTER MONEY ROUTINE
                </p>

                <h2 className="mt-4 text-4xl font-bold leading-tight tracking-[-0.04em] text-ink sm:text-5xl">
                  Less noise. More knowing.
                </h2>
              </div>

              <p className="max-w-2xl text-base leading-7 text-muted lg:justify-self-end">
                Understand today, prepare
                for what is coming, and
                keep meaningful goals
                moving without piecing
                your finances together
                across separate tools.
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {features.map(
                (
                  feature,
                  index,
                ) => {
                  const Icon =
                    feature.icon

                  return (
                    <ScrollReveal
                      key={
                        feature.title
                      }
                      delay={
                        index * 85
                      }
                    >
                      <article className="group h-full rounded-3xl border border-line bg-app p-6 transition-[transform,border-color,background-color,box-shadow] duration-300 hover:-translate-y-1.5 hover:border-line-strong hover:bg-surface hover:shadow-[var(--salif-shadow-card)] sm:p-7">
                        <span
                          className={`grid size-12 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-105 ${feature.accent}`}
                        >
                          <Icon
                            size={22}
                            aria-hidden
                          />
                        </span>

                        <p className="mt-7 text-xs font-bold tracking-[0.13em] text-subtle">
                          {
                            feature.eyebrow
                          }
                        </p>

                        <h3 className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-ink">
                          {
                            feature.title
                          }
                        </h3>

                        <p className="mt-3 text-base leading-7 text-muted">
                          {
                            feature.description
                          }
                        </p>
                      </article>
                    </ScrollReveal>
                  )
                },
              )}
            </div>
          </ScrollReveal>
        </section>

        {/* HOW IT HELPS */}

        <section
          id="how-it-helps"
          className="home-anchor bg-app"
        >
          <ScrollReveal className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
            <div className="overflow-hidden rounded-[2rem] border border-line bg-surface shadow-[var(--salif-shadow-card)]">
              <div className="grid lg:grid-cols-2">
                <div className="p-7 sm:p-10 lg:p-14">
                  <p className="text-xs font-bold tracking-[0.16em] text-accent">
                    FROM REACTIVE TO READY
                  </p>

                  <h2 className="mt-4 max-w-xl text-4xl font-bold leading-tight tracking-[-0.04em] text-ink sm:text-5xl">
                    Your money should not
                    surprise you.
                  </h2>

                  <p className="mt-5 max-w-xl text-base leading-7 text-muted">
                    Separate overdue
                    payments from what is
                    coming up, follow your
                    monthly cash flow, and
                    see how today’s
                    decisions affect your
                    goals.
                  </p>

                  <Link
                    to={
                      primaryDestination
                    }
                    className="group mt-8 inline-flex items-center gap-2 font-semibold text-primary"
                  >
                    Build your financial
                    picture

                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </Link>
                </div>

                <div className="relative overflow-hidden bg-[#0d4f3f] p-7 text-white sm:p-10 lg:p-12">
                  <div
                    className="absolute -right-20 -top-20 size-56 rounded-full bg-[#d7a84d]/12 blur-2xl"
                    aria-hidden
                  />

                  <div className="relative">
                    <p className="text-xs font-bold tracking-[0.15em] text-[#a9d0c1]">
                      THIS WEEK
                    </p>

                    <div className="mt-7 space-y-3">
                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.08] p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold">
                              Rent
                            </p>

                            <p className="mt-1 text-xs text-[#b9d6cb]">
                              Due tomorrow
                            </p>
                          </div>

                          <p className="text-xl font-semibold">
                            R8,500
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.08] p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold">
                              Monthly budget
                            </p>

                            <p className="mt-1 text-xs text-[#b9d6cb]">
                              64% used
                            </p>
                          </div>

                          <span className="rounded-full bg-[#d7a84d]/20 px-3 py-1 text-xs font-semibold text-[#f0cf8d]">
                            On track
                          </span>
                        </div>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                          <div className="home-progress-bar h-full w-[64%] rounded-full bg-[#e0ad51]" />
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.08] p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold">
                              Travel goal
                            </p>

                            <p className="mt-1 text-xs text-[#b9d6cb]">
                              R1,200 added this
                              month
                            </p>
                          </div>

                          <span className="grid size-10 place-items-center rounded-full bg-[#b9ddca] text-[#0d4f3f]">
                            <Target
                              size={18}
                              aria-hidden
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* SECURITY */}

        <section
          id="security"
          className="home-anchor border-y border-line bg-surface"
        >
          <ScrollReveal className="mx-auto grid max-w-[1240px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-12 lg:py-24">
            <div className="relative mx-auto grid size-56 place-items-center rounded-full bg-accent-soft sm:size-64">
              <div
                className="absolute inset-3 rounded-full border border-dashed border-line-strong motion-safe:animate-[spin_28s_linear_infinite]"
                aria-hidden
              />

              <div className="grid size-36 place-items-center rounded-full border border-line bg-surface text-accent shadow-[var(--salif-shadow-card)] sm:size-40">
                <ShieldCheck
                  size={62}
                  strokeWidth={1.4}
                  aria-hidden
                />
              </div>

              <span className="absolute right-3 top-7 grid size-11 place-items-center rounded-full bg-primary text-inverse shadow-lg">
                <LockKeyhole
                  size={19}
                  aria-hidden
                />
              </span>
            </div>

            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-accent">
                SECURITY THAT STAYS VISIBLE
              </p>

              <h2 className="mt-4 text-4xl font-bold leading-tight tracking-[-0.04em] text-ink sm:text-5xl">
                Your financial information
                deserves more than a
                password.
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
                Salif combines verified
                email changes, protected
                sessions, and optional
                two-factor authentication
                to keep account access in
                your hands.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  'Two-factor authentication',
                  'Recovery codes',
                  'Verified email changes',
                  'Session revocation',
                ].map(
                  (item) => (
                    <p
                      key={item}
                      className="flex items-center gap-3 text-sm font-semibold text-ink"
                    >
                      <span className="grid size-7 place-items-center rounded-full bg-success-soft text-success">
                        <Check
                          size={15}
                          aria-hidden
                        />
                      </span>

                      {item}
                    </p>
                  ),
                )}
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* CTA */}

        <section className="bg-app px-5 py-20 sm:px-8 lg:py-28">
          <ScrollReveal className="mx-auto max-w-[1080px]">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#103b30] px-6 py-14 text-center text-white shadow-[0_26px_75px_rgba(13,79,63,0.20)] sm:px-12 sm:py-16">
              <div
                className="absolute -left-20 -top-24 size-64 rounded-full bg-[#16805f]/35 blur-3xl"
                aria-hidden
              />

              <div
                className="absolute -bottom-28 -right-16 size-64 rounded-full bg-[#d7a84d]/25 blur-3xl"
                aria-hidden
              />

              <div className="relative">
                <span className="mx-auto grid size-11 place-items-center rounded-2xl bg-white/10 text-[#e6bf74]">
                  <Sparkles
                    size={20}
                    aria-hidden
                  />
                </span>

                <p className="mt-5 text-xs font-bold tracking-[0.16em] text-[#a9d0c1]">
                  START WITH WHAT YOU HAVE
                </p>

                <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">
                  Give your money a clearer
                  place to make sense.
                </h2>

                <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#c5ddd4]">
                  Build a confident view of
                  your finances one account,
                  budget, and goal at a time.
                </p>

                <Link
                  to={
                    primaryDestination
                  }
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-[#0d4f3f] transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {primaryLabel}

                  <ArrowRight
                    size={17}
                    aria-hidden
                  />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>

      {/* FOOTER */}

      <PublicFooter />
    </div>
  )
}