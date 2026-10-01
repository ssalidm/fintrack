import { Link } from 'react-router'

export default function DashboardFooter() {
  const currentYear =
    new Date().getFullYear()

  return (
    <footer className="border-t border-line/40">
      <div
        className="
          mx-auto
          flex w-full
          max-w-[1280px]
          flex-col
          gap-3
          px-5 py-5
          text-xs
          text-subtle
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:px-8
          lg:px-12
          xl:px-16
        "
      >
        <p>
          &copy; {currentYear} Salif. Your money,
          made clearer.
        </p>

        <nav
          className="flex flex-wrap items-center gap-x-5 gap-y-2"
          aria-label="Footer navigation"
        >
          <Link
            to="/support"
            className="
              transition
              hover:text-ink
            "
          >
            Support
          </Link>

          <Link
            to="/privacy"
            className="
              transition
              hover:text-ink
            "
          >
            Privacy
          </Link>

          <Link
            to="/terms"
            className="
              transition
              hover:text-ink
            "
          >
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  )
}