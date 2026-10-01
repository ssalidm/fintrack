import {
  FileText,
  ShieldCheck,
  X,
} from 'lucide-react'

export type LegalDocument = 'terms' | 'privacy'

interface LegalNoticeDialogProps {
  document: LegalDocument
  onClose: () => void
}

export default function LegalNoticeDialog({
  document,
  onClose,
}: LegalNoticeDialogProps) {
  const isTerms = document === 'terms'

  const title = isTerms
    ? 'Terms of Service'
    : 'Privacy Policy'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-dialog-title"
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-5 backdrop-blur-sm"
    >
      <div className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-line bg-surface p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${title}`}
          className="absolute right-5 top-5 grid size-9 cursor-pointer place-items-center rounded-full text-muted transition hover:bg-surface-muted hover:text-ink"
        >
          <X size={18} aria-hidden />
        </button>

        <span className="grid size-11 place-items-center rounded-2xl bg-accent-soft text-accent">
          {isTerms ? (
            <FileText size={21} aria-hidden />
          ) : (
            <ShieldCheck size={21} aria-hidden />
          )}
        </span>

        <p className="mt-5 text-xs font-semibold tracking-[0.15em] text-accent">
          SALIF
        </p>

        <h2
          id="legal-dialog-title"
          className="mt-2 pr-10 font-serif text-3xl text-ink"
        >
          {title}
        </h2>

        {isTerms ? (
          <div className="mt-5 space-y-4 text-sm leading-6 text-muted">
            <p>
              Salif provides tools for organising your
              personal financial information. It does
              not provide financial, tax or investment
              advice.
            </p>

            <p>
              You are responsible for keeping your
              sign-in details secure and for ensuring
              that the information you add is accurate.
            </p>

            <p>
              You may not misuse the service, attempt
              to access another person’s account or use
              Salif for unlawful activity.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4 text-sm leading-6 text-muted">
            <p>
              Salif processes the account and financial
              information you provide so that it can
              deliver its budgeting and money-management
              features.
            </p>

            <p>
              Your information is used to operate,
              secure and improve your account. Salif
              does not sell your personal information.
            </p>

            <p>
              You can review and update your account
              information from your profile after
              signing in.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-7 w-full cursor-pointer rounded-full bg-primary px-5 py-3 text-sm font-semibold text-inverse transition hover:bg-primary-hover"
        >
          Close
        </button>
      </div>
    </div>
  )
}