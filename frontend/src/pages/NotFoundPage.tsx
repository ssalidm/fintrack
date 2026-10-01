import {Link} from 'react-router'

function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-slate-100">
      <section className="text-center">
        <p className="text-sm font-semibold tracking-[0.25em] text-[#1f7a5c] uppercase">
          Error 404
        </p>

        <h1 className="mt-4 text-4xl font-bold tracking-tight">
          Page not found
        </h1>

        <p className="mt-4 text-slate-400">
          The page you requested does not exist.
        </p>

        <Link
          className="mt-8 inline-flex rounded-xl bg-[#1f7a5c] px-5 py-3 font-semibold text-white transition hover:bg-[#176348] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1f7a5c]"
          to="/"
        >
          Return home
        </Link>
      </section>
    </main>
  )
}

export default NotFoundPage
