import { useState } from 'react'
import {
  Archive,
  BadgeDollarSign,
  CircleArrowDown,
  CircleArrowUp,
  Pencil,
  Plus,
  Tags,
} from 'lucide-react'

import RefreshButton from '../../../components/actions/RefreshButton'
import PageHeader from '../../../components/layout/PageHeader'
import PageShell from '../../../components/layout/PageShell'
import StatusTabs from '../../../components/navigation/StatusTabs'
import ConfirmationDialog from '../../../components/ui/ConfirmationDialog'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorPanel from '../../../components/ui/ErrorPanel'
import type {
  Category,
  CategoryStatus,
  CategoryType,
} from '../api/types'
import CategoryModal from '../components/CategoryModal'
import CategorySpendingChart from '../components/CategorySpendingChart'
import { useCategories } from '../hooks/useCategories'
import { useArchiveCategory } from '../hooks/useCategoryMutations'

const typeOptions = [
  {
    value: 'EXPENSE',
    label: 'Expenses',
  },
  {
    value: 'INCOME',
    label: 'Income',
  },
] satisfies Array<{
  value: CategoryType
  label: string
}>

const statusOptions = [
  {
    value: 'ACTIVE',
    label: 'Active',
  },
  {
    value: 'ARCHIVED',
    label: 'Archived',
  },
] satisfies Array<{
  value: CategoryStatus
  label: string
}>

interface CategoryRowProps {
  category: Category
  onArchive: (
    category: Category,
  ) => void
  onEdit: (
    category: Category,
  ) => void
}

function CategoryRow({
  category,
  onArchive,
  onEdit,
}: CategoryRowProps) {
  const isArchived =
    category.status ===
    'ARCHIVED'

  const isIncome =
    category.categoryType ===
    'INCOME'

  return (
    <li className="flex flex-col gap-4 px-5 py-4 transition hover:bg-surface-muted/35 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-xl ${
            isIncome
              ? 'bg-success-soft text-success'
              : 'bg-warning-soft text-warning'
          }`}
        >
          {isIncome ? (
            <CircleArrowUp
              size={17}
              aria-hidden
            />
          ) : (
            <CircleArrowDown
              size={17}
              aria-hidden
            />
          )}
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-ink">
              {category.name}
            </p>

            {category.templateCode && (
              <span className="rounded-full bg-surface-strong px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-muted">
                Salif default
              </span>
            )}

            {isArchived && (
              <span className="rounded-full bg-surface-strong px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-muted">
                Archived
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-subtle">
            {isIncome
              ? 'Money coming in'
              : 'Money going out'}
            {' · '}
            Position{' '}
            {category.displayOrder}
          </p>
        </div>
      </div>

      {!isArchived && (
        <div className="flex items-center gap-1 self-end sm:self-auto">
          <button
            type="button"
            onClick={() =>
              onEdit(category)
            }
            className="grid size-8 cursor-pointer place-items-center rounded-full text-muted transition hover:bg-accent-soft hover:text-accent"
            aria-label={`Edit ${category.name}`}
            title="Edit category"
          >
            <Pencil
              size={15}
              aria-hidden
            />
          </button>

          <button
            type="button"
            onClick={() =>
              onArchive(
                category,
              )
            }
            className="grid size-8 cursor-pointer place-items-center rounded-full text-muted transition hover:bg-danger-soft hover:text-danger"
            aria-label={`Archive ${category.name}`}
            title="Archive category"
          >
            <Archive
              size={15}
              aria-hidden
            />
          </button>
        </div>
      )}
    </li>
  )
}

export default function CategoriesPage() {
  const [
    categoryType,
    setCategoryType,
  ] =
    useState<CategoryType>(
      'EXPENSE',
    )

  const [
    status,
    setStatus,
  ] =
    useState<CategoryStatus>(
      'ACTIVE',
    )

  const [
    isModalOpen,
    setIsModalOpen,
  ] = useState(false)

  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState<Category | null>(
      null,
    )

  const [
    archiveTarget,
    setArchiveTarget,
  ] =
    useState<Category | null>(
      null,
    )

  const categoriesQuery =
    useCategories(
      categoryType,
      status,
    )

  const archiveCategory =
    useArchiveCategory()

  function openCreateModal() {
    setSelectedCategory(null)
    setIsModalOpen(true)
  }

  function openEditModal(
    category: Category,
  ) {
    setSelectedCategory(
      category,
    )
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
      await archiveCategory.mutateAsync(
        {
          categoryId:
            archiveTarget.id,
          request: {
            version:
              archiveTarget.version,
          },
        },
      )

      setArchiveTarget(null)
    } catch {
      // Mutation exposes its error below.
    }
  }

  const archiveError =
    archiveCategory.error instanceof
    Error
      ? archiveCategory.error
          .message
      : archiveCategory.error
        ? 'The category could not be archived.'
        : null

  return (
    <PageShell>
      <PageHeader
        eyebrow="Your money, your language"
        title="Categories"
        description="Keep income and spending organised in a way that feels natural to you."
        actions={
          <>
            <RefreshButton
              isRefreshing={
                categoriesQuery.isFetching
              }
              onRefresh={
                categoriesQuery.refetch
              }
              label="Refresh categories"
              iconOnly
            />

            <button
              type="button"
              onClick={
                openCreateModal
              }
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-inverse transition hover:bg-primary-hover"
            >
              <Plus
                size={18}
                aria-hidden
              />

              New category
            </button>
          </>
        }
      />

      {categoryType ===
        'EXPENSE' &&
        status === 'ACTIVE' && (
          <div className="feature-reveal feature-reveal-delay-1 mt-10">
            <CategorySpendingChart />
          </div>
        )}

      <section className="feature-reveal feature-reveal-delay-2 mt-8 overflow-hidden rounded-2xl border border-line/50 bg-surface shadow-[0_10px_30px_rgba(23,60,50,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line/50 px-5 py-4 sm:px-6">
          <StatusTabs
            value={
              categoryType
            }
            options={
              typeOptions
            }
            onChange={
              setCategoryType
            }
            ariaLabel="Category type"
            variant="pill"
          />

          <StatusTabs
            value={status}
            options={
              statusOptions
            }
            onChange={setStatus}
            ariaLabel="Category status"
            variant="pill"
          />
        </div>

        {categoriesQuery.isPending && (
          <div className="animate-pulse">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-[76px] border-b border-line/50 bg-surface-muted/40 last:border-0"
                />
              ),
            )}
          </div>
        )}

        {categoriesQuery.isError && (
          <div className="p-5 sm:p-6">
            <ErrorPanel
              title="We couldn’t load your categories"
              message={
                categoriesQuery.error instanceof
                Error
                  ? categoriesQuery
                      .error.message
                  : 'Please try again.'
              }
              onRetry={() =>
                void categoriesQuery.refetch()
              }
            />
          </div>
        )}

        {categoriesQuery.isSuccess &&
          categoriesQuery.data
            .length === 0 && (
            <div className="p-5 sm:p-6">
              <EmptyState
                icon={
                  <Tags
                    size={22}
                    aria-hidden
                  />
                }
                title={`No ${status.toLowerCase()} categories`}
                description={
                  status ===
                  'ACTIVE'
                    ? 'Create a category to start organising your transactions.'
                    : 'Categories you archive will appear here.'
                }
                action={
                  status ===
                  'ACTIVE' ? (
                    <button
                      type="button"
                      onClick={
                        openCreateModal
                      }
                      className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-inverse transition hover:bg-primary-hover"
                    >
                      <Plus
                        size={16}
                        aria-hidden
                      />

                      New category
                    </button>
                  ) : undefined
                }
                variant="solid"
              />
            </div>
          )}

        {categoriesQuery.isSuccess &&
          categoriesQuery.data
            .length > 0 && (
            <ul className="divide-y divide-line/50">
              {categoriesQuery.data.map(
                (category) => (
                  <CategoryRow
                    key={
                      category.id
                    }
                    category={
                      category
                    }
                    onEdit={
                      openEditModal
                    }
                    onArchive={(
                      target,
                    ) => {
                      archiveCategory.reset()
                      setArchiveTarget(
                        target,
                      )
                    }}
                  />
                ),
              )}
            </ul>
          )}
      </section>

      <aside className="feature-reveal feature-reveal-delay-3 mt-5 flex items-start gap-3 rounded-2xl border border-line/40 bg-accent-soft px-5 py-4 text-accent">
        <BadgeDollarSign
          className="mt-0.5 shrink-0"
          size={18}
          aria-hidden
        />

        <p className="text-sm leading-6">
          Default Salif categories
          can be renamed or reordered,
          but their income or expense
          type cannot be changed.
        </p>
      </aside>

      <CategoryModal
        category={
          selectedCategory
        }
        isOpen={isModalOpen}
        onClose={
          closeCategoryModal
        }
      />

      {archiveTarget && (
        <ConfirmationDialog
          title={`Archive ${archiveTarget.name}?`}
          description="It will no longer be available for new transactions. Existing transaction history will remain unchanged."
          icon={
            <Archive
              size={18}
              aria-hidden
            />
          }
          confirmLabel="Archive"
          pendingLabel="Archiving…"
          cancelLabel="Keep category"
          isPending={
            archiveCategory.isPending
          }
          onConfirm={() =>
            void confirmArchive()
          }
          onClose={() =>
            setArchiveTarget(
              null,
            )
          }
          variant="plain"
        >
          {archiveError && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
            >
              {archiveError}
            </p>
          )}
        </ConfirmationDialog>
      )}
    </PageShell>
  )
}
