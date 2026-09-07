import {
  Gauge,
  X,
} from 'lucide-react'
import {useEffect} from 'react'

import type {BudgetCategoryLimit} from '../api/types'
import BudgetLimitForm from './BudgetLimitForm'

interface BudgetLimitModalProps {
  budgetId: string
  currencyCode: string
  limit?: BudgetCategoryLimit
  categoryName?: string
  unavailableCategoryIds?: string[]
  onClose: () => void
}

export default function BudgetLimitModal({
  budgetId,
  currencyCode,
  limit,
  categoryName,
  unavailableCategoryIds,
  onClose,
}: BudgetLimitModalProps) {
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
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-5">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-[#102e27]/55 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close category limit form"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="budget-limit-title"
        className="relative max-h-[calc(100vh-2.5rem)] w-full max-w-lg overflow-y-auto rounded-3xl bg-[#f7f5ef] p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#dfece4] text-[#236a58]">
              <Gauge
                size={20}
                aria-hidden
              />
            </div>

            <p className="mt-5 text-xs font-semibold tracking-[0.15em] text-[#657972]">
              {limit
                ? 'ADJUST THE BOUNDARY'
                : 'GIVE EACH RAND A ROLE'}
            </p>

            <h2
              id="budget-limit-title"
              className="mt-2 font-serif text-3xl text-[#173c32]"
            >
              {limit
                ? 'Edit category limit'
                : 'Add a category limit'}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#657972]">
              {limit
                ? 'Adjust the amount as the month changes.'
                : 'Set a useful guide—not a punishment—for one spending category.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full border border-[#d8d6ce] p-2 text-[#657972] transition hover:bg-[#ebe9e3] hover:text-[#173c32]"
            aria-label="Close"
          >
            <X size={19}/>
          </button>
        </div>

        <div className="mt-7">
          <BudgetLimitForm
            budgetId={budgetId}
            currencyCode={
              currencyCode
            }
            limit={limit}
            categoryName={
              categoryName
            }
            unavailableCategoryIds={
              unavailableCategoryIds
            }
            onCancel={onClose}
            onSuccess={onClose}
          />
        </div>
      </section>
    </div>
  )
}