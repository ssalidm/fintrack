import { useId } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

import ModalDialog from './ModalDialog'

interface FormDrawerProps {
  eyebrow: string
  title: string
  description: string
  onClose: () => void
  children: ReactNode
  isPending?: boolean
}

export default function FormDrawer({
  eyebrow,
  title,
  description,
  onClose,
  children,
  isPending = false,
}: FormDrawerProps) {
  const titleId = useId()
  const descriptionId =
    useId()

  return (
    <ModalDialog
      labelledBy={titleId}
      describedBy={
        descriptionId
      }
      isPending={isPending}
      onClose={onClose}
      className="overflow-hidden p-0 backdrop:bg-[#102e27]/45 backdrop:backdrop-blur-[2px]"
    >
      <section className="ml-auto h-full w-full max-w-xl overflow-y-auto overscroll-contain bg-app p-6 shadow-2xl sm:p-9">
        <header className="flex items-start justify-between gap-6">
          <div>
            <p className="type-eyebrow">
              {eyebrow}
            </p>

            <h2
              id={titleId}
              className="type-page-title mt-3"
            >
              {title}
            </h2>

            <p
              id={descriptionId}
              className="type-body mt-2"
            >
              {description}
            </p>
          </div>

          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border border-line bg-surface text-muted transition hover:bg-surface-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Close"
          >
            <X
              size={18}
              aria-hidden
            />
          </button>
        </header>

        <div className="mt-9">
          {children}
        </div>
      </section>
    </ModalDialog>
  )
}
