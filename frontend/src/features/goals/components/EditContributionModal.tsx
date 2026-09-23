import { zodResolver } from '@hookform/resolvers/zod'
import { Info } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { ApiClientError } from '../../../api/ApiClientError'
import FormDrawer from '../../../components/ui/FormDrawer'
import type {
  GoalContribution,
  SavingsGoal,
} from '../api/types'
import { useUpdateGoalContribution } from '../hooks/useGoals'
import {
  contributionFormSchema,
  type ContributionFormValues,
} from '../validation/goalSchemas'

interface EditContributionModalProps {
  goal: SavingsGoal
  contribution: GoalContribution
  onClose: () => void
}

const fieldClasses =
  'mt-2 block w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink outline-none transition placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-accent/10 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted'

export default function EditContributionModal({
  goal,
  contribution,
  onClose,
}: EditContributionModalProps) {
  const updateContribution =
    useUpdateGoalContribution()

  const [
    submitError,
    setSubmitError,
  ] = useState<string | null>(
    null,
  )

  const canEditFinancialFields =
    goal.status === 'ACTIVE'

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<ContributionFormValues>(
      {
        resolver: zodResolver(
          contributionFormSchema,
        ),
        defaultValues: {
          amount:
            contribution.amount,
          contributionDate:
            contribution.contributionDate,
          note:
            contribution.note ??
            '',
        },
      },
    )

  async function onSubmit(
    values: ContributionFormValues,
  ) {
    setSubmitError(null)

    try {
      await updateContribution.mutateAsync(
        {
          goalId: goal.id,
          contributionId:
            contribution.id,
          payload: {
            version:
              contribution.version,
            note:
              values.note.trim(),
            ...(canEditFinancialFields
              ? {
                  amount:
                    values.amount,
                  contributionDate:
                    values.contributionDate,
                }
              : {}),
          },
        },
      )

      onClose()
    } catch (error) {
      setSubmitError(
        error instanceof
        ApiClientError
          ? error.message
          : 'Unable to update this contribution.',
      )
    }
  }

  return (
    <FormDrawer
      eyebrow="CORRECT THE RECORD"
      title="Edit contribution"
      description={`Update the contribution recorded for ${goal.name}.`}
      onClose={onClose}
      isPending={isSubmitting}
    >
      {!canEditFinancialFields && (
        <div className="mb-6 flex gap-3 rounded-xl border border-warning/20 bg-warning-soft p-4 text-sm leading-6 text-warning">
          <Info
            size={18}
            className="mt-0.5 shrink-0"
            aria-hidden
          />

          <p>
            This goal is no longer
            active. You may correct
            the note, but its amount
            and date are locked.
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(
          onSubmit,
        )}
        className="space-y-5"
        noValidate
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="edit-contribution-amount"
              className="type-label"
            >
              Amount (
              {goal.currencyCode})
            </label>

            <input
              id="edit-contribution-amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.0001"
              disabled={
                isSubmitting ||
                !canEditFinancialFields
              }
              aria-invalid={
                errors.amount
                  ? 'true'
                  : 'false'
              }
              className={
                fieldClasses
              }
              {...register(
                'amount',
                {
                  setValueAs: (
                    value: string,
                  ) =>
                    value === ''
                      ? Number.NaN
                      : Number(
                          value,
                        ),
                },
              )}
            />

            {errors.amount && (
              <p
                className="mt-2 text-sm text-danger"
                role="alert"
              >
                {
                  errors.amount
                    .message
                }
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-contribution-date"
              className="type-label"
            >
              Date
            </label>

            <input
              id="edit-contribution-date"
              type="date"
              disabled={
                isSubmitting ||
                !canEditFinancialFields
              }
              aria-invalid={
                errors.contributionDate
                  ? 'true'
                  : 'false'
              }
              className={`${fieldClasses} cursor-pointer disabled:cursor-not-allowed`}
              {...register(
                'contributionDate',
              )}
            />

            {errors.contributionDate && (
              <p
                className="mt-2 text-sm text-danger"
                role="alert"
              >
                {
                  errors
                    .contributionDate
                    .message
                }
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="edit-contribution-note"
            className="type-label"
          >
            Note

            <span className="ml-2 font-normal text-subtle">
              Optional
            </span>
          </label>

          <textarea
            id="edit-contribution-note"
            rows={3}
            disabled={isSubmitting}
            placeholder="What was this contribution for?"
            aria-invalid={
              errors.note
                ? 'true'
                : 'false'
            }
            className={`${fieldClasses} resize-none`}
            {...register('note')}
          />

          {errors.note && (
            <p
              className="mt-2 text-sm text-danger"
              role="alert"
            >
              {
                errors.note
                  .message
              }
            </p>
          )}
        </div>

        {submitError && (
          <div
            className="rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
            role="alert"
          >
            {submitError}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-inverse transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? 'Saving…'
              : 'Save correction'}
          </button>
        </div>
      </form>
    </FormDrawer>
  )
}
