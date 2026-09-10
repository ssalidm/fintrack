import {zodResolver} from '@hookform/resolvers/zod'
import {
  useEffect,
  useState,
} from 'react'
import {useForm} from 'react-hook-form'

import {ApiClientError} from '../../../api/ApiClientError'

import type {BudgetSummary} from '../api/types'
import {
  useCreateBudget,
  useUpdateBudget,
} from '../hooks/useBudgets'
import {
  budgetCurrencies,
  budgetFormSchema,
  type BudgetFormValues,
} from '../validation/budgetSchemas'

interface BudgetFormProps {
  budget?: BudgetSummary
  onCancel: () => void
  onSuccess: () => void
}

const currencyLabels = {
  ZAR: 'ZAR — South African Rand',
  USD: 'USD — United States Dollar',
  EUR: 'EUR — Euro',
  GBP: 'GBP — British Pound',
} satisfies Record<
  (typeof budgetCurrencies)[number],
  string
>

const fieldClasses =
  'mt-2 block w-full rounded-xl border border-[#d8d6ce] ' +
  'bg-[#fffdf8] px-4 py-3 text-[#173c32] outline-none ' +
  'transition placeholder:text-[#98a39f] focus:border-[#39725d] ' +
  'focus:ring-2 focus:ring-[#39725d]/15 disabled:bg-[#efede7]'

const budgetFormFields =
  new Set<keyof BudgetFormValues>([
    'name',
    'budgetMonth',
    'currencyCode',
  ])

function isBudgetFormField(
  field: string,
): field is keyof BudgetFormValues {
  return budgetFormFields.has(
    field as keyof BudgetFormValues,
  )
}

function currentMonth() {
  const date = new Date()

  const localDate = new Date(
    date.getTime() -
      date.getTimezoneOffset() *
        60_000,
  )

  return localDate
    .toISOString()
    .slice(0, 7)
}

function getDefaultValues(
  budget?: BudgetSummary,
): BudgetFormValues {
  return {
    name: budget?.name ?? '',

    budgetMonth:
      budget?.budgetMonth.slice(0, 7) ??
      currentMonth(),

    currencyCode:
      (
        budget?.currencyCode as
          | BudgetFormValues['currencyCode']
          | undefined
      ) ?? 'ZAR',
  }
}

function formatMonth(value: string) {
  const [year, month] = value
    .slice(0, 7)
    .split('-')
    .map(Number)

  return new Intl.DateTimeFormat(
    'en-ZA',
    {
      month: 'long',
      year: 'numeric',
    },
  ).format(
    new Date(year, month - 1, 1),
  )
}

export default function BudgetForm({
  budget,
  onCancel,
  onSuccess,
}: BudgetFormProps) {
  const [
    submitError,
    setSubmitError,
  ] = useState<string | null>(null)

  const createBudget =
    useCreateBudget()
  const updateBudget =
    useUpdateBudget()

  const isEditing =
    budget !== undefined

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(
      budgetFormSchema,
    ),
    defaultValues:
      getDefaultValues(budget),
  })

  useEffect(() => {
    reset(getDefaultValues(budget))
  }, [budget, reset])

  async function onSubmit(
    values: BudgetFormValues,
  ) {
    setSubmitError(null)

    try {
      if (budget) {
        await updateBudget.mutateAsync({
          budgetId: budget.id,

          payload: {
            version: budget.version,
            name: values.name.trim(),
          },
        })
      } else {
        await createBudget.mutateAsync({
          name: values.name.trim(),
          budgetMonth:
            `${values.budgetMonth}-01`,
          currencyCode:
            values.currencyCode,
        })
      }

      onSuccess()
    } catch (error) {
      if (
        !(
          error instanceof
          ApiClientError
        )
      ) {
        setSubmitError(
          'Something went wrong. Please try again.',
        )
        return
      }

      let hasFieldError = false

      if (error.validationErrors) {
        Object.entries(
          error.validationErrors,
        ).forEach(
          ([field, message]) => {
            if (
              isBudgetFormField(field)
            ) {
              setError(field, {
                type: 'server',
                message,
              })

              hasFieldError = true
            }
          },
        )
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
          htmlFor="budget-name"
          className="text-sm font-semibold text-[#173c32]"
        >
          Budget name
        </label>

        <input
          id="budget-name"
          type="text"
          autoComplete="off"
          autoFocus
          placeholder="For example, September plan"
          disabled={isSubmitting}
          aria-invalid={
            errors.name
              ? 'true'
              : 'false'
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

      {isEditing ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-[#173c32]">
              Budget month
            </p>

            <input
              type="hidden"
              {...register(
                'budgetMonth',
              )}
            />

            <div
              className={`${fieldClasses} bg-[#efede7]`}
            >
              {formatMonth(
                budget.budgetMonth,
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-[#173c32]">
              Currency
            </p>

            <input
              type="hidden"
              {...register(
                'currencyCode',
              )}
            />

            <div
              className={`${fieldClasses} bg-[#efede7]`}
            >
              {budget.currencyCode}
            </div>
          </div>

          <p className="text-xs leading-5 text-[#657972] sm:col-span-2">
            Month and currency stay fixed
            so spending remains
            comparable.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="budget-month"
              className="text-sm font-semibold text-[#173c32]"
            >
              Budget month
            </label>

            <input
              id="budget-month"
              type="month"
              disabled={isSubmitting}
              aria-invalid={
                errors.budgetMonth
                  ? 'true'
                  : 'false'
              }
              className={`${fieldClasses} cursor-pointer`}
              {...register(
                'budgetMonth',
              )}
            />

            {errors.budgetMonth && (
              <p
                className="mt-2 text-sm text-red-700"
                role="alert"
              >
                {
                  errors.budgetMonth
                    .message
                }
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="budget-currency"
              className="text-sm font-semibold text-[#173c32]"
            >
              Currency
            </label>

            <select
              id="budget-currency"
              disabled={isSubmitting}
              aria-invalid={
                errors.currencyCode
                  ? 'true'
                  : 'false'
              }
              className={`${fieldClasses} cursor-pointer`}
              {...register(
                'currencyCode',
              )}
            >
              {budgetCurrencies.map(
                (currency) => (
                  <option
                    key={currency}
                    value={currency}
                  >
                    {
                      currencyLabels[
                        currency
                      ]
                    }
                  </option>
                ),
              )}
            </select>

            {errors.currencyCode && (
              <p
                className="mt-2 text-sm text-red-700"
                role="alert"
              >
                {
                  errors.currencyCode
                    .message
                }
              </p>
            )}
          </div>
        </div>
      )}

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
            ? 'Saving…'
            : isEditing
              ? 'Save changes'
              : 'Create budget'}
        </button>
      </div>
    </form>
  )
}