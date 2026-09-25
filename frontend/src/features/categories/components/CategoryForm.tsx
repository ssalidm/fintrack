import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import type { Category } from '@/features/categories/api/types'
import {
  useCreateCategory,
  useUpdateCategory,
} from '@/features/categories/hooks/useCategoryMutations'
import {
  categorySchema,
  type CategoryFormValues,
} from '@/features/categories/validation/categorySchema'

interface CategoryFormProps {
  category?: Category | null
  onCancel: () => void
  onSuccess: () => void
}

const fieldClasses =
  'w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink outline-none transition placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-accent/10 disabled:bg-surface-muted disabled:text-muted'

function getDefaultValues(
  category?: Category | null,
): CategoryFormValues {
  return {
    name:
      category?.name ?? '',
    categoryType:
      category?.categoryType ??
      'EXPENSE',
    displayOrder:
      category?.displayOrder ?? 0,
  }
}

export default function CategoryForm({
  category,
  onCancel,
  onSuccess,
}: CategoryFormProps) {
  const createCategory =
    useCreateCategory()

  const updateCategory =
    useUpdateCategory()

  const isEditing =
    Boolean(category)

  const isTemplateCategory =
    Boolean(
      category?.templateCode,
    )

  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
    },
  } =
    useForm<CategoryFormValues>(
      {
        resolver: zodResolver(
          categorySchema,
        ),
        defaultValues:
          getDefaultValues(
            category,
          ),
      },
    )

  useEffect(() => {
    reset(
      getDefaultValues(
        category,
      ),
    )
  }, [
    category,
    reset,
  ])

  const mutation =
    isEditing
      ? updateCategory
      : createCategory

  async function onSubmit(
    values: CategoryFormValues,
  ) {
    try {
      if (category) {
        await updateCategory.mutateAsync(
          {
            categoryId:
              category.id,
            request: {
              version:
                category.version,
              name:
                values.name,
              displayOrder:
                values.displayOrder,
              categoryType:
                isTemplateCategory
                  ? undefined
                  : values.categoryType,
            },
          },
        )
      } else {
        await createCategory.mutateAsync(
          {
            name:
              values.name,
            categoryType:
              values.categoryType,
            displayOrder:
              values.displayOrder,
          },
        )
      }

      onSuccess()
    } catch {
      // Mutation exposes the API error below.
    }
  }

  const errorMessage =
    mutation.error instanceof
    Error
      ? mutation.error.message
      : mutation.error
        ? 'Something went wrong. Please try again.'
        : null

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(
          onSubmit,
        )(event)
      }}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="category-name"
          className="type-label mb-2 block"
        >
          Category name
        </label>

        <input
          id="category-name"
          type="text"
          autoComplete="off"
          placeholder="For example, Groceries"
          {...register('name')}
          className={
            fieldClasses
          }
        />

        {errors.name && (
          <p className="mt-2 text-sm text-danger">
            {
              errors.name.message
            }
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="category-type"
          className="type-label mb-2 block"
        >
          Category type
        </label>

        {isTemplateCategory ? (
          <>
            <input
              type="hidden"
              {...register(
                'categoryType',
              )}
            />

            <div className={`${fieldClasses} bg-surface-muted`}>
              {category
                ?.categoryType ===
              'INCOME'
                ? 'Income'
                : 'Expense'}
            </div>

            <p className="type-caption mt-2">
              The type of a default
              Salif category cannot
              be changed.
            </p>
          </>
        ) : (
          <select
            id="category-type"
            {...register(
              'categoryType',
            )}
            className={`${fieldClasses} cursor-pointer pr-10`}
          >
            <option value="EXPENSE">
              Expense
            </option>
            <option value="INCOME">
              Income
            </option>
          </select>
        )}

        {errors.categoryType && (
          <p className="mt-2 text-sm text-danger">
            {
              errors.categoryType
                .message
            }
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="category-display-order"
          className="type-label mb-2 block"
        >
          Display order
        </label>

        <input
          id="category-display-order"
          type="number"
          min={0}
          max={32767}
          step={1}
          {...register(
            'displayOrder',
            {
              setValueAs: (
                value,
              ) =>
                value === ''
                  ? 0
                  : Number(
                      value,
                    ),
            },
          )}
          className={
            fieldClasses
          }
        />

        <p className="type-caption mt-2">
          Lower numbers appear first
          in category lists.
        </p>

        {errors.displayOrder && (
          <p className="mt-2 text-sm text-danger">
            {
              errors.displayOrder
                .message
            }
          </p>
        )}
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          {errorMessage}
        </div>
      )}

      <div className="flex justify-end gap-3 border-t border-line pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={
            mutation.isPending
          }
          className="cursor-pointer rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            mutation.isPending
          }
          className="cursor-pointer rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-inverse transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending
            ? 'Saving…'
            : isEditing
              ? 'Save changes'
              : 'Create category'}
        </button>
      </div>
    </form>
  )
}
