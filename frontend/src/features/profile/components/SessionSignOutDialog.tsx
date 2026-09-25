import {
  LogOut,
  X,
} from 'lucide-react'

import ModalDialog from '@/components/ui/ModalDialog'

interface SessionSignOutDialogProps {
  readonly title: string
  readonly description: string
  readonly isPending: boolean
  readonly errorMessage?: string | null
  readonly onCancel: () => void
  readonly onConfirm: () => void
}

export default function SessionSignOutDialog({
  title,
  description,
  isPending,
  errorMessage,
  onCancel,
  onConfirm,
}: SessionSignOutDialogProps) {
  return (
    <ModalDialog
      labelledBy="session-sign-out-title"
      describedBy="session-sign-out-description"
      onClose={onCancel}
      isPending={isPending}
      role="alertdialog"
      className="
        grid
        place-items-center
        bg-[#102c25]/65
        p-5
        backdrop-blur-sm
      "
    >
      <section
        className="
          w-full
          max-w-md
          rounded-2xl
          border border-line/40
          bg-surface
          p-6
          shadow-2xl
        "
      >
        <div className="flex items-start justify-between gap-4">
          <div
            className="
              grid size-10
              shrink-0
              place-items-center
              rounded-full
              bg-danger-soft
              text-danger
            "
          >
            <LogOut
              size={18}
              aria-hidden
            />
          </div>

          <button
            type="button"
            disabled={isPending}
            onClick={onCancel}
            className="
              grid size-9
              place-items-center
              rounded-md
              text-muted
              transition
              hover:bg-surface-muted
              hover:text-ink
              disabled:opacity-50
            "
            aria-label="Close"
          >
            <X
              size={18}
              aria-hidden
            />
          </button>
        </div>

        <h2
          id="session-sign-out-title"
          className="mt-5 text-xl font-semibold text-ink"
        >
          {title}
        </h2>

        <p
          id="session-sign-out-description"
          className="mt-2 text-sm leading-6 text-muted"
        >
          {description}
        </p>

        {errorMessage && (
          <p
            role="alert"
            className="mt-4 text-sm font-medium text-danger"
          >
            {errorMessage}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={onCancel}
            className="
              rounded-md
              border border-line-strong
              bg-surface
              px-4 py-2
              text-sm font-semibold
              text-ink
              transition
              hover:border-accent
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="
              rounded-md
              bg-danger
              px-4 py-2
              text-sm font-semibold
              text-inverse
              transition
              hover:opacity-90
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {isPending
              ? 'Signing out…'
              : 'Sign out'}
          </button>
        </div>
      </section>
    </ModalDialog>
  )
}