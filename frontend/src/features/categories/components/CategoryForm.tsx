import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { Category } from '../api/types'
import {
  useCreateCategory,
  useUpdateCategory,
} from '../hooks/useCategoryMutations'
import {
  categorySchema,
  type CategoryFormValues,
} from '../validation/categorySchema'

interface CategoryFormProps {
  category?: Category | null
  onCancel: () => void
  onSuccess: () => void
}

function getDefaultValues(
  category?: Category | null,
): CategoryFormValues {
  return {
    name: category?.name ?? '',
    categoryType: category?.categoryType ?? 'EXPENSE',
    displayOrder: category?.displayOrder ?? 0,
  }
}

export default function CategoryForm({
                                       category,
                                       onCancel,
                                       onSuccess,
                                     }: CategoryFormProps) {
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()

  const isEditing = Boolean(category)
  const isTemplateCategory = Boolean(category?.templateCode)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: getDefaultValues(category),
  })

  useEffect(() => {
    reset(getDefaultValues(category))
  }, [category, reset])

  const mutation = isEditing
    ? updateCategory
    : createCategory

  async function onSubmit(values: CategoryFormValues) {
    try {
      if (category) {
        await updateCategory.mutateAsync({
          categoryId: category.id,
          request: {
            version: category.version,
            name: values.name,
            displayOrder: values.displayOrder,
            categoryType: isTemplateCategory
              ? undefined
              : values.categoryType,
          },
        })
      } else {
        await createCategory.mutateAsync({
          name: values.name,
          categoryType: values.categoryType,
          displayOrder: values.displayOrder,
        })
      }

      onSuccess()
    } catch {
      // The mutation exposes the API error in the form.
    }
  }

  const errorMessage =
    mutation.error instanceof Error
      ? mutation.error.message
      : mutation.error
        ? 'Something went wrong. Please try again.'
        : null

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event)
      }}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="category-name"
          className="mb-2 block text-sm font-semibold text-[#173c32]"
        >
          Category name
        </label>

        <input
          id="category-name"
          type="text"
          autoComplete="off"
          placeholder="For example, Groceries"
          {...register('name')}
          className="w-full rounded-xl border border-[#d8d4c9] bg-white px-4 py-3 text-[#173c32] outline-none transition focus:border-[#2b7d67] focus:ring-2 focus:ring-[#2b7d67]/15"
        />

        {errors.name && (
          <p className="mt-2 text-sm text-[#a94d3c]">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="category-type"
          className="mb-2 block text-sm font-semibold text-[#173c32]"
        >
          Category type
        </label>

        {isTemplateCategory ? (
          <>
            <input
              type="hidden"
              {...register('categoryType')}
            />

            <div className="rounded-xl border border-[#d8d4c9] bg-[#f1efe8] px-4 py-3 text-[#5f706a]">
              {category?.categoryType === 'INCOME'
                ? 'Income'
                : 'Expense'}
            </div>

            <p className="mt-2 text-xs leading-5 text-[#6d7974]">
              The type of a default Salif category cannot be changed.
            </p>
          </>
        ) : (
          <select
            id="category-type"
            {...register('categoryType')}
            className="w-full rounded-xl border border-[#d8d4c9] bg-white px-4 py-3 text-[#173c32] outline-none transition focus:border-[#2b7d67] focus:ring-2 focus:ring-[#2b7d67]/15"
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        )}

        {errors.categoryType && (
          <p className="mt-2 text-sm text-[#a94d3c]">
            {errors.categoryType.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="category-display-order"
          className="mb-2 block text-sm font-semibold text-[#173c32]"
        >
          Display order
        </label>

        <input
          id="category-display-order"
          type="number"
          min={0}
          max={32767}
          step={1}
          {...register('displayOrder', {
            valueAsNumber: true,
          })}
          className="w-full rounded-xl border border-[#d8d4c9] bg-white px-4 py-3 text-[#173c32] outline-none transition focus:border-[#2b7d67] focus:ring-2 focus:ring-[#2b7d67]/15"
        />

        <p className="mt-2 text-xs leading-5 text-[#6d7974]">
          Lower numbers appear first in category lists.
        </p>

        {errors.displayOrder && (
          <p className="mt-2 text-sm text-[#a94d3c]">
            {errors.displayOrder.message}
          </p>
        )}
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl border border-[#e8c8bf] bg-[#fff4f1] px-4 py-3 text-sm text-[#8f3f30]"
        >
          {errorMessage}
        </div>
      )}

      <div className="flex justify-end gap-3 border-t border-[#e2ded4] pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={mutation.isPending}
          className="cursor-pointer rounded-full border border-[#cbc7bc] px-5 py-2.5 text-sm font-semibold text-[#173c32] transition hover:bg-[#efede6] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="cursor-pointer rounded-full bg-[#174f43] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#216555] disabled:cursor-not-allowed disabled:opacity-60"
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
