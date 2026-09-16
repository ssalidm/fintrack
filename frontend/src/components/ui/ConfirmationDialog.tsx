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
}: ConfirmationDialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const isPlain = variant === 'plain'

  function requestClose() {
    if (!isPending) {
      onClose()
    }
  }

  const overlayClasses = isPlain
    ? 'p-5 backdrop:bg-[#102e27]/45 backdrop:backdrop-blur-[2px]'
    : 'px-4 py-4 backdrop:bg-[#102f28]/55 backdrop:backdrop-blur-sm'

  const panelClasses = isPlain
    ? 'p-7'
    : 'border border-[#dedbd2] p-6 sm:p-8'

  const iconClasses = isPlain
    ? 'bg-[#f2e3de] text-[#9b5845]'
    : 'bg-[#f4e7df] text-[#a85e49]'

  const footerClasses = isPlain
    ? 'justify-end'
    : 'flex-col-reverse sm:flex-row sm:justify-end'

  const cancelClasses = isPlain
    ? 'border-[#d8d6ce] hover:bg-[#efede7] disabled:opacity-60'
    : 'border-[#d8d5cc] transition hover:bg-[#f5f5ef] disabled:opacity-50'

  const confirmClasses = isPlain
    ? 'bg-[#9b5845] hover:bg-[#834937] disabled:opacity-60'
    : 'bg-[#a85e49] transition hover:bg-[#914d3c] disabled:opacity-50'

  return (
    <ModalDialog
      role={role}
      labelledBy={titleId}
      describedBy={descriptionId}
      isPending={isPending}
      onClose={onClose}
      className={`overflow-y-auto open:grid open:place-items-center ${overlayClasses}`}
    >
      <section
        className={`relative max-h-full w-full max-w-md overflow-y-auto rounded-3xl bg-[#fffdf8] shadow-2xl ${panelClasses}`}
      >
        <div className="flex items-start justify-between gap-4">
          <span
            className={`grid size-11 shrink-0 place-items-center rounded-full ${iconClasses}`}
          >
            {icon}
          </span>

          {!isPlain && (
            <button
              type="button"
              disabled={isPending}
              onClick={requestClose}
              aria-label={closeLabel}
              className="cursor-pointer rounded-full p-2 text-[#657972] transition hover:bg-[#eef1eb] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={19} aria-hidden />
            </button>
          )}
        </div>

        <h2
          id={titleId}
          className={`mt-5 font-serif text-3xl text-[#173c32] ${
            isPlain ? '' : 'tracking-[-0.02em]'
          }`}
        >
          {title}
        </h2>

        <p
          id={descriptionId}
          className="mt-3 text-sm leading-6 text-[#657972]"
        >
          {description}
        </p>

        {children}

        <div className={`mt-7 flex gap-3 ${footerClasses}`}>
          <button
            type="button"
            disabled={isPending}
            onClick={requestClose}
            className={`cursor-pointer rounded-full border px-5 py-2.5 text-sm font-semibold text-[#173c32] disabled:cursor-not-allowed ${cancelClasses}`}
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
            className={`cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed ${confirmClasses}`}
          >
            {isPending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </section>
    </ModalDialog>
  )
}