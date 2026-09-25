import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { ApiClientError } from '@/api/ApiClientError'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog'
import type {
  GoalContribution,
  SavingsGoal,
} from '@/features/goals/api/types'
import { useVoidGoalContribution } from '@/features/goals/hooks/useGoals'
import {
  voidContributionSchema,
  type VoidContributionFormValues,
} from '@/features/goals/validation/goalSchemas'

interface VoidContributionModalProps {
  goal: SavingsGoal
  contribution: GoalContribution
  onClose: () => void
}

const fieldClasses =
  'mt-2 block w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink outline-none transition placeholder:text-subtle focus:border-danger focus:ring-2 focus:ring-danger/10 disabled:bg-surface-muted disabled:text-muted'

export default function VoidContributionModal({
  goal,
  contribution,
  onClose,
}: VoidContributionModalProps) {
  const voidContribution =
    useVoidGoalContribution()

  const [
    submitError,
    setSubmitError,
  ] = useState<string | null>(
    null,
  )

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<VoidContributionFormValues>(
      {
        resolver: zodResolver(
          voidContributionSchema,
        ),
        defaultValues: {
          reason: '',
        },
      },
    )

  async function onSubmit(
    values: VoidContributionFormValues,
  ) {
    setSubmitError(null)

    try {
      await voidContribution.mutateAsync(
        {
          goalId: goal.id,
          contributionId:
            contribution.id,
          payload: {
            version:
              contribution.version,
            reason:
              values.reason.trim(),
          },
        },
      )

      onClose()
    } catch (error) {
      setSubmitError(
        error instanceof
        ApiClientError
          ? error.message
          : 'Unable to void this contribution.',
      )
    }
  }

  const isPending =
    isSubmitting ||
    voidContribution.isPending

  return (
    <ConfirmationDialog
      title="Void this contribution?"
      description={
        <>
          The contribution will
          remain in the history but
          will no longer count
          towards{' '}
          <strong className="text-ink">
            {goal.name}
          </strong>
          .
        </>
      }
      icon={
        <AlertTriangle
          size={18}
          aria-hidden
        />
      }
      confirmLabel="Void contribution"
      pendingLabel="Voiding…"
      cancelLabel="Keep it"
      isPending={isPending}
      onConfirm={() =>
        void handleSubmit(
          onSubmit,
        )()
      }
      onClose={onClose}
      variant="plain"
      tone="danger"
    >
      <label
        htmlFor="void-contribution-reason"
        className="mt-6 block type-label"
      >
        Reason
      </label>

      <textarea
        id="void-contribution-reason"
        rows={3}
        autoFocus
        disabled={isPending}
        placeholder="For example, entered twice"
        aria-invalid={
          errors.reason
            ? 'true'
            : 'false'
        }
        className={`${fieldClasses} resize-none`}
        {...register('reason')}
      />

      {errors.reason && (
        <p
          className="mt-2 text-sm text-danger"
          role="alert"
        >
          {
            errors.reason
              .message
          }
        </p>
      )}

      {submitError && (
        <div
          className="mt-5 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
          role="alert"
        >
          {submitError}
        </div>
      )}
    </ConfirmationDialog>
  )
}
