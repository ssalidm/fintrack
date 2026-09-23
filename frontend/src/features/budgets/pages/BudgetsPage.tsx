import {
  Archive,
  CalendarRange,
  Pencil,
  Plus,
  WalletCards,
} from 'lucide-react'
import {
  useMemo,
  useState,
} from 'react'

import { ApiClientError } from '../../../api/ApiClientError'
import RefreshButton from '../../../components/actions/RefreshButton'
import PageHeader from '../../../components/layout/PageHeader'
import PageShell from '../../../components/layout/PageShell'
import StatusTabs from '../../../components/navigation/StatusTabs'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorPanel from '../../../components/ui/ErrorPanel'
import type {
  BudgetCategoryLimit,
  BudgetStatus,
  BudgetSummary,
} from '../api/types'
import BudgetActionDialog, {
  type BudgetActionKind,
} from '../components/BudgetActionDialog'
import BudgetLimitModal from '../components/BudgetLimitModal'
import BudgetModal from '../components/BudgetModal'
import BudgetPerformancePanel from '../components/BudgetPerformancePanel'
import {
  useArchiveBudget,
  useBudget,
  useBudgetPerformance,
  useBudgets,
  useDeleteBudgetLimit,
} from '../hooks/useBudgets'

interface LimitModalTarget {
  limit?: BudgetCategoryLimit
  categoryName?: string
}

type ActionTarget =
  | {
      kind: 'ARCHIVE_BUDGET'
      budget: BudgetSummary
    }
  | {
      kind: 'REMOVE_LIMIT'
      budgetId: string
      limit: BudgetCategoryLimit
      categoryName: string
    }

const statusOptions = [
  {
    value: 'ACTIVE',
    label: 'Current plans',
  },
  {
    value: 'ARCHIVED',
    label: 'Past plans',
  },
] satisfies Array<{
  value: BudgetStatus
  label: string
}>

function formatMonth(
  value: string,
) {
  const [
    year,
    month,
  ] = value
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
    new Date(
      year,
      month - 1,
      1,
    ),
  )
}

function currentMonthKey() {
  const today = new Date()

  const month = String(
    today.getMonth() + 1,
  ).padStart(2, '0')

  return `${today.getFullYear()}-${month}`
}

function preferredBudgetId(
  budgets: BudgetSummary[],
) {
  const currentMonth =
    currentMonthKey()

  const currentBudget =
    budgets.find(
      (budget) =>
        budget.budgetMonth.slice(
          0,
          7,
        ) === currentMonth,
    )

  if (currentBudget) {
    return currentBudget.id
  }

  const latestPastBudget =
    budgets
      .filter(
        (budget) =>
          budget.budgetMonth.slice(
            0,
            7,
          ) < currentMonth,
      )
      .toSorted(
        (
          left,
          right,
        ) =>
          right.budgetMonth.localeCompare(
            left.budgetMonth,
          ),
      )[0]

  if (latestPastBudget) {
    return latestPastBudget.id
  }

  return (
    budgets.toSorted(
      (
        left,
        right,
      ) =>
        left.budgetMonth.localeCompare(
          right.budgetMonth,
        ),
    )[0]?.id ?? ''
  )
}

function budgetTimingLabel(
  budgetMonth: string,
) {
  const month =
    budgetMonth.slice(
      0,
      7,
    )

  const currentMonth =
    currentMonthKey()

  if (
    month === currentMonth
  ) {
    return 'Current'
  }

  return month > currentMonth
    ? 'Upcoming'
    : 'Past'
}

function actionKind(
  target: ActionTarget,
): BudgetActionKind {
  return target.kind
}

export default function BudgetsPage() {
  const [
    status,
    setStatus,
  ] =
    useState<BudgetStatus>(
      'ACTIVE',
    )

  const [
    selectedBudgetId,
    setSelectedBudgetId,
  ] = useState('')

  const [
    isCreateOpen,
    setIsCreateOpen,
  ] = useState(false)

  const [
    editingBudget,
    setEditingBudget,
  ] =
    useState<BudgetSummary | null>(
      null,
    )

  const [
    limitModalTarget,
    setLimitModalTarget,
  ] =
    useState<LimitModalTarget | null>(
      null,
    )

  const [
    actionTarget,
    setActionTarget,
  ] =
    useState<ActionTarget | null>(
      null,
    )

  const [
    actionError,
    setActionError,
  ] = useState<string | null>(
    null,
  )

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false)

  const budgetsQuery =
    useBudgets(status)

  const budgets =
    useMemo(
      () =>
        budgetsQuery.data ?? [],
      [budgetsQuery.data],
    )

  const activeBudgetId =
    budgets.some(
      (budget) =>
        budget.id ===
        selectedBudgetId,
    )
      ? selectedBudgetId
      : preferredBudgetId(
          budgets,
        )

  const budgetQuery =
    useBudget(
      activeBudgetId,
    )

  const performanceQuery =
    useBudgetPerformance(
      activeBudgetId,
    )

  const archiveBudget =
    useArchiveBudget()

  const deleteLimit =
    useDeleteBudgetLimit()

  const selectedBudget =
    budgetQuery.data

  const unavailableCategoryIds =
    useMemo(
      () =>
        selectedBudget?.limits.map(
          (limit) =>
            limit.categoryId,
        ) ?? [],
      [selectedBudget],
    )

  async function refreshPage() {
    setIsRefreshing(true)

    try {
      await budgetsQuery.refetch()

      if (activeBudgetId) {
        await Promise.all([
          budgetQuery.refetch(),
          performanceQuery.refetch(),
        ])
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  function closeActionDialog() {
    if (
      archiveBudget.isPending ||
      deleteLimit.isPending
    ) {
      return
    }

    setActionTarget(null)
    setActionError(null)
  }

  async function confirmAction() {
    if (!actionTarget) {
      return
    }

    setActionError(null)

    try {
      if (
        actionTarget.kind ===
        'ARCHIVE_BUDGET'
      ) {
        await archiveBudget.mutateAsync(
          {
            budgetId:
              actionTarget.budget.id,
            payload: {
              version:
                actionTarget.budget
                  .version,
            },
          },
        )
      } else {
        await deleteLimit.mutateAsync(
          {
            budgetId:
              actionTarget.budgetId,
            limitId:
              actionTarget.limit.id,
            version:
              actionTarget.limit
                .version,
          },
        )
      }

      setActionTarget(null)
    } catch (error) {
      setActionError(
        error instanceof
        ApiClientError
          ? error.message
          : 'The change could not be completed.',
      )
    }
  }

  const actionSubjectName =
    actionTarget?.kind ===
    'ARCHIVE_BUDGET'
      ? actionTarget.budget.name
      : actionTarget?.kind ===
          'REMOVE_LIMIT'
        ? actionTarget.categoryName
        : ''

  return (
    <PageShell>
      <PageHeader
        eyebrow="Spend with intention"
        title="Budgets"
        description="Set useful boundaries, notice where money drifts, and adjust without turning the month into a punishment."
        actions={
          <>
            <RefreshButton
              isRefreshing={
                isRefreshing
              }
              onRefresh={
                refreshPage
              }
              label="Refresh budgets"
              iconOnly
            />

            <button
              type="button"
              onClick={() =>
                setIsCreateOpen(
                  true,
                )
              }
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-inverse transition hover:bg-primary-hover"
            >
              <Plus
                size={18}
                aria-hidden
              />

              New budget
            </button>
          </>
        }
      />

      <section className="feature-reveal feature-reveal-delay-1 mt-10 rounded-2xl border border-line/50 bg-surface p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <StatusTabs
            value={status}
            options={
              statusOptions
            }
            onChange={(
              nextStatus,
            ) => {
              setStatus(
                nextStatus,
              )
              setSelectedBudgetId(
                '',
              )
            }}
            ariaLabel="Budget status"
            variant="pill"
          />

          {budgets.length > 0 && (
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
              <label
                htmlFor="budget-selector"
                className="type-eyebrow shrink-0"
              >
                Viewing
              </label>

              <select
                id="budget-selector"
                value={
                  activeBudgetId
                }
                onChange={(event) =>
                  setSelectedBudgetId(
                    event.target
                      .value,
                  )
                }
                className="min-w-0 cursor-pointer rounded-xl border border-line bg-surface-muted px-4 py-2.5 pr-11 text-sm font-semibold text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10 sm:min-w-72"
              >
                {budgets.map(
                  (budget) => (
                    <option
                      key={
                        budget.id
                      }
                      value={
                        budget.id
                      }
                    >
                      {budgetTimingLabel(
                        budget.budgetMonth,
                      )}{' '}
                      ·{' '}
                      {formatMonth(
                        budget.budgetMonth,
                      )}{' '}
                      · {budget.name}{' '}
                      ·{' '}
                      {
                        budget.currencyCode
                      }
                    </option>
                  ),
                )}
              </select>
            </div>
          )}
        </div>
      </section>

      {budgetsQuery.isPending ? (
        <div className="feature-reveal feature-reveal-delay-2 mt-6 space-y-5">
          <div className="h-28 animate-pulse rounded-2xl border border-line/50 bg-surface-muted/50" />
          <div className="h-72 animate-pulse rounded-2xl border border-line/50 bg-surface-muted/50" />
        </div>
      ) : budgetsQuery.isError ? (
        <ErrorPanel
          title="Your budgets could not be loaded"
          message={
            budgetsQuery.error instanceof
            ApiClientError
              ? budgetsQuery.error
                  .message
              : 'Check the connection and try again.'
          }
          onRetry={() =>
            void budgetsQuery.refetch()
          }
          className="feature-reveal feature-reveal-delay-2 mt-6"
        />
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={
            <WalletCards
              size={22}
              aria-hidden
            />
          }
          title={
            status === 'ACTIVE'
              ? 'Give this month some shape'
              : 'No past plans yet'
          }
          description={
            status === 'ACTIVE'
              ? 'Start with a monthly plan, then add limits only to the expense categories that deserve attention.'
              : 'Archived budgets will stay here as a record of how your plans changed.'
          }
          action={
            status === 'ACTIVE' ? (
              <button
                type="button"
                onClick={() =>
                  setIsCreateOpen(
                    true,
                  )
                }
                className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-inverse transition hover:bg-primary-hover"
              >
                <Plus
                  size={16}
                  aria-hidden
                />

                Create your first
                budget
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setStatus(
                    'ACTIVE',
                  )
                }
                className="mt-5 cursor-pointer rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-accent-soft"
              >
                View current plans
              </button>
            )
          }
          variant="solid"
          className="feature-reveal feature-reveal-delay-2 mt-6"
        />
      ) : budgetQuery.isError ? (
        <ErrorPanel
          title="This budget could not be opened"
          message={
            budgetQuery.error instanceof
            ApiClientError
              ? budgetQuery.error
                  .message
              : 'Please try again.'
          }
          onRetry={() =>
            void budgetQuery.refetch()
          }
          className="feature-reveal feature-reveal-delay-2 mt-6"
        />
      ) : budgetQuery.isPending ||
        !selectedBudget ? (
        <div className="feature-reveal feature-reveal-delay-2 mt-6 space-y-5">
          <div className="h-28 animate-pulse rounded-2xl border border-line/50 bg-surface-muted/50" />
          <div className="h-72 animate-pulse rounded-2xl border border-line/50 bg-surface-muted/50" />
        </div>
      ) : (
        <div className="feature-reveal feature-reveal-delay-2 mt-6 space-y-6">
          <section className="flex flex-col gap-5 rounded-2xl border border-line/50 bg-surface p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                <CalendarRange
                  size={18}
                  aria-hidden
                />
              </div>

              <div>
                <p className="type-eyebrow">
                  {formatMonth(
                    selectedBudget
                      .budgetMonth,
                  )}
                  {' · '}
                  {
                    selectedBudget
                      .currencyCode
                  }
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-ink">
                  {
                    selectedBudget.name
                  }
                </h2>

                {selectedBudget.status ===
                  'ARCHIVED' && (
                  <p className="mt-1 text-xs font-medium text-warning">
                    This plan is
                    archived and
                    read-only.
                  </p>
                )}
              </div>
            </div>

            {selectedBudget.status ===
              'ACTIVE' && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setEditingBudget(
                      selectedBudget,
                    )
                  }
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-muted"
                >
                  <Pencil
                    size={15}
                    aria-hidden
                  />

                  Rename
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActionError(
                      null,
                    )

                    setActionTarget({
                      kind:
                        'ARCHIVE_BUDGET',
                      budget:
                        selectedBudget,
                    })
                  }}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-danger/20 bg-surface px-4 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger-soft"
                >
                  <Archive
                    size={15}
                    aria-hidden
                  />

                  Archive
                </button>
              </div>
            )}
          </section>

          <BudgetPerformancePanel
            budget={
              selectedBudget
            }
            performance={
              performanceQuery.data
            }
            isLoading={
              performanceQuery.isPending
            }
            isError={
              performanceQuery.isError
            }
            onRetry={() =>
              void performanceQuery.refetch()
            }
            onAddLimit={() =>
              setLimitModalTarget(
                {},
              )
            }
            onEditLimit={(
              limit,
              categoryName,
            ) =>
              setLimitModalTarget(
                {
                  limit,
                  categoryName,
                },
              )
            }
            onRemoveLimit={(
              limit,
              categoryName,
            ) => {
              setActionError(
                null,
              )

              setActionTarget({
                kind:
                  'REMOVE_LIMIT',
                budgetId:
                  selectedBudget.id,
                limit,
                categoryName,
              })
            }}
          />
        </div>
      )}

      {isCreateOpen && (
        <BudgetModal
          onClose={() =>
            setIsCreateOpen(
              false,
            )
          }
        />
      )}

      {editingBudget && (
        <BudgetModal
          budget={
            editingBudget
          }
          onClose={() =>
            setEditingBudget(
              null,
            )
          }
        />
      )}

      {limitModalTarget &&
        selectedBudget && (
          <BudgetLimitModal
            budgetId={
              selectedBudget.id
            }
            currencyCode={
              selectedBudget.currencyCode
            }
            limit={
              limitModalTarget.limit
            }
            categoryName={
              limitModalTarget.categoryName
            }
            unavailableCategoryIds={
              unavailableCategoryIds
            }
            onClose={() =>
              setLimitModalTarget(
                null,
              )
            }
          />
        )}

      {actionTarget && (
        <BudgetActionDialog
          action={actionKind(
            actionTarget,
          )}
          subjectName={
            actionSubjectName
          }
          isPending={
            archiveBudget.isPending ||
            deleteLimit.isPending
          }
          errorMessage={
            actionError
          }
          onCancel={
            closeActionDialog
          }
          onConfirm={() =>
            void confirmAction()
          }
        />
      )}
    </PageShell>
  )
}
