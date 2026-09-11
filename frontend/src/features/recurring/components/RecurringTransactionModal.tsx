import {useEffect} from 'react'
import {
  CalendarClock,
  Pencil,
  X,
} from 'lucide-react'
import type {RecurringTransaction} from '../api/types'
import RecurringTransactionForm from './RecurringTransactionForm'

interface RecurringTransactionModalProps {
  isOpen: boolean
  schedule?: RecurringTransaction | null
  onClose: () => void
}

export default function RecurringTransactionModal({
                                                     isOpen,
                                                     schedule,
                                                     onClose,
                                                   }: RecurringTransactionModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener(
        'keydown',
        handleEscape,
      )
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const isEditMode = Boolean(schedule)
  const HeaderIcon = isEditMode
    ? Pencil
    : CalendarClock

  return (
    <div
      role="presentation"
      onMouseDown={onClose}
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#102f28]/55 px-4 py-8 backdrop-blur-sm"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="recurring-modal-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        className="w-full max-w-3xl overflow-hidden rounded-3xl border border-[#d8d5cc] bg-[#fffdf8] shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-[#e5e1d8] px-6 py-5 sm:px-8 sm:py-6">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#e3e9ed] text-[#557587]">
              <HeaderIcon size={20} aria-hidden/>
            </span>

            <div>
              <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
                {isEditMode
                  ? 'UPDATE SCHEDULE'
                  : 'PLAN AHEAD'}
              </p>

              <h2
                id="recurring-modal-title"
                className="mt-1 font-serif text-3xl tracking-[-0.02em] text-[#173c32]"
              >
                {isEditMode
                  ? 'Edit recurring transaction'
                  : 'New recurring transaction'}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#657972]">
                {isEditMode
                  ? 'Update how and when this activity repeats.'
                  : 'Create a repeating income or expense schedule.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close recurring transaction form"
            className="cursor-pointer rounded-full p-2 text-[#657972] transition hover:bg-[#eef1eb] hover:text-[#173c32]"
          >
            <X size={20} aria-hidden/>
          </button>
        </header>

        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
          <RecurringTransactionForm
            schedule={schedule}
            onSuccess={onClose}
            onCancel={onClose}
          />
        </div>
      </section>
    </div>
  )
}