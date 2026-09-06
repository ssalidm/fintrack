import { useState } from 'react'
import {
  Archive,
  BadgeDollarSign,
  CircleArrowDown,
  CircleArrowUp,
  LoaderCircle,
  Pencil,
  Plus,
  Tags,
} from 'lucide-react'
import type {
  Category,
  CategoryStatus,
  CategoryType,
} from '../api/types'
import CategoryModal from '../components/CategoryModal'
import { useArchiveCategory } from '../hooks/useCategoryMutations'
import { useCategories } from '../hooks/useCategories'
import CategorySpendingChart from '../components/CategorySpendingChart'

interface CategoryRowProps {
  category: Category
  onArchive: (category: Category) => void
  onEdit: (category: Category) => void
}

function CategoryRow({
  category,
  onArchive,
  onEdit,
}: CategoryRowProps) {
  const isArchived = category.status === 'ARCHIVED'

  return (
    <li className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <span
          className={[
            'grid size-11 shrink-0 place-items-center rounded-2xl',
            category.categoryType === 'INCOME'
              ? 'bg-[#deeee3] text-[#276b56]'
              : 'bg-[#f3e6ce] text-[#98712f]',
          ].join(' ')}
        >
          {category.categoryType === 'INCOME' ? (
            <CircleArrowUp size={20} aria-hidden />
          ) : (
            <CircleArrowDown size={20} aria-hidden />
          )}
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold text-[#173c32]">
              {category.name}
            </p>

            {category.templateCode && (
              <span className="rounded-full bg-[#edf0e9] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#62726b]">
                Salif default
              </span>
            )}

            {isArchived && (
              <span className="rounded-full bg-[#eee9e2] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#796f65]">
                Archived
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-[#738079]">
            {category.categoryType === 'INCOME'
              ? 'Money coming in'
              : 'Money going out'}
            <span aria-hidden> · </span>
            Position {category.displayOrder}
          </p>
        </div>
      </div>

      {!isArchived && (
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#d7d3c9] px-4 py-2 text-sm font-semibold text-[#173c32] transition hover:bg-[#efede6]"
          >
            <Pencil size={15} aria-hidden />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onArchive(category)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[#9b4f3f] transition hover:bg-[#f7e9e5]"
          >
            <Archive size={15} aria-hidden />
            Archive
          </button>
        </div>
      )}
    </li>
  )
}

export default function CategoriesPage() {
  const [categoryType, setCategoryType] =
    useState<CategoryType>('EXPENSE')
  const [status, setStatus] =
    useState<CategoryStatus>('ACTIVE')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null)
  const [archiveTarget, setArchiveTarget] =
    useState<Category | null>(null)

  const categoriesQuery = useCategories(categoryType, status)
  const archiveCategory = useArchiveCategory()

  function openCreateModal() {
    setSelectedCategory(null)
    setIsModalOpen(true)
  }

  function openEditModal(category: Category) {
    setSelectedCategory(category)
    setIsModalOpen(true)
  }

  function closeCategoryModal() {
    setIsModalOpen(false)
    setSelectedCategory(null)
  }

  async function confirmArchive() {
    if (!archiveTarget) {
      return
    }

    try {
      await archiveCategory.mutateAsync({
        categoryId: archiveTarget.id,
        request: {
          version: archiveTarget.version,
        },
      })

      setArchiveTarget(null)
    } catch {
      // The mutation exposes the API error below.
    }
  }

  const archiveError =
    archiveCategory.error instanceof Error
      ? archiveCategory.error.message
      : archiveCategory.error
        ? 'The category could not be archived.'
        : null

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6c7973]">
              Your money, your language
            </p>

            <h1 className="mt-3 font-serif text-4xl tracking-tight text-[#173c32] sm:text-5xl">
              Categories
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#69756f] sm:text-base">
              Keep income and spending organised in a way that feels
              natural to you.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex cursor-pointer items-center justify-center gap-2 self-start rounded-full bg-[#174f43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#216555]"
          >
            <Plus size={18} aria-hidden />
            New category
          </button>
        </header>

        {categoryType === 'EXPENSE' && status === 'ACTIVE' && (
          <div className="mt-8">
            <CategorySpendingChart />
          </div>
        )}

        <section className="mt-10 rounded-[1.75rem] border border-[#dedbd2] bg-[#fbfaf6] shadow-[0_14px_40px_rgba(36,64,54,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
  <div className="max-w-full overflow-x-auto">
    <div
      className="inline-flex w-max rounded-full bg-[#eceae2] p-1"
      role="tablist"
      aria-label="Category type"
    >
      {(['EXPENSE', 'INCOME'] as CategoryType[]).map(
        (type) => (
          <button
            key={type}
            type="button"
            role="tab"
            aria-selected={categoryType === type}
            onClick={() => setCategoryType(type)}
            className={[
              'cursor-pointer whitespace-nowrap rounded-full px-4 py-2',
              'text-xs font-semibold transition',
              categoryType === type
                ? 'bg-[#174f43] text-white shadow-sm'
                : 'text-[#69756f] hover:text-[#173c32]',
            ].join(' ')}
          >
            {type === 'EXPENSE' ? 'Expenses' : 'Income'}
          </button>
        ),
      )}
    </div>
  </div>

  <div
    className="inline-flex rounded-full border border-[#dedbd2] bg-white p-1"
    aria-label="Category status"
  >
    {(['ACTIVE', 'ARCHIVED'] as CategoryStatus[]).map(
      (categoryStatus) => (
        <button
          key={categoryStatus}
          type="button"
          aria-pressed={status === categoryStatus}
          onClick={() => setStatus(categoryStatus)}
          className={[
            'cursor-pointer rounded-full px-3.5 py-2',
            'text-xs font-semibold transition',
            status === categoryStatus
              ? 'bg-[#deebe1] text-[#174f43]'
              : 'text-[#748079] hover:text-[#173c32]',
          ].join(' ')}
        >
          {categoryStatus === 'ACTIVE'
            ? 'Active'
            : 'Archived'}
        </button>
      ),
    )}
  </div>
</div>

          {categoriesQuery.isPending && (
            <div className="grid min-h-72 place-items-center">
              <div className="text-center text-[#66746e]">
                <LoaderCircle
                  className="mx-auto animate-spin"
                  size={28}
                  aria-hidden
                />
                <p className="mt-3 text-sm">
                  Gathering your categories…
                </p>
              </div>
            </div>
          )}

          {categoriesQuery.isError && (
            <div className="m-6 rounded-2xl border border-[#e8c8bf] bg-[#fff4f1] px-5 py-4">
              <p className="font-semibold text-[#8f3f30]">
                We couldn’t load your categories.
              </p>

              <p className="mt-1 text-sm text-[#9b5a4d]">
                {categoriesQuery.error instanceof Error
                  ? categoriesQuery.error.message
                  : 'Please try again.'}
              </p>

              <button
                type="button"
                onClick={() => {
                  void categoriesQuery.refetch()
                }}
                className="mt-3 cursor-pointer text-sm font-semibold text-[#174f43] underline underline-offset-4"
              >
                Try again
              </button>
            </div>
          )}

          {categoriesQuery.isSuccess &&
            categoriesQuery.data.length === 0 && (
              <div className="grid min-h-72 place-items-center px-6 py-12 text-center">
                <div>
                  <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#e4ede7] text-[#276b56]">
                    <Tags size={24} aria-hidden />
                  </span>

                  <h2 className="mt-5 font-serif text-2xl text-[#173c32]">
                    No {status.toLowerCase()} categories
                  </h2>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-[#69756f]">
                    {status === 'ACTIVE'
                      ? 'Create a category to start organising your transactions.'
                      : 'Categories you archive will appear here.'}
                  </p>
                </div>
              </div>
            )}

          {categoriesQuery.isSuccess &&
            categoriesQuery.data.length > 0 && (
              <ul className="divide-y divide-[#e5e1d7]">
                {categoriesQuery.data.map((category) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    onEdit={openEditModal}
                    onArchive={(target) => {
                      archiveCategory.reset()
                      setArchiveTarget(target)
                    }}
                  />
                ))}
              </ul>
            )}
        </section>

        <aside className="mt-6 flex items-start gap-3 rounded-2xl bg-[#deebe1] px-5 py-4 text-[#275f50]">
          <BadgeDollarSign
            className="mt-0.5 shrink-0"
            size={19}
            aria-hidden
          />

          <p className="text-sm leading-6">
            Default Salif categories can be renamed or reordered, but
            their income or expense type cannot be changed.
          </p>
        </aside>
      </div>

      <CategoryModal
        category={selectedCategory}
        isOpen={isModalOpen}
        onClose={closeCategoryModal}
      />

      {archiveTarget && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-[#0d2e27]/45 px-4 backdrop-blur-sm">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="archive-category-title"
            className="w-full max-w-md rounded-[1.75rem] border border-[#dedbd2] bg-[#fbfaf6] p-7 shadow-2xl"
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-[#f7e6e1] text-[#9b4f3f]">
              <Archive size={21} aria-hidden />
            </span>

            <h2
              id="archive-category-title"
              className="mt-5 font-serif text-3xl text-[#173c32]"
            >
              Archive {archiveTarget.name}?
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#69756f]">
              It will no longer be available for new transactions.
              Existing transaction history will remain unchanged.
            </p>

            {archiveError && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-[#e8c8bf] bg-[#fff4f1] px-4 py-3 text-sm text-[#8f3f30]"
              >
                {archiveError}
              </p>
            )}

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                disabled={archiveCategory.isPending}
                onClick={() => setArchiveTarget(null)}
                className="cursor-pointer rounded-full border border-[#cbc7bc] px-5 py-2.5 text-sm font-semibold text-[#173c32] transition hover:bg-[#efede6] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Keep category
              </button>

              <button
                type="button"
                disabled={archiveCategory.isPending}
                onClick={() => {
                  void confirmArchive()
                }}
                className="cursor-pointer rounded-full bg-[#9b4f3f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7f3e32] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {archiveCategory.isPending
                  ? 'Archiving…'
                  : 'Archive'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
