import {
  ArrowUpRight,
  Check,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import {
  Link,
  Outlet,
  useLocation,
} from 'react-router'

import salifLogoGreen from '../../../assets/brand/salif-logo-green.svg'
import salifLogoLight from '../../../assets/brand/salif-logo-light.svg'

interface BrandLinkProps {
  readonly variant: 'green' | 'light'
}

function BrandLink({
  variant,
}: BrandLinkProps) {
  const logo =
    variant === 'light'
      ? salifLogoLight
      : salifLogoGreen

  return (
    <Link
      to="/"
      aria-label="Salif home"
      className="inline-flex"
    >
      <img
        className="h-auto w-36 object-contain sm:w-40"
        src={logo}
        alt=""
      />
    </Link>
  )
}

function FinancialPreview() {
  return (
    <div className="mt-9 max-w-lg rounded-[1.75rem] border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/15 backdrop-blur-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9bd6bf]">
            This month
          </p>

          <p className="mt-2 font-serif text-3xl text-white">
            R13,430 left
          </p>
        </div>

        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#d7a84d] text-[#092f28]">
          <ArrowUpRight
            size={19}
            aria-hidden
          />
        </span>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
        <span className="block h-full w-[68%] rounded-full bg-[#d7a84d]" />
      </div>

      <div className="mt-5 grid gap-2.5 text-sm text-[#e5f2ed] sm:grid-cols-3">
        {[
          'Bills covered',
          'Budget on track',
          'Goal moving',
        ].map((item) => (
          <span
            key={item}
            className="flex items-center gap-2"
          >
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white/10 text-[#d7a84d]">
              <Check
                size={12}
                strokeWidth={2.5}
                aria-hidden
              />
            </span>

            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function AuthLayout() {
  const location = useLocation()

  const isRegisterRoute =
    location.pathname === '/register'

  return (
    <div className="min-h-screen bg-[#f4f1e8] lg:grid lg:grid-cols-[minmax(22rem,42fr)_minmax(0,58fr)]">
      <aside className="relative hidden min-h-screen overflow-hidden bg-[#0d4f3f] p-10 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col xl:p-14">
        <div
          className="pointer-events-none absolute -left-32 top-1/3 size-72 rounded-full bg-[#16805f]/40 blur-3xl"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -bottom-40 -right-24 size-96 rounded-full bg-[#d7a84d]/15 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10">
          <BrandLink variant="light" />
        </div>

        <div className="relative z-10 my-auto py-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#9bd6bf]">
            <Sparkles
              size={15}
              className="text-[#d7a84d]"
              aria-hidden
            />

            Personal finance, made clearer
          </div>

          <h1 className="mt-5 max-w-xl font-serif text-4xl leading-[1.08] tracking-[-0.03em] text-white xl:text-5xl">
            A clearer view starts with one good habit.
          </h1>

          <p className="mt-5 max-w-lg text-base leading-7 text-[#cfe4dc]">
            Bring your accounts, spending, budgets and
            goals together, then make your next money
            decision with confidence.
          </p>

          <FinancialPreview />
        </div>

        <div className="relative z-10 flex items-center gap-3 border-t border-white/10 pt-6 text-sm text-[#cfe4dc]">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-[#d7a84d]">
            <ShieldCheck
              size={18}
              aria-hidden
            />
          </span>

          <span>
            Your financial information stays private
            and protected.
          </span>
        </div>
      </aside>

      <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_12%_8%,rgba(22,128,95,0.20),transparent_31%),radial-gradient(circle_at_92%_86%,rgba(215,168,77,0.22),transparent_34%),linear-gradient(145deg,#e8efe9_0%,#f7f3e9_48%,#e3ece7_100%)] px-4 py-5 sm:px-8 sm:py-8 lg:justify-center lg:px-10 lg:py-12 xl:px-16">
        <div
          className="auth-surface-grid pointer-events-none absolute inset-0 -z-10 opacity-55"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -right-24 top-[8%] -z-10 size-72 rounded-full border border-white/50 bg-white/20 shadow-[inset_0_0_45px_rgba(255,255,255,0.5)] backdrop-blur-3xl"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -bottom-28 left-[6%] -z-10 size-64 rounded-full bg-[#16805f]/10 blur-2xl"
          aria-hidden="true"
        />

        {!isRegisterRoute && (
          <div className="pointer-events-none absolute right-[6%] top-[9%] hidden items-center gap-3 rounded-full border border-white/70 bg-white/45 px-4 py-2.5 text-xs font-semibold text-[#0d4f3f] shadow-lg shadow-[#0d4f3f]/5 backdrop-blur-xl xl:flex">
            <span className="grid size-7 place-items-center rounded-full bg-[#0d4f3f] text-white">
              <ShieldCheck
                size={14}
                aria-hidden
              />
            </span>

            Private by design
          </div>
        )}

        <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/75 bg-white/55 px-4 py-3 shadow-sm backdrop-blur-xl lg:hidden">
          <BrandLink variant="green" />

          <span className="flex items-center gap-2 text-xs font-medium text-[#526b63]">
            <LockKeyhole
              size={14}
              aria-hidden
            />

            Secure access
          </span>
        </div>

        <div
          className={`relative z-10 mx-auto w-full ${
            isRegisterRoute
              ? 'max-w-[640px]'
              : 'max-w-[470px]'
          }`}
        >
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AuthLayout