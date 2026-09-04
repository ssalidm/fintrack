import {Link, Outlet} from 'react-router'
import salifLogoDark from '../../../assets/brand/salif-logo-dark.png'
import salifLogoGreen from '../../../assets/brand/salif-logo-green.png'

interface BrandLinkProps {
  readonly variant: 'dark' | 'green'
}

function BrandLink({variant}: BrandLinkProps) {
  const logo = variant === 'green' ? salifLogoGreen : salifLogoDark

  return (
    <Link to="/" aria-label="Salif home">
      <img
        className="h-auto w-44"
        src={logo}
        alt=""
      />
    </Link>
  )
}

function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      <aside
        className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col">
        <BrandLink variant="green"/>

        <div className="my-auto max-w-xl">
          <p className="mb-6 text-sm font-semibold tracking-[0.2em] text-[#50b68f] uppercase">
            Personal finance, clearly
          </p>

          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            Understand your money without the noise.
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            Track accounts, spending, budgets, and savings goals from one
            secure place.
          </p>
        </div>

        <p className="text-sm text-slate-500">
          Built for clarity, control, and better financial decisions.
        </p>

        <div
          className="absolute -right-32 -bottom-32 size-96 rounded-full bg-[#1f7a5c]/20 blur-3xl"
          aria-hidden="true"
        />
      </aside>

      <main className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-12 lg:hidden">
            <BrandLink variant="dark"/>
          </div>

          <Outlet/>
        </div>
      </main>
    </div>
  )
}

export default AuthLayout
