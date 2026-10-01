import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalDialogProps {
  children: ReactNode
  labelledBy: string
  describedBy?: string
  onClose: () => void
  isPending?: boolean
  role?: 'dialog' | 'alertdialog'
  className: string
}

let scrollLockCount = 0
let previousBodyOverflow = ''

function lockBodyScroll() {
  if (scrollLockCount === 0) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }

  scrollLockCount += 1

  return () => {
    scrollLockCount -= 1

    if (scrollLockCount === 0) {
      document.body.style.overflow = previousBodyOverflow
    }
  }
}

export default function ModalDialog({
  children,
  labelledBy,
  describedBy,
  onClose,
  isPending = false,
  role = 'dialog',
  className,
}: ModalDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const backdropPress = useRef(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    dialog.showModal()
    const unlockBodyScroll = lockBodyScroll()

    return () => {
      dialog.close()
      unlockBodyScroll()
    }
  }, [])

  function requestClose() {
    if (!isPending) {
      onClose()
    }
  }

  return createPortal(
    <dialog
      ref={dialogRef}
      role={role}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-busy={isPending}
      className={`fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none border-0 bg-transparent ${className}`}
      onCancel={(event) => {
        event.preventDefault()
        event.stopPropagation()
        requestClose()
      }}
      onPointerDown={(event) => {
        backdropPress.current = event.target === event.currentTarget
      }}
      onPointerCancel={() => {
        backdropPress.current = false
      }}
      onClick={(event) => {
        const clickedBackdrop =
          backdropPress.current && event.target === event.currentTarget

        backdropPress.current = false

        if (clickedBackdrop) {
          requestClose()
        }
      }}
    >
      {children}
    </dialog>,
    document.body,
  )
}