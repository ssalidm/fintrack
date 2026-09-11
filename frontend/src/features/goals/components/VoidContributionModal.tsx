import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertTriangle,
  X,
} from 'lucide-react'
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
import { useVoidGoalContribution } from '../hooks/useGoals'
import {
  voidContributionSchema,
  type VoidContributionFormValues,
} from '../validation/goalSchemas'

interface VoidContributionModalProps {
  goal: SavingsGoal
  contribution: GoalContribution
  onClose: () => void
}

const fieldClasses =
  'mt-2 block w-full rounded-xl border border-[#d8d6ce] ' +
  'bg-[#fffdf8] px-4 py-3 text-[#173c32] outline-none ' +
  'transition placeholder:text-[#98a39f] focus:border-[#9b5845] ' +
  'focus:ring-2 focus:ring-[#9b5845]/15'

export default function VoidContributionModal({
  goal,
  contribution,
  onClose,
}: VoidContributionModalProps) {
  const voidContribution =
    useVoidGoalContribution()

  const [submitError, setSubmitError] =
    useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<VoidContributionFormValues>({
    resolver: zodResolver(
      voidContributionSchema,
    ),

    defaultValues: {
      reason: '',
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
    values: VoidContributionFormValues,
  ) {
    setSubmitError(null)

    try {
      await voidContribution.mutateAsync({
        goalId: goal.id,
        contributionId: contribution.id,

        payload: {
          version: contribution.version,
          reason: values.reason.trim(),
        },
      })

      onClose()
    } catch (error) {
      setSubmitError(
        error instanceof ApiClientError
          ? error.message
          : 'Unable to void this contribution.',
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
        aria-label="Close void contribution form"
      />

      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="void-contribution-title"
        className="relative w-full max-w-md rounded-3xl bg-[#fffdf8] p-7 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-5 top-5 cursor-pointer rounded-full p-2 text-[#657972] transition hover:bg-[#efede7] disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Close"
        >
          <X size={19} />
        </button>

        <span className="grid size-12 place-items-center rounded-full bg-[#f2e7df] text-[#9b5845]">
          <AlertTriangle
            size={22}
            aria-hidden
          />
        </span>

        <h2
          id="void-contribution-title"
          className="mt-5 pr-8 font-serif text-3xl text-[#173c32]"
        >
          Void this contribution?
        </h2>

        <p className="mt-3 text-sm leading-6 text-[#657972]">
          The contribution will remain in the
          history but will no longer count
          towards {goal.name}.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6"
          noValidate
        >
          <label
            htmlFor="void-contribution-reason"
            className="text-sm font-semibold text-[#173c32]"
          >
            Reason
          </label>

          <textarea
            id="void-contribution-reason"
            rows={3}
            autoFocus
            disabled={isSubmitting}
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
              className="mt-2 text-sm text-red-700"
              role="alert"
            >
              {errors.reason.message}
            </p>
          )}

          {submitError && (
            <div
              className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {submitError}
            </div>
          )}

          <div className="mt-7 flex justify-end gap-3 border-t border-[#dedbd2] pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer rounded-full border border-[#d8d6ce] px-5 py-2.5 text-sm font-semibold text-[#173c32] transition hover:bg-[#efede7] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Keep it
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer rounded-full bg-[#9b5845] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#814735] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? 'Voiding…'
                : 'Void contribution'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}