import {
  Archive,
  Trash2,
} from 'lucide-react'

import ConfirmationDialog from '../../../components/ui/ConfirmationDialog'

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
    title:
      'Archive this budget?',
    description:
      'Its limits and spending history will stay available, but the budget can no longer be edited.',
    confirmation:
      'Archive budget',
    pending: 'Archiving…',
    Icon: Archive,
  },
  REMOVE_LIMIT: {
    title:
      'Remove this limit?',
    description:
      'The category and its transactions will remain untouched. Only this monthly spending limit will be removed.',
    confirmation:
      'Remove limit',
    pending: 'Removing…',
    Icon: Trash2,
  },
} satisfies Record<
  BudgetActionKind,
  {
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
  const actionContent =
    content[action]

  const {
    Icon,
  } = actionContent

  return (
    <ConfirmationDialog
      title={
        actionContent.title
      }
      description={
        <>
          <strong className="text-ink">
            {subjectName}
          </strong>
          {' — '}
          {
            actionContent.description
          }
        </>
      }
      icon={
        <Icon
          size={18}
          aria-hidden
        />
      }
      confirmLabel={
        actionContent.confirmation
      }
      pendingLabel={
        actionContent.pending
      }
      cancelLabel="Keep it"
      isPending={isPending}
      onConfirm={onConfirm}
      onClose={onCancel}
      variant="plain"
    >
      {errorMessage && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          {errorMessage}
        </div>
      )}
    </ConfirmationDialog>
  )
}
