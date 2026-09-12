import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  ChartNoAxesCombined,
  Check,
  LockKeyhole,
  Menu,
  ShieldCheck,
  Sparkles,
  Target,
  WalletCards,
  X,
} from 'lucide-react'
import {
  useEffect,
  useState,
} from 'react'
import { Link } from 'react-router'

import salifLogoGreen from '../assets/brand/salif-logo-green.svg'
import salifLogoLight from '../assets/brand/salif-logo-light.svg'
import ScrollReveal from '../components/motion/ScrollReveal'
import { useAuth } from '../features/auth/context/useAuth'

const features = [
  {
    icon: WalletCards,
    eyebrow: 'ONE CLEAR VIEW',
    title: 'Know what you have',
    description:
      'Bring your accounts and everyday transactions together without losing sight of the details.',
    accent: 'bg-[#d8eadf] text-[#146047]',
    border: 'group-hover:border-[#8fbea7]',
  },
  {
    icon: CalendarClock,
    eyebrow: 'PLAN AHEAD',
    title: 'See what comes next',
    description:
      'Keep recurring payments, overdue commitments and upcoming expenses where you can act on them.',
    accent: 'bg-[#f1dfb8] text-[#865b13]',
    border: 'group-hover:border-[#d7b36b]',
  },
  {
    icon: Target,
    eyebrow: 'SAVE WITH PURPOSE',
    title: 'Give every goal a finish line',
    description:
      'Turn progress into something visible with savings goals, contributions and monthly budgets.',
    accent: 'bg-[#dce8eb] text-[#356474]',
    border: 'group-hover:border-[#8fb3be]',
  },
]

const monthlyBars = [
  { income: 72, spending: 47, label: 'Jan' },
  { income: 82, spending: 58, label: 'Feb' },
  { income: 66, spending: 44, label: 'Mar' },
  { income: 91, spending: 62, label: 'Apr' },
  { income: 78, spending: 51, label: 'May' },
  { income: 95, spending: 67, label: 'Jun' },
]

interface BrandLogoProps {
  compact?: boolean
  light?: boolean
}

function BrandLogo({
  compact = false,
  light = false,
}: BrandLogoProps) {
  return (
    <img
      src={
        light
          ? salifLogoLight
          : salifLogoGreen
      }
      alt="Salif"
      className={`h-auto transition-[width] duration-300 motion-reduce:transition-none ${
        compact
          ? 'w-23 sm:w-25'
          : 'w-27 sm:w-31'
      }`}
    />
  )
}

function FinancePreview() {
  return (
    <div className="home-hero-enter home-hero-enter-delay-2 relative mx-auto w-full max-w-[570px] pb-10 sm:pb-12">
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d4f3f] p-5 text-white shadow-[0_30px_90px_rgba(13,79,63,0.28)] sm:p-7">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-[#a9d0c1]">
              YOUR MONTH AT A GLANCE
            </p>

            <p className="mt-3 font-serif text-3xl sm:text-4xl">
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

        <div className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.07] p-4 sm:p-5">
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

          <div className="mt-6 flex h-36 items-end justify-between gap-2 sm:gap-4">
            {monthlyBars.map(
              (month, index) => (
                <div
                  key={month.label}
                  className="flex h-full min-w-0 flex-1 flex-col justify-end"
                >
                  <div className="flex flex-1 items-end justify-center gap-1 sm:gap-1.5">
                    <span
                      className="home-chart-bar w-2.5 rounded-t-full bg-[#77bea0] sm:w-3.5"
                      style={{
                        height: `${month.income}%`,
                        animationDelay:
                          `${300 + index * 55}ms`,
                      }}
                      title={`${month.label} income`}
                    />

                    <span
                      className="home-chart-bar w-2.5 rounded-t-full bg-[#e0ad51] sm:w-3.5"
                      style={{
                        height: `${month.spending}%`,
                        animationDelay:
                          `${350 + index * 55}ms`,
                      }}
                      title={`${month.label} spending`}
                    />
                  </div>

                  <span className="mt-2 text-center text-[11px] text-[#a8c9bd]">
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

      <div className="absolute bottom-0 left-3 right-3 rounded-2xl border border-[#d6d2c8] bg-[#fffefb] p-4 shadow-[0_18px_45px_rgba(13,79,63,0.16)] sm:left-auto sm:right-[-1rem] sm:w-[282px]">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#d8eadf] text-[#146047]">
            <Target
              size={18}
              aria-hidden
            />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-[#123e33]">
                Emergency fund
              </p>

              <span className="text-xs font-bold text-[#167457]">
                68%
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e5e4dd]">
              <div className="home-progress-bar h-full w-[68%] rounded-full bg-[#26906c]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { status } = useAuth()

  const [isCompact, setIsCompact] =
    useState(false)

  const [isMenuOpen, setIsMenuOpen] =
    useState(false)

  useEffect(() => {
    function updateHeader() {
      setIsCompact(
        window.scrollY > 32,
      )
    }

    updateHeader()

    window.addEventListener(
      'scroll',
      updateHeader,
      { passive: true },
    )

    return () =>
      window.removeEventListener(
        'scroll',
        updateHeader,
      )
  }, [])

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
    <div className="min-h-screen overflow-x-clip bg-[#f4f1e8] text-[#123e33]">
      <header
        className={`sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300 motion-reduce:transition-none ${
          isCompact
            ? 'border-[#d5d0c4] bg-[#fffdf8]/97 shadow-[0_8px_28px_rgba(18,62,51,0.08)]'
            : 'border-transparent bg-[#f4f1e8]/92'
        } backdrop-blur-xl`}
      >
        <div
          className={`mx-auto flex max-w-[1240px] items-center justify-between px-5 transition-[height] duration-300 motion-reduce:transition-none sm:px-8 lg:px-12 ${
            isCompact
              ? 'h-15'
              : 'h-20'
          }`}
        >
          <Link
            to="/"
            aria-label="Salif home"
            className="cursor-pointer"
          >
            <BrandLogo
              compact={isCompact}
            />
          </Link>

          <nav
            className="hidden items-center gap-8 md:flex"
            aria-label="Home navigation"
          >
            {[
              [
                'Features',
                '#features',
              ],
              [
                'How it helps',
                '#how-it-helps',
              ],
              [
                'Security',
                '#security',
              ],
            ].map(
              ([label, href]) => (
                <a
                  key={href}
                  href={href}
                  className="relative py-2 text-sm font-semibold text-[#47645a] transition hover:text-[#0d4f3f] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-[#d09b3c] after:transition-transform hover:after:scale-x-100"
                >
                  {label}
                </a>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {!isAuthenticated && (
              <Link
                to="/login"
                className="hidden cursor-pointer px-3 py-2 text-sm font-semibold text-[#0d4f3f] transition hover:text-[#16805f] sm:inline-flex"
              >
                Sign in
              </Link>
            )}

            <Link
              to={
                primaryDestination
              }
              className={`hidden cursor-pointer items-center gap-2 rounded-full bg-[#0d4f3f] text-sm font-semibold text-white shadow-sm transition-[padding,background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-[#146b52] sm:inline-flex ${
                isCompact
                  ? 'px-4 py-2'
                  : 'px-5 py-2.5'
              }`}
            >
              {primaryLabel}

              <ArrowRight
                size={16}
                aria-hidden
              />
            </Link>

            <button
              type="button"
              onClick={() =>
                setIsMenuOpen(
                  (open) => !open,
                )
              }
              className="grid size-10 cursor-pointer place-items-center rounded-full border border-[#cfcbc0] bg-white/60 text-[#123e33] transition hover:border-[#96ac9f] hover:bg-white md:hidden"
              aria-label={
                isMenuOpen
                  ? 'Close navigation'
                  : 'Open navigation'
              }
              aria-expanded={
                isMenuOpen
              }
              aria-controls="home-mobile-navigation"
            >
              {isMenuOpen ? (
                <X
                  size={20}
                  aria-hidden
                />
              ) : (
                <Menu
                  size={20}
                  aria-hidden
                />
              )}
            </button>
          </div>
        </div>

        <div
          id="home-mobile-navigation"
          className={`grid border-t border-[#ded9cd] bg-[#fffdf8] transition-[grid-template-rows,opacity] duration-300 md:hidden ${
            isMenuOpen
              ? 'grid-rows-[1fr] opacity-100'
              : 'pointer-events-none grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <nav
              className="mx-auto flex max-w-[1240px] flex-col gap-1 px-5 py-4"
              aria-label="Mobile home navigation"
            >
              {[
                [
                  'Features',
                  '#features',
                ],
                [
                  'How it helps',
                  '#how-it-helps',
                ],
                [
                  'Security',
                  '#security',
                ],
              ].map(
                ([label, href]) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() =>
                      setIsMenuOpen(
                        false,
                      )
                    }
                    className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#36584d] transition hover:bg-[#e5eee8] hover:text-[#0d4f3f]"
                  >
                    {label}
                  </a>
                ),
              )}

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#e5e1d7] pt-4">
                {!isAuthenticated && (
                  <Link
                    to="/login"
                    onClick={() =>
                      setIsMenuOpen(
                        false,
                      )
                    }
                    className="inline-flex items-center justify-center rounded-full border border-[#cfcabe] px-4 py-2.5 text-sm font-semibold text-[#0d4f3f]"
                  >
                    Sign in
                  </Link>
                )}

                <Link
                  to={
                    primaryDestination
                  }
                  onClick={() =>
                    setIsMenuOpen(
                      false,
                    )
                  }
                  className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#0d4f3f] px-4 py-2.5 text-sm font-semibold text-white ${
                    isAuthenticated
                      ? 'col-span-2'
                      : ''
                  }`}
                >
                  {primaryLabel}

                  <ArrowRight
                    size={15}
                    aria-hidden
                  />
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div
            className="absolute -left-32 top-12 size-80 rounded-full bg-[#b9ddca]/55 blur-3xl"
            aria-hidden
          />

          <div
            className="absolute -right-28 bottom-0 size-96 rounded-full bg-[#e7c77e]/35 blur-3xl"
            aria-hidden
          />

          <div className="relative mx-auto grid max-w-[1240px] gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.94fr_1.06fr] lg:items-center lg:px-12 lg:py-24">
            <div>
              <div className="home-hero-enter inline-flex items-center gap-2 rounded-full border border-[#bdcfc5] bg-white/70 px-3.5 py-2 text-xs font-bold tracking-[0.07em] text-[#315d4f] shadow-sm">
                <BadgeCheck
                  size={16}
                  className="text-[#16805f]"
                  aria-hidden
                />

                PERSONAL FINANCE, IN ORDER
              </div>

              <h1 className="home-hero-enter home-hero-enter-delay-1 mt-7 max-w-2xl font-serif text-5xl leading-[0.98] tracking-[-0.045em] text-[#103b30] sm:text-6xl lg:text-[4.75rem]">
                See your money clearly.{' '}

                <span className="text-[#16805f]">
                  Save with purpose.
                </span>
              </h1>

              <div className="home-hero-enter home-hero-enter-delay-2">
                <p className="mt-7 max-w-xl text-base leading-7 text-[#4f6a60] sm:text-lg sm:leading-8">
                  Salif brings your
                  accounts, spending,
                  budgets and goals into
                  one confident view—so
                  every decision has
                  context.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to={
                      primaryDestination
                    }
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0d4f3f] px-6 py-3.5 font-semibold text-white shadow-[0_12px_28px_rgba(13,79,63,0.18)] transition hover:-translate-y-0.5 hover:bg-[#146b52] hover:shadow-[0_16px_34px_rgba(13,79,63,0.24)]"
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
                      className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#bfc9c2] bg-white/65 px-6 py-3.5 font-semibold text-[#0d4f3f] transition hover:border-[#78a28e] hover:bg-white"
                    >
                      I already have an
                      account
                    </Link>
                  )}
                </div>

                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-[#587068]">
                  <span className="flex items-center gap-2">
                    <Check
                      size={16}
                      className="text-[#16805f]"
                      aria-hidden
                    />

                    No noisy spreadsheets
                  </span>

                  <span className="flex items-center gap-2">
                    <Check
                      size={16}
                      className="text-[#16805f]"
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

        <section className="border-y border-[#d9d4c8] bg-[#0d4f3f] text-white">
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
                  className={`py-2 ${
                    index > 0
                      ? 'border-t border-white/10 pt-5 sm:border-l sm:border-t-0 sm:pt-2'
                      : ''
                  }`}
                >
                  <p className="font-serif text-xl text-[#f6f1e5]">
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

        <section
          id="features"
          className="home-anchor border-b border-[#ded9cd] bg-[#fffdf8]"
        >
          <ScrollReveal className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-[#16805f]">
                  A BETTER MONEY ROUTINE
                </p>

                <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.035em] text-[#103b30] sm:text-5xl">
                  Less noise. More knowing.
                </h2>
              </div>

              <p className="max-w-2xl text-base leading-7 text-[#536d63] lg:justify-self-end">
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
                      <article
                        className={`group h-full rounded-3xl border border-[#dcd7cc] bg-[#f7f4ec] p-6 transition-[transform,border-color,background-color,box-shadow] duration-300 hover:-translate-y-1.5 hover:bg-white hover:shadow-[0_20px_48px_rgba(18,62,51,0.10)] sm:p-7 ${feature.border}`}
                      >
                        <span
                          className={`grid size-12 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-105 ${feature.accent}`}
                        >
                          <Icon
                            size={22}
                            aria-hidden
                          />
                        </span>

                        <p className="mt-7 text-xs font-bold tracking-[0.13em] text-[#64786f]">
                          {
                            feature.eyebrow
                          }
                        </p>

                        <h3 className="mt-3 font-serif text-2xl text-[#123e33]">
                          {
                            feature.title
                          }
                        </h3>

                        <p className="mt-3 text-base leading-7 text-[#5a7068]">
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

        <section
          id="how-it-helps"
          className="home-anchor mx-auto max-w-[1240px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28"
        >
          <ScrollReveal>
            <div className="overflow-hidden rounded-[2rem] border border-[#cfd8d1] bg-[#dcebe2] shadow-[0_20px_55px_rgba(18,62,51,0.08)]">
              <div className="grid lg:grid-cols-2">
                <div className="p-7 sm:p-10 lg:p-14">
                  <p className="text-xs font-bold tracking-[0.16em] text-[#146b52]">
                    FROM REACTIVE TO READY
                  </p>

                  <h2 className="mt-4 max-w-xl font-serif text-4xl leading-tight tracking-[-0.035em] text-[#103b30] sm:text-5xl">
                    Your money should not
                    surprise you.
                  </h2>

                  <p className="mt-5 max-w-xl text-base leading-7 text-[#47675b]">
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
                    className="group mt-8 inline-flex cursor-pointer items-center gap-2 font-semibold text-[#0d4f3f]"
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
                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.08] p-4 transition hover:bg-white/[0.11]">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold">
                              Rent
                            </p>

                            <p className="mt-1 text-xs text-[#b9d6cb]">
                              Due tomorrow
                            </p>
                          </div>

                          <p className="font-serif text-xl">
                            R8,500
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.08] p-4 transition hover:bg-white/[0.11]">
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

                      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.08] p-4 transition hover:bg-white/[0.11]">
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

        <section
          id="security"
          className="home-anchor border-y border-[#d9d4c8] bg-[#fffdf8]"
        >
          <ScrollReveal className="mx-auto grid max-w-[1240px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-12 lg:py-24">
            <div className="relative mx-auto grid size-56 place-items-center rounded-full bg-[#d8eadf] sm:size-64">
              <div
                className="absolute inset-3 rounded-full border border-dashed border-[#78aa93] motion-safe:animate-[spin_28s_linear_infinite]"
                aria-hidden
              />

              <div className="grid size-36 place-items-center rounded-full border border-[#8fbea7] bg-[#f8fcf9] text-[#16805f] shadow-[0_14px_35px_rgba(13,79,63,0.12)] sm:size-40">
                <ShieldCheck
                  size={62}
                  strokeWidth={1.4}
                  aria-hidden
                />
              </div>

              <span className="absolute right-3 top-7 grid size-11 place-items-center rounded-full bg-[#0d4f3f] text-white shadow-lg">
                <LockKeyhole
                  size={19}
                  aria-hidden
                />
              </span>
            </div>

            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-[#16805f]">
                SECURITY THAT STAYS VISIBLE
              </p>

              <h2 className="mt-4 font-serif text-4xl leading-tight tracking-[-0.035em] text-[#103b30] sm:text-5xl">
                Your financial information
                deserves more than a
                password.
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-[#536d63]">
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
                ].map((item) => (
                  <p
                    key={item}
                    className="flex items-center gap-3 text-sm font-semibold text-[#36584d]"
                  >
                    <span className="grid size-7 place-items-center rounded-full bg-[#d8eadf] text-[#16805f]">
                      <Check
                        size={15}
                        aria-hidden
                      />
                    </span>

                    {item}
                  </p>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>

        <section className="px-5 py-20 sm:px-8 lg:py-28">
          <ScrollReveal className="mx-auto max-w-[1080px]">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#103b30] px-6 py-14 text-center text-white shadow-[0_26px_75px_rgba(13,79,63,0.22)] sm:px-12 sm:py-16">
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

                <h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">
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
                  className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#f8f3e8] px-6 py-3.5 font-semibold text-[#0d4f3f] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg"
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

      <footer className="border-t border-white/10 bg-[#092f28] text-[#c5ddd4]">
        <div className="mx-auto max-w-[1240px] px-5 pb-7 pt-12 sm:px-8 lg:px-12 lg:pt-16">
          <div className="grid gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr]">
            <div>
              <BrandLogo light />

              <p className="mt-4 max-w-sm text-sm leading-6 text-[#a9c9bd]">
                A calmer, clearer way to
                understand your money, plan
                ahead, and save with purpose.
              </p>

              <p className="mt-5 text-xs text-[#789f91]">
                See it. Save it.
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white">
                Product
              </h2>

              <nav
                className="mt-4 flex flex-col items-start gap-3 text-sm"
                aria-label="Product links"
              >
                <a
                  href="#features"
                  className="transition hover:text-white"
                >
                  Features
                </a>

                <a
                  href="#how-it-helps"
                  className="transition hover:text-white"
                >
                  How it helps
                </a>

                <a
                  href="#security"
                  className="transition hover:text-white"
                >
                  Security
                </a>
              </nav>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white">
                Account
              </h2>

              <nav
                className="mt-4 flex flex-col items-start gap-3 text-sm"
                aria-label="Account links"
              >
                <Link
                  to="/login"
                  className="transition hover:text-white"
                >
                  Sign in
                </Link>

                <Link
                  to="/register"
                  className="transition hover:text-white"
                >
                  Create account
                </Link>

                {isAuthenticated && (
                  <Link
                    to="/dashboard"
                    className="transition hover:text-white"
                  >
                    Dashboard
                  </Link>
                )}
              </nav>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white">
                Legal
              </h2>

              <nav
                className="mt-4 flex flex-col items-start gap-3 text-sm"
                aria-label="Legal links"
              >
                <Link
                  to="/privacy"
                  className="transition hover:text-white"
                >
                  Privacy policy
                </Link>

                <Link
                  to="/terms"
                  className="transition hover:text-white"
                >
                  Terms of use
                </Link>
              </nav>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-6 text-xs text-[#789f91] sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()}{' '}
              Salif. All rights reserved.
            </p>

            <p>
              Salif helps organise financial
              information and does not
              provide financial advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}