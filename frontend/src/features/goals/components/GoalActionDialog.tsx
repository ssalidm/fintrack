import {
  Archive,
  CheckCircle2,
} from 'lucide-react'

import ConfirmationDialog from '@/components/ui/ConfirmationDialog'
import type { SavingsGoal } from '@/features/goals/api/types'

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
  const isComplete =
    action === 'complete'

  return (
    <ConfirmationDialog
      title={
        isComplete
          ? `Celebrate ${goal.name}?`
          : `Archive ${goal.name}?`
      }
      description={
        isComplete
          ? 'This marks the goal as completed and preserves its contribution history.'
          : 'The goal will leave your active view, but its progress and history will remain available.'
      }
      icon={
        isComplete ? (
          <CheckCircle2
            size={18}
            aria-hidden
          />
        ) : (
          <Archive
            size={18}
            aria-hidden
          />
        )
      }
      confirmLabel={
        isComplete
          ? 'Mark complete'
          : 'Archive goal'
      }
      pendingLabel="Working…"
      cancelLabel="Keep it"
      isPending={isPending}
      onConfirm={onConfirm}
      onClose={onCancel}
      variant="plain"
      tone={isComplete ? 'primary' : 'danger'}
    >
      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          {error}
        </p>
      )}
    </ConfirmationDialog>
  )
}
