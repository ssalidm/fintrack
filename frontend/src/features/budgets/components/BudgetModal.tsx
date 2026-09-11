import {X} from 'lucide-react'
import {useEffect} from 'react'

import type {BudgetSummary} from '../api/types'
import BudgetForm from './BudgetForm'

interface BudgetModalProps {
  budget?: BudgetSummary
  onClose: () => void
}

export default function BudgetModal({
  budget,
  onClose,
}: BudgetModalProps) {
  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow =
      'hidden'

    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener(
      'keydown',
      handleEscape,
    )

    return () => {
      document.body.style.overflow =
        previousOverflow

      document.removeEventListener(
        'keydown',
        handleEscape,
      )
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-[#102e27]/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close budget form"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="budget-modal-title"
        className="absolute inset-y-0 right-0 w-full max-w-xl overflow-y-auto bg-[#f7f5ef] p-6 shadow-2xl sm:p-9"
      >
        <header className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
              {budget
                ? 'REFINE THE PLAN'
                : 'SPEND WITH INTENTION'}
            </p>

            <h2
              id="budget-modal-title"
              className="mt-3 font-serif text-4xl tracking-[-0.03em] text-[#173c32]"
            >
              {budget
                ? 'Rename your budget'
                : 'Create a budget'}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#657972]">
              {budget
                ? 'Give this monthly plan a name that still feels useful.'
                : 'Choose the month and currency first. Category limits come next.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full border border-[#d8d6ce] p-2 text-[#657972] transition hover:bg-[#ebe9e3] hover:text-[#173c32]"
            aria-label="Close"
          >
            <X size={20}/>
          </button>
        </header>

        <div className="mt-9">
          <BudgetForm
            budget={budget}
            onCancel={onClose}
            onSuccess={onClose}
          />
        </div>
      </section>
    </div>
  )
}