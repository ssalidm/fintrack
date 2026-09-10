import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { ApiClientError } from '../../../api/ApiClientError'

import type { SavingsGoal } from '../api/types'
import {
  useCreateGoal,
  useUpdateGoal,
} from '../hooks/useGoals'
import {
  goalCurrencies,
  goalFormSchema,
  type GoalFormValues,
} from '../validation/goalSchemas'

interface GoalFormProps {
  goal?: SavingsGoal
  onCancel: () => void
  onSuccess: () => void
}

const currencyLabels = {
  ZAR: 'ZAR — South African Rand',
  USD: 'USD — United States Dollar',
  EUR: 'EUR — Euro',
  GBP: 'GBP — British Pound',
} satisfies Record<
  (typeof goalCurrencies)[number],
  string
>

const fieldClasses =
  'mt-2 block w-full rounded-xl border border-[#d8d6ce] ' +
  'bg-[#fffdf8] px-4 py-3 text-[#173c32] outline-none ' +
  'transition placeholder:text-[#98a39f] focus:border-[#39725d] ' +
  'focus:ring-2 focus:ring-[#39725d]/15 disabled:bg-[#efede7]'

const goalFormFields =
  new Set<keyof GoalFormValues>([
    'name',
    'description',
    'currencyCode',
    'targetAmount',
    'targetDate',
  ])

function isGoalFormField(
  field: string,
): field is keyof GoalFormValues {
  return goalFormFields.has(
    field as keyof GoalFormValues,
  )
}

export default function GoalForm({
  goal,
  onCancel,
  onSuccess,
}: GoalFormProps) {
  const [submitError, setSubmitError] =
    useState<string | null>(null)

  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()

  const isEditing = goal !== undefined

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),

    defaultValues: {
      name: goal?.name ?? '',
      description: goal?.description ?? '',
      currencyCode:
        (
          goal?.currencyCode as
          | GoalFormValues['currencyCode']
          | undefined
        ) ?? 'ZAR',
      targetAmount: goal?.targetAmount ?? 0,
      targetDate: goal?.targetDate ?? '',
    },
  })

  useEffect(() => {
    reset({
      name: goal?.name ?? '',
      description: goal?.description ?? '',
      currencyCode:
        (
          goal?.currencyCode as
          | GoalFormValues['currencyCode']
          | undefined
        ) ?? 'ZAR',
      targetAmount: goal?.targetAmount ?? 0,
      targetDate: goal?.targetDate ?? '',
    })
  }, [goal, reset])

  async function onSubmit(
    values: GoalFormValues,
  ) {
    setSubmitError(null)

    const description =
      values.description.trim()

    try {
      if (goal) {
        await updateGoal.mutateAsync({
          goalId: goal.id,

          payload: {
            version: goal.version,
            name: values.name.trim(),
            description,
            targetAmount:
              values.targetAmount,
            targetDate:
              values.targetDate || undefined,
            clearTargetDate:
              goal.targetDate !== null &&
              values.targetDate === '',
          },
        })
      } else {
        await createGoal.mutateAsync({
          name: values.name.trim(),
          description:
            description || undefined,
          currencyCode:
            values.currencyCode,
          targetAmount:
            values.targetAmount,
          targetDate:
            values.targetDate || undefined,
        })
      }

      onSuccess()
    } catch (error) {
      if (!(error instanceof ApiClientError)) {
        setSubmitError(
          'Something went wrong. Please try again.',
        )
        return
      }

      let hasFieldError = false

      if (error.validationErrors) {
        Object.entries(
          error.validationErrors,
        ).forEach(([field, message]) => {
          if (isGoalFormField(field)) {
            setError(field, {
              type: 'server',
              message,
            })

            hasFieldError = true
          }
        })
      }

      if (!hasFieldError) {
        setSubmitError(
          error.isNetworkError
            ? 'We couldn’t connect to Salif right now. Please try again in a moment.'
            : error.message,
        )
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      noValidate
    >
      <div>
        <label
          htmlFor="goal-name"
          className="text-sm font-semibold text-[#173c32]"
        >
          Goal name
        </label>

        <input
          id="goal-name"
          type="text"
          autoComplete="off"
          placeholder="For example, Rainy day fund"
          disabled={isSubmitting}
          aria-invalid={
            errors.name ? 'true' : 'false'
          }
          className={fieldClasses}
          {...register('name')}
        />

        {errors.name && (
          <p
            className="mt-2 text-sm text-red-700"
            role="alert"
          >
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="goal-description"
          className="text-sm font-semibold text-[#173c32]"
        >
          A note to your future self
        </label>

        <textarea
          id="goal-description"
          rows={3}
          placeholder="What will reaching this goal make possible?"
          disabled={isSubmitting}
          aria-invalid={
            errors.description
              ? 'true'
              : 'false'
          }
          className={`${fieldClasses} resize-none`}
          {...register('description')}
        />

        {errors.description && (
          <p
            className="mt-2 text-sm text-red-700"
            role="alert"
          >
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="goal-currency"
            className="text-sm font-semibold text-[#173c32]"
          >
            Currency
          </label>

          {isEditing ? (
            <>
              <input
                type="hidden"
                {...register('currencyCode')}
              />

              <div
                className={`${fieldClasses} bg-[#efede7]`}
              >
                {
                  currencyLabels[
                  goal.currencyCode as
                  GoalFormValues['currencyCode']
                  ] ?? goal.currencyCode
                }
              </div>

              <p className="mt-2 text-xs leading-5 text-[#657972]">
                Currency cannot be changed after
                creating a goal.
              </p>
            </>
          ) : (
            <span className="relative block">
              <select
                id="goal-currency"
                disabled={isSubmitting}
                aria-invalid={
                  errors.currencyCode
                    ? 'true'
                    : 'false'
                }
                className={`${fieldClasses} cursor-pointer appearance-none pr-11`}
                {...register('currencyCode')}
              >
                {goalCurrencies.map(
                  (currency) => (
                    <option
                      key={currency}
                      value={currency}
                    >
                      {currencyLabels[currency]}
                    </option>
                  ),
                )}
              </select>

              <ChevronDown
                size={17}
                aria-hidden
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#657972]"
              />
            </span>
          )}

          {errors.currencyCode && (
            <p
              className="mt-2 text-sm text-red-700"
              role="alert"
            >
              {errors.currencyCode.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="goal-target"
            className="text-sm font-semibold text-[#173c32]"
          >
            Target amount
          </label>

          <input
            id="goal-target"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.0001"
            disabled={isSubmitting}
            aria-invalid={
              errors.targetAmount
                ? 'true'
                : 'false'
            }
            className={fieldClasses}
            {...register('targetAmount', {
              setValueAs: (
                value: string,
              ) =>
                value === ''
                  ? Number.NaN
                  : Number(value),
            })}
          />

          {errors.targetAmount && (
            <p
              className="mt-2 text-sm text-red-700"
              role="alert"
            >
              {errors.targetAmount.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="goal-target-date"
          className="text-sm font-semibold text-[#173c32]"
        >
          Target date

          <span className="ml-2 font-normal text-[#7a8984]">
            Optional
          </span>
        </label>

        <input
          id="goal-target-date"
          type="date"
          disabled={isSubmitting}
          className={`${fieldClasses} cursor-pointer`}
          {...register('targetDate')}
        />

        <p className="mt-2 text-xs leading-5 text-[#657972]">
          A target date gives the goal direction
          without making it rigid.
        </p>
      </div>

      {submitError && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {submitError}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-[#dedbd2] pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
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
            ? isEditing
              ? 'Saving…'
              : 'Creating…'
            : isEditing
              ? 'Save changes'
              : 'Create goal'}
        </button>
      </div>
    </form>
  )
}