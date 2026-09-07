import {zodResolver} from '@hookform/resolvers/zod'
import {Info, X} from 'lucide-react'
import {
  useEffect,
  useState,
} from 'react'
import {useForm} from 'react-hook-form'

import {ApiClientError} from '../../../api/ApiClientError'

import type {SavingsGoal} from '../api/types'
import {useAddGoalContribution} from '../hooks/useGoals'
import {
  contributionFormSchema,
  type ContributionFormValues,
} from '../validation/goalSchemas'

interface ContributionModalProps {
  goal: SavingsGoal
  onClose: () => void
}

function today() {
  const date = new Date()

  const localDate = new Date(
    date.getTime() -
      date.getTimezoneOffset() * 60_000,
  )

  return localDate.toISOString().slice(0, 10)
}

const fieldClasses =
  'mt-2 block w-full rounded-xl border border-[#d8d6ce] ' +
  'bg-[#fffdf8] px-4 py-3 text-[#173c32] outline-none ' +
  'transition placeholder:text-[#98a39f] focus:border-[#39725d] ' +
  'focus:ring-2 focus:ring-[#39725d]/15'

export default function ContributionModal({
  goal,
  onClose,
}: ContributionModalProps) {
  const addContribution =
    useAddGoalContribution()

  const [submitError, setSubmitError] =
    useState<string | null>(null)

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
      amount: 0,
      contributionDate: today(),
      note: '',
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
      await addContribution.mutateAsync({
        goalId: goal.id,

        payload: {
          amount: values.amount,
          contributionDate:
            values.contributionDate,
          note:
            values.note.trim() || undefined,
        },
      })

      onClose()
    } catch (error) {
      setSubmitError(
        error instanceof ApiClientError
          ? error.message
          : 'Unable to add this contribution.',
      )
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-5">
      <button
        type="button"
        disabled={isSubmitting}
        className="absolute inset-0 cursor-pointer bg-[#102e27]/55 backdrop-blur-[2px] disabled:cursor-not-allowed"
        onClick={onClose}
        aria-label="Close contribution form"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="contribution-title"
        className="relative w-full max-w-lg rounded-3xl bg-[#f7f5ef] p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
              A STEP CLOSER
            </p>

            <h2
              id="contribution-title"
              className="mt-3 font-serif text-3xl text-[#173c32]"
            >
              Add to {goal.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer rounded-full border border-[#d8d6ce] p-2 text-[#657972] transition hover:bg-[#ebe9e3] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Close"
          >
            <X size={19}/>
          </button>
        </div>

        <div className="mt-5 flex gap-3 rounded-2xl bg-[#e6efe9] p-4 text-sm leading-6 text-[#47665c]">
          <Info
            size={18}
            className="mt-0.5 shrink-0"
            aria-hidden
          />

          <p>
            This records savings progress. It
            does not move money between your
            Salif accounts.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 space-y-5"
          noValidate
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="contribution-amount"
                className="text-sm font-semibold text-[#173c32]"
              >
                Amount ({goal.currencyCode})
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
                htmlFor="contribution-date"
                className="text-sm font-semibold text-[#173c32]"
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
              htmlFor="contribution-note"
              className="text-sm font-semibold text-[#173c32]"
            >
              Note

              <span className="ml-2 font-normal text-[#7a8984]">
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
                ? 'Adding…'
                : 'Add contribution'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}