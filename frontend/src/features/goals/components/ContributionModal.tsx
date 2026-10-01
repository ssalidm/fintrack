import { zodResolver } from '@hookform/resolvers/zod'
import { Info } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { ApiClientError } from '@/api/ApiClientError'
import FormDrawer from '@/components/ui/FormDrawer'
import type { SavingsGoal } from '@/features/goals/api/types'
import { useAddGoalContribution } from '@/features/goals/hooks/useGoals'
import {
  contributionFormSchema,
  type ContributionFormValues,
} from '@/features/goals/validation/goalSchemas'

interface ContributionModalProps {
  goal: SavingsGoal
  onClose: () => void
}

const fieldClasses =
  'mt-2 block w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink outline-none transition placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-accent/10 disabled:bg-surface-muted disabled:text-muted'

function today() {
  const date = new Date()

  const localDate =
    new Date(
      date.getTime() -
        date.getTimezoneOffset() *
          60_000,
    )

  return localDate
    .toISOString()
    .slice(0, 10)
}

export default function ContributionModal({
  goal,
  onClose,
}: ContributionModalProps) {
  const addContribution =
    useAddGoalContribution()

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
    useForm<ContributionFormValues>(
      {
        resolver: zodResolver(
          contributionFormSchema,
        ),
        defaultValues: {
          amount: 0,
          contributionDate:
            today(),
          note: '',
        },
      },
    )

  async function onSubmit(
    values: ContributionFormValues,
  ) {
    setSubmitError(null)

    try {
      await addContribution.mutateAsync(
        {
          goalId: goal.id,
          payload: {
            amount:
              values.amount,
            contributionDate:
              values.contributionDate,
            note:
              values.note.trim() ||
              undefined,
          },
        },
      )

      onClose()
    } catch (error) {
      setSubmitError(
        error instanceof
        ApiClientError
          ? error.message
          : 'Unable to add this contribution.',
      )
    }
  }

  return (
    <FormDrawer
      eyebrow="A STEP CLOSER"
      title={`Add to ${goal.name}`}
      description="Record progress towards this goal."
      onClose={onClose}
      isPending={isSubmitting}
    >
      <div className="mb-6 flex gap-3 rounded-xl border border-line/40 bg-accent-soft p-4 text-sm leading-6 text-muted">
        <Info
          size={18}
          className="mt-0.5 shrink-0 text-accent"
          aria-hidden
        />

        <p>
          This records savings
          progress. It does not move
          money between your Salif
          accounts.
        </p>
      </div>

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
              htmlFor="contribution-amount"
              className="type-label"
            >
              Amount (
              {goal.currencyCode})
            </label>

            <input
              id="contribution-amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.0001"
              autoFocus
              disabled={isSubmitting}
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
              htmlFor="contribution-date"
              className="type-label"
            >
              Date
            </label>

            <input
              id="contribution-date"
              type="date"
              disabled={isSubmitting}
              aria-invalid={
                errors.contributionDate
                  ? 'true'
                  : 'false'
              }
              className={`${fieldClasses} cursor-pointer`}
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
            htmlFor="contribution-note"
            className="type-label"
          >
            Note

            <span className="ml-2 font-normal text-subtle">
              Optional
            </span>
          </label>

          <textarea
            id="contribution-note"
            rows={2}
            placeholder="For example, September contribution"
            disabled={isSubmitting}
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
              ? 'Adding…'
              : 'Add contribution'}
          </button>
        </div>
      </form>
    </FormDrawer>
  )
}
