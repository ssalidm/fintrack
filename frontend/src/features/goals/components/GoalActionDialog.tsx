import {
  Archive,
  CheckCircle2,
  X,
} from 'lucide-react'

import type {SavingsGoal} from '../api/types'

export type GoalAction =
  | 'complete'
  | 'archive'

interface GoalActionDialogProps {
  goal: SavingsGoal
  action: GoalAction
  isPending: boolean
  error: string | null
  onCancel: () => void
  onConfirm: () => void
}

export default function GoalActionDialog({
  goal,
  action,
  isPending,
  error,
  onCancel,
  onConfirm,
}: GoalActionDialogProps) {
  const isComplete = action === 'complete'

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-5">
      <button
        type="button"
        onClick={onCancel}
        disabled={isPending}
        className="absolute inset-0 cursor-pointer bg-[#102e27]/55 backdrop-blur-[2px] disabled:cursor-not-allowed"
        aria-label="Close confirmation"
      />

      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="goal-action-title"
        className="relative w-full max-w-md rounded-3xl bg-[#fffdf8] p-7 shadow-2xl"
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="absolute right-5 top-5 cursor-pointer rounded-full p-2 text-[#657972] transition hover:bg-[#efede7] disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Close"
        >
          <X size={19}/>
        </button>

        <span
          className={`grid size-12 place-items-center rounded-full ${
            isComplete
              ? 'bg-[#dfece3] text-[#39725d]'
              : 'bg-[#f2e7df] text-[#9b5845]'
          }`}
        >
          {isComplete ? (
            <CheckCircle2
              size={23}
              aria-hidden
            />
          ) : (
            <Archive
              size={22}
              aria-hidden
            />
          )}
        </span>

        <h2
          id="goal-action-title"
          className="mt-5 pr-8 font-serif text-3xl text-[#173c32]"
        >
          {isComplete
            ? `Celebrate ${goal.name}?`
            : `Archive ${goal.name}?`}
        </h2>

        <p className="mt-3 text-sm leading-6 text-[#657972]">
          {isComplete
            ? 'This marks the goal as completed and preserves its contribution history.'
            : 'The goal will leave your active view, but its progress and history will remain available.'}
        </p>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="cursor-pointer rounded-full border border-[#d8d6ce] px-5 py-2.5 text-sm font-semibold text-[#173c32] transition hover:bg-[#efede7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Keep it
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={`cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isComplete
                ? 'bg-[#174f43] hover:bg-[#236a58]'
                : 'bg-[#9b5845] hover:bg-[#814735]'
            }`}
          >
            {isPending
              ? 'Working…'
              : isComplete
                ? 'Mark complete'
                : 'Archive goal'}
          </button>
        </div>
      </section>
    </div>
  )
}