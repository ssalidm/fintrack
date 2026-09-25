import { useId } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

import ModalDialog from './ModalDialog'

interface ConfirmationDialogProps {
  title: string
  description: ReactNode
  icon: ReactNode
  confirmLabel: string
  pendingLabel: string
  cancelLabel: string
  isPending: boolean
  onConfirm: () => void
  onClose: () => void
  children?: ReactNode
  variant?: 'plain' | 'bordered'
  role?: 'dialog' | 'alertdialog'
  closeLabel?: string
  tone?: 'danger' | 'primary'
}

export default function ConfirmationDialog({
  title,
  description,
  icon,
  confirmLabel,
  pendingLabel,
  cancelLabel,
  isPending,
  onConfirm,
  onClose,
  children,
  variant = 'bordered',
  role = 'alertdialog',
  closeLabel = 'Close confirmation',
  tone = 'danger',
}: ConfirmationDialogProps) {
  const titleId = useId()
  const descriptionId =
    useId()

  const isPlain =
    variant === 'plain'

  const iconClasses =
    tone === 'primary'
      ? 'bg-accent-soft text-accent'
      : 'bg-danger-soft text-danger'

  const confirmClasses =
    tone === 'primary'
      ? 'bg-primary text-inverse hover:bg-primary-hover'
      : 'bg-danger text-inverse hover:opacity-90'

  function requestClose() {
    if (!isPending) {
      onClose()
    }
  }

  return (
    <ModalDialog
      role={role}
      labelledBy={titleId}
      describedBy={
        descriptionId
      }
      isPending={isPending}
      onClose={onClose}
      className="overflow-y-auto open:grid open:place-items-center p-5 backdrop:bg-[#102e27]/45 backdrop:backdrop-blur-[2px]"
    >
      <section
        className={`relative max-h-full w-full max-w-md overflow-y-auto rounded-2xl border border-line/50 bg-surface shadow-2xl ${
          isPlain
            ? 'p-6 sm:p-7'
            : 'p-6 sm:p-8'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-xl ${iconClasses}`}
          >
            {icon}
          </span>

          {!isPlain && (
            <button
              type="button"
              disabled={isPending}
              onClick={
                requestClose
              }
              aria-label={
                closeLabel
              }
              className="grid size-8 cursor-pointer place-items-center rounded-full text-muted transition hover:bg-surface-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X
                size={17}
                aria-hidden
              />
            </button>
          )}
        </div>

        <h2
          id={titleId}
          className="mt-5 text-xl font-semibold tracking-[-0.02em] text-ink"
        >
          {title}
        </h2>

        <div
          id={descriptionId}
          className="mt-2 text-sm leading-6 text-muted"
        >
          {description}
        </div>

        {children}

        <div
          className={`mt-7 flex gap-3 ${
            isPlain
              ? 'justify-end'
              : 'flex-col-reverse sm:flex-row sm:justify-end'
          }`}
        >
          <button
            type="button"
            disabled={isPending}
            onClick={
              requestClose
            }
            className="cursor-pointer rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (!isPending) {
                onConfirm()
              }
            }}
            className={`cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmClasses}`}
          >
            {isPending
              ? pendingLabel
              : confirmLabel}
          </button>
        </div>
      </section>
    </ModalDialog>
  )
}
