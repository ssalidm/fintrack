import {Navigate, Outlet, useLocation} from 'react-router'
import {useAuth} from '../context/useAuth'

export default function ProtectedRoute() {
  const {status} = useAuth()
  const location = useLocation()

  if (status === 'checking') {
    return (
      <main
        className="grid min-h-screen place-items-center bg-slate-50"
        aria-busy="true"
      >
        <div className="text-center">
          <div
            className="mx-auto size-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#1F7A5C]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm text-slate-600">
            Restoring your session…
          </p>
        </div>
      </main>
    )
  }

  if (status === 'unauthenticated') {
    const returnPath = `${location.pathname}${location.search}`

    return (
      <Navigate
        to="/login"
        replace
        state={{from: returnPath}}
      />
    )
  }

  return <Outlet/>
}
