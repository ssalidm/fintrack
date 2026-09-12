import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface FormDrawerProps {
  eyebrow: string
  title: string
  description: string
  onClose: () => void
  children: ReactNode
}

export default function FormDrawer({
  eyebrow,
  title,
  description,
  onClose,
  children,
}: FormDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const backdropPress = useRef(false)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'

    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden border-0 bg-transparent p-0 backdrop:bg-[#102e27]/45 backdrop:backdrop-blur-[2px]"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onPointerDown={(event) => {
        backdropPress.current = event.target === event.currentTarget
      }}
      onPointerCancel={() => {
        backdropPress.current = false
      }}
      onClick={(event) => {
        if (backdropPress.current && event.target === event.currentTarget) {
          onClose()
        }
        backdropPress.current = false
      }}
    >
      <section className="ml-auto h-full w-full max-w-xl overflow-y-auto overscroll-contain bg-[#f7f5ef] p-6 shadow-2xl sm:p-9">
        <header className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
              {eyebrow}
            </p>
            <h2
              id={titleId}
              className="mt-3 font-serif text-4xl tracking-[-0.03em] text-[#173c32]"
            >
              {title}
            </h2>
            <p
              id={descriptionId}
              className="mt-2 text-sm leading-6 text-[#657972]"
            >
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-[#d8d6ce] p-2 text-[#657972] transition hover:bg-[#ebe9e3] hover:text-[#173c32] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173c32]"
            aria-label="Close"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="mt-9">{children}</div>
      </section>
    </dialog>,
    document.body,
  )
}