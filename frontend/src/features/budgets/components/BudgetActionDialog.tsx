import {
  Archive,
  Trash2,
  X,
} from 'lucide-react'
import {useEffect} from 'react'

export type BudgetActionKind =
  | 'ARCHIVE_BUDGET'
  | 'REMOVE_LIMIT'

interface BudgetActionDialogProps {
  action: BudgetActionKind
  subjectName: string
  isPending: boolean
  errorMessage?: string | null
  onCancel: () => void
  onConfirm: () => void
}

const content = {
  ARCHIVE_BUDGET: {
    eyebrow: 'CLOSE THIS CHAPTER',
    title: 'Archive this budget?',
    description:
      'Its limits and spending history will stay available, but the budget can no longer be edited.',
    confirmation: 'Archive budget',
    pending: 'Archiving…',
    Icon: Archive,
  },

  REMOVE_LIMIT: {
    eyebrow: 'REMOVE A BOUNDARY',
    title: 'Remove this limit?',
    description:
      'The category and its transactions will remain untouched. Only this monthly spending limit will be removed.',
    confirmation: 'Remove limit',
    pending: 'Removing…',
    Icon: Trash2,
  },
} satisfies Record<
  BudgetActionKind,
  {
    eyebrow: string
    title: string
    description: string
    confirmation: string
    pending: string
    Icon: typeof Archive
  }
>

export default function BudgetActionDialog({
  action,
  subjectName,
  isPending,
  errorMessage,
  onCancel,
  onConfirm,
}: BudgetActionDialogProps) {
  const actionContent = content[action]
  const {Icon} = actionContent

  useEffect(() => {
    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (
        event.key === 'Escape' &&
        !isPending
      ) {
        onCancel()
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
  }, [isPending, onCancel])

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-5">
      <button
        type="button"
        disabled={isPending}
        className="absolute inset-0 cursor-pointer bg-[#102e27]/55 backdrop-blur-[2px] disabled:cursor-not-allowed"
        onClick={onCancel}
        aria-label="Close confirmation"
      />

      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="budget-action-title"
        aria-describedby="budget-action-description"
        className="relative w-full max-w-md rounded-3xl border border-[#dedbd2] bg-[#fffdf8] p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f4e2dc] text-[#a5503d]">
            <Icon
              size={21}
              aria-hidden
            />
          </div>

          <button
            type="button"
            disabled={isPending}
            onClick={onCancel}
            className="cursor-pointer rounded-full border border-[#d8d6ce] p-2 text-[#657972] transition hover:bg-[#efede7] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Close"
          >
            <X size={18}/>
          </button>
        </div>

        <p className="mt-6 text-xs font-semibold tracking-[0.15em] text-[#8f6952]">
          {actionContent.eyebrow}
        </p>

        <h2
          id="budget-action-title"
          className="mt-2 font-serif text-3xl text-[#173c32]"
        >
          {actionContent.title}
        </h2>

        <p className="mt-3 font-semibold text-[#173c32]">
          {subjectName}
        </p>

        <p
          id="budget-action-description"
          className="mt-2 text-sm leading-6 text-[#657972]"
        >
          {actionContent.description}
        </p>

        {errorMessage && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {errorMessage}
          </div>
        )}

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isPending}
            onClick={onCancel}
            className="cursor-pointer rounded-full border border-[#d8d6ce] px-5 py-2.5 text-sm font-semibold text-[#173c32] transition hover:bg-[#efede7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Keep it
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="cursor-pointer rounded-full bg-[#a5503d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8d4233] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending
              ? actionContent.pending
              : actionContent.confirmation}
          </button>
        </div>
      </section>
    </div>
  )
}