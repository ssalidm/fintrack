import {
  House,
  RefreshCw,
  TriangleAlert,
  WifiOff,
} from 'lucide-react'
import {
  isRouteErrorResponse,
  useRouteError,
} from 'react-router'

import salifLogoGreen from '@/assets/brand/salif-logo-green.svg'

function getErrorMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) {
    return `${error.status} ${error.statusText}`.trim()
  }

  if (error instanceof Error) {
    return error.message
  }

  return typeof error === 'string' ? error : ''
}

function isModuleLoadError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase()

  return [
    'failed to fetch dynamically imported module',
    'error loading dynamically imported module',
    'importing a module script failed',
    'chunkloaderror',
    'loading chunk',
  ].some((fragment) => message.includes(fragment))
}

export default function RouteErrorPage() {
  const error = useRouteError()
  const moduleFailed = isModuleLoadError(error)

  const title = moduleFailed
    ? 'This page needs a quick refresh'
    : 'Something didn’t load correctly'

  const description = moduleFailed
    ? 'We couldn’t download everything needed to display this page. Your connection may have been interrupted, or Salif may have been updated while this tab was open.'
    : 'We ran into a problem displaying this page. Try refreshing, or return home and continue from there.'

  return (
    <main className="relative isolate grid min-h-screen bg-[radial-gradient(circle_at_15%_10%,rgba(22,128,95,0.20),transparent_31%),radial-gradient(circle_at_88%_84%,rgba(215,168,77,0.22),transparent_34%),linear-gradient(145deg,#e8efe9_0%,#f7f3e9_50%,#e3ece7_100%)] px-5 py-10">
      <div
        className="auth-surface-grid pointer-events-none absolute inset-0 -z-10 opacity-50"
        aria-hidden="true"
      />

      <section
        aria-labelledby="route-error-title"
        className="auth-panel-enter m-auto w-full max-w-xl rounded-[2rem] border border-white/80 bg-white/65 p-6 text-center shadow-[0_28px_90px_rgba(9,47,40,0.15)] ring-1 ring-[#0d4f3f]/5 backdrop-blur-2xl sm:p-9"
      >
        <a
          href="/"
          aria-label="Salif home"
          className="inline-flex"
        >
          <img
            src={salifLogoGreen}
            alt=""
            className="h-auto w-36 object-contain"
          />
        </a>

        <span className="mx-auto mt-8 grid size-16 place-items-center rounded-full bg-[#f4e6d8] text-[#9b5845] ring-8 ring-white/55">
          {moduleFailed ? (
            <WifiOff size={29} aria-hidden />
          ) : (
            <TriangleAlert size={29} aria-hidden />
          )}
        </span>

        <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-[#16805f]">
          Let’s get you back
        </p>

        <h1
          id="route-error-title"
          className="mt-3 font-serif text-4xl leading-tight tracking-[-0.03em] text-[#092f28] sm:text-5xl"
        >
          {title}
        </h1>

        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-[#526b63]">
          {description}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0d4f3f] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(13,79,63,0.18)] transition-colors hover:bg-[#092f28] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#16805f]"
          >
            <RefreshCw size={17} aria-hidden />
            Refresh Salif
          </button>

          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#bfcac2] bg-white/55 px-5 py-3 text-sm font-semibold text-[#173c32] transition-colors hover:border-[#16805f] hover:bg-white/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#16805f]"
          >
            <House size={17} aria-hidden />
            Return home
          </a>
        </div>

        <p className="mt-5 text-xs leading-5 text-[#526b63]">
          Refreshing or leaving this page may clear unsaved form entries.
        </p>

        <p className="mt-4 text-sm leading-6 text-[#526b63]">
          If this keeps happening, check your connection
          and try again in a moment.
        </p>
      </section>
    </main>
  )
}