import {X} from 'lucide-react'
import {useEffect} from 'react'

import type {SavingsGoal} from '../api/types'
import GoalForm from './GoalForm'

interface GoalModalProps {
  goal?: SavingsGoal
  onClose: () => void
}

export default function GoalModal({
  goal,
  onClose,
}: GoalModalProps) {
  useEffect(() => {
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
        aria-label="Close goal form"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="goal-modal-title"
        className="absolute inset-y-0 right-0 w-full max-w-xl overflow-y-auto bg-[#f7f5ef] p-6 shadow-2xl sm:p-9"
      >
        <header className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
              {goal
                ? 'SHAPE THE PLAN'
                : 'A FUTURE WORTH FUNDING'}
            </p>

            <h2
              id="goal-modal-title"
              className="mt-3 font-serif text-4xl tracking-[-0.03em] text-[#173c32]"
            >
              {goal
                ? 'Edit your goal'
                : 'Create a goal'}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#657972]">
              {goal
                ? 'Adjust the destination while keeping your progress intact.'
                : 'Give your savings a purpose and a finish line.'}
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
          <GoalForm
            goal={goal}
            onCancel={onClose}
            onSuccess={onClose}
          />
        </div>
      </section>
    </div>
  )
}