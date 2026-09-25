import { zodResolver } from '@hookform/resolvers/zod'
import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useForm } from 'react-hook-form'

import { ApiClientError } from '@/api/ApiClientError'
import { useCategories } from '@/features/categories/hooks/useCategories'
import type { BudgetCategoryLimit } from '@/features/budgets/api/types'
import {
  useAddBudgetLimit,
  useUpdateBudgetLimit,
} from '@/features/budgets/hooks/useBudgets'
import {
  budgetLimitSchema,
  type BudgetLimitFormValues,
} from '@/features/budgets/validation/budgetSchemas'

interface BudgetLimitFormProps {
  budgetId: string
  currencyCode: string
  limit?: BudgetCategoryLimit
  categoryName?: string
  unavailableCategoryIds?: string[]
  onCancel: () => void
  onSuccess: () => void
}

const fieldClasses =
  'mt-2 block w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink outline-none transition placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-accent/10 disabled:bg-surface-muted disabled:text-muted'

const noUnavailableCategories:
  string[] = []

const limitFormFields =
  new Set<
    keyof BudgetLimitFormValues
  >([
    'categoryId',
    'limitAmount',
  ])

function isLimitFormField(
  field: string,
): field is keyof BudgetLimitFormValues {
  return limitFormFields.has(
    field as keyof BudgetLimitFormValues,
  )
}

export default function BudgetLimitForm({
  budgetId,
  currencyCode,
  limit,
  categoryName,
  unavailableCategoryIds =
    noUnavailableCategories,
  onCancel,
  onSuccess,
}: BudgetLimitFormProps) {
  const [
    submitError,
    setSubmitError,
  ] = useState<string | null>(
    null,
  )

  const categoriesQuery =
    useCategories('EXPENSE')

  const addLimit =
    useAddBudgetLimit()

  const updateLimit =
    useUpdateBudgetLimit()

  const isEditing =
    limit !== undefined

  const categories = useMemo(
    () =>
      categoriesQuery.data ?? [],
    [categoriesQuery.data],
  )

  const selectableCategories =
    useMemo(() => {
      const unavailable =
        new Set(
          unavailableCategoryIds,
        )

      return categories.filter(
        (category) =>
          category.id ===
            limit?.categoryId ||
          !unavailable.has(
            category.id,
          ),
      )
    }, [
      categories,
      limit?.categoryId,
      unavailableCategoryIds,
    ])

  const currentCategoryIsArchived =
    Boolean(
      limit &&
        !categories.some(
          (category) =>
            category.id ===
            limit.categoryId,
        ),
    )

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<BudgetLimitFormValues>(
      {
        resolver: zodResolver(
          budgetLimitSchema,
        ),
        defaultValues: {
          categoryId:
            limit?.categoryId ??
            '',
          limitAmount:
            limit?.limitAmount ??
            0,
        },
      },
    )

  useEffect(() => {
    reset({
      categoryId:
        limit?.categoryId ??
        '',
      limitAmount:
        limit?.limitAmount ??
        0,
    })
  }, [
    limit,
    reset,
  ])

  async function onSubmit(
    values: BudgetLimitFormValues,
  ) {
    setSubmitError(null)

    try {
      if (limit) {
        await updateLimit.mutateAsync(
          {
            budgetId,
            limitId:
              limit.id,
            payload: {
              version:
                limit.version,
              categoryId:
                values.categoryId,
              limitAmount:
                values.limitAmount,
            },
          },
        )
      } else {
        await addLimit.mutateAsync(
          {
            budgetId,
            payload: {
              categoryId:
                values.categoryId,
              limitAmount:
                values.limitAmount,
            },
          },
        )
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
          'Unable to save this category limit.',
        )
        return
      }

      let hasFieldError =
        false

      if (
        error.validationErrors
      ) {
        Object.entries(
          error.validationErrors,
        ).forEach(
          ([field, message]) => {
            if (
              isLimitFormField(
                field,
              )
            ) {
              setError(
                field,
                {
                  type: 'server',
                  message,
                },
              )

              hasFieldError =
                true
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

  const noCategoriesAvailable =
    !isEditing &&
    !categoriesQuery.isPending &&
    selectableCategories.length ===
      0

  return (
    <form
      onSubmit={handleSubmit(
        onSubmit,
      )}
      className="space-y-6"
      noValidate
    >
      <div>
        <label
          htmlFor="budget-limit-category"
          className="type-label"
        >
          Expense category
        </label>

        {currentCategoryIsArchived ? (
          <>
            <input
              type="hidden"
              {...register(
                'categoryId',
              )}
            />

            <div
              className={`${fieldClasses} bg-surface-muted`}
            >
              {categoryName ??
                'Archived category'}
            </div>

            <p className="type-caption mt-2">
              This category is
              archived. You can still
              adjust its existing
              limit.
            </p>
          </>
        ) : (
          <select
            id="budget-limit-category"
            disabled={
              isSubmitting ||
              categoriesQuery.isPending ||
              noCategoriesAvailable
            }
            aria-invalid={
              errors.categoryId
                ? 'true'
                : 'false'
            }
            className={`${fieldClasses} cursor-pointer pr-10 disabled:cursor-not-allowed`}
            {...register(
              'categoryId',
            )}
          >
            <option value="">
              {categoriesQuery.isPending
                ? 'Loading categories…'
                : 'Choose a category'}
            </option>

            {selectableCategories.map(
              (category) => (
                <option
                  key={
                    category.id
                  }
                  value={
                    category.id
                  }
                >
                  {
                    category.name
                  }
                </option>
              ),
            )}
          </select>
        )}

        {errors.categoryId && (
          <p
            className="mt-2 text-sm text-danger"
            role="alert"
          >
            {
              errors.categoryId
                .message
            }
          </p>
        )}

        {categoriesQuery.isError && (
          <p
            className="mt-2 text-sm text-danger"
            role="alert"
          >
            Unable to load expense
            categories.
          </p>
        )}

        {noCategoriesAvailable && (
          <p className="mt-2 text-sm leading-6 text-warning">
            Every active expense
            category already has a
            limit in this budget.
            Create another expense
            category before adding
            one more.
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="budget-limit-amount"
          className="type-label"
        >
          Monthly limit (
          {currencyCode})
        </label>

        <input
          id="budget-limit-amount"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.0001"
          disabled={
            isSubmitting ||
            noCategoriesAvailable
          }
          aria-invalid={
            errors.limitAmount
              ? 'true'
              : 'false'
          }
          className={
            fieldClasses
          }
          {...register(
            'limitAmount',
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

        <p className="type-caption mt-2">
          Salif compares this amount
          with posted expenses during
          the budget month.
        </p>

        {errors.limitAmount && (
          <p
            className="mt-2 text-sm text-danger"
            role="alert"
          >
            {
              errors.limitAmount
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

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
          className="cursor-pointer rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            isSubmitting ||
            categoriesQuery.isPending ||
            noCategoriesAvailable
          }
          className="cursor-pointer rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-inverse transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? 'Saving…'
            : isEditing
              ? 'Save limit'
              : 'Add limit'}
        </button>
      </div>
    </form>
  )
}
