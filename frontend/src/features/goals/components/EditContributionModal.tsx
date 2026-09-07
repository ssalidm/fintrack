import { zodResolver } from '@hookform/resolvers/zod'
import { Info, X } from 'lucide-react'
import {
  useEffect,
  useState,
} from 'react'
import { useForm } from 'react-hook-form'

import { ApiClientError } from '../../../api/ApiClientError'

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
  'mt-2 block w-full rounded-xl border border-[#d8d6ce] ' +
  'bg-[#fffdf8] px-4 py-3 text-[#173c32] outline-none ' +
  'transition placeholder:text-[#98a39f] focus:border-[#39725d] ' +
  'focus:ring-2 focus:ring-[#39725d]/15 disabled:cursor-not-allowed ' +
  'disabled:bg-[#efede7] disabled:text-[#7a8984]'

export default function EditContributionModal({
  goal,
  contribution,
  onClose,
}: EditContributionModalProps) {
  const updateContribution =
    useUpdateGoalContribution()

  const [submitError, setSubmitError] =
    useState<string | null>(null)

  const canEditFinancialFields =
    goal.status === 'ACTIVE'

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<ContributionFormValues>({
    resolver: zodResolver(
      contributionFormSchema,
    ),

    defaultValues: {
      amount: contribution.amount,
      contributionDate:
        contribution.contributionDate,
      note: contribution.note ?? '',
    },
  })

  useEffect(() => {
    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (
        event.key === 'Escape' &&
        !isSubmitting
      ) {
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
  }, [isSubmitting, onClose])

  async function onSubmit(
    values: ContributionFormValues,
  ) {
    setSubmitError(null)

    try {
      await updateContribution.mutateAsync({
        goalId: goal.id,
        contributionId: contribution.id,

        payload: {
          version: contribution.version,
          note: values.note.trim(),

          ...(canEditFinancialFields
            ? {
              amount: values.amount,
              contributionDate:
                values.contributionDate,
            }
            : {}),
        },
      })

      onClose()
    } catch (error) {
      setSubmitError(
        error instanceof ApiClientError
          ? error.message
          : 'Unable to update this contribution.',
      )
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-5">
      <button
        type="button"
        disabled={isSubmitting}
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-[#102e27]/60 backdrop-blur-[2px] disabled:cursor-not-allowed"
        aria-label="Close contribution editor"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-contribution-title"
        className="relative w-full max-w-lg rounded-3xl bg-[#f7f5ef] p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
              CORRECT THE RECORD
            </p>

            <h2
              id="edit-contribution-title"
              className="mt-3 font-serif text-3xl text-[#173c32]"
            >
              Edit contribution
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer rounded-full border border-[#d8d6ce] p-2 text-[#657972] transition hover:bg-[#ebe9e3] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>

        {!canEditFinancialFields && (
          <div className="mt-5 flex gap-3 rounded-2xl bg-[#f2e7ca] p-4 text-sm leading-6 text-[#765527]">
            <Info
              size={18}
              className="mt-0.5 shrink-0"
              aria-hidden
            />

            <p>
              This goal is no longer active.
              You may correct the note, but its
              amount and date are locked.
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 space-y-5"
          noValidate
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="edit-contribution-amount"
                className="text-sm font-semibold text-[#173c32]"
              >
                Amount ({goal.currencyCode})
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
                className={fieldClasses}
                {...register('amount', {
                  setValueAs: (
                    value: string,
                  ) =>
                    value === ''
                      ? Number.NaN
                      : Number(value),
                })}
              />

              {errors.amount && (
                <p
                  className="mt-2 text-sm text-red-700"
                  role="alert"
                >
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="edit-contribution-date"
                className="text-sm font-semibold text-[#173c32]"
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
                  className="mt-2 text-sm text-red-700"
                  role="alert"
                >
                  {
                    errors.contributionDate
                      .message
                  }
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="edit-contribution-note"
              className="text-sm font-semibold text-[#173c32]"
            >
              Note

              <span className="ml-2 font-normal text-[#7a8984]">
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
                className="mt-2 text-sm text-red-700"
                role="alert"
              >
                {errors.note.message}
              </p>
            )}
          </div>

          {submitError && (
            <div
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {submitError}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-[#dedbd2] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer rounded-full border border-[#d8d6ce] px-5 py-2.5 text-sm font-semibold text-[#173c32] transition hover:bg-[#efede7] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer rounded-full bg-[#174f43] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#236a58] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? 'Saving…'
                : 'Save correction'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}