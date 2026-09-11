import {
  Archive,
  CalendarRange,
  Pencil,
  Plus,
  RefreshCw,
  WalletCards,
} from 'lucide-react'
import {
  useMemo,
  useState,
} from 'react'

import { ApiClientError } from '../../../api/ApiClientError'

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
import PageShell from '../../../components/layout/PageShell'

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

  const currentBudget = budgets.find(
    (budget) =>
      budget.budgetMonth.slice(0, 7) ===
      currentMonth,
  )

  if (currentBudget) {
    return currentBudget.id
  }

  const latestPastBudget = budgets
    .filter(
      (budget) =>
        budget.budgetMonth.slice(0, 7) <
        currentMonth,
    )
    .toSorted((left, right) =>
      right.budgetMonth.localeCompare(
        left.budgetMonth,
      ),
    )[0]

  if (latestPastBudget) {
    return latestPastBudget.id
  }

  const nearestFutureBudget =
    budgets.toSorted((left, right) =>
      left.budgetMonth.localeCompare(
        right.budgetMonth,
      ),
    )[0]

  return nearestFutureBudget?.id ?? ''
}

function budgetTimingLabel(
  budgetMonth: string,
) {
  const month =
    budgetMonth.slice(0, 7)

  const currentMonth =
    currentMonthKey()

  if (month === currentMonth) {
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
  const [status, setStatus] =
    useState<BudgetStatus>('ACTIVE')

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
  ] = useState<BudgetSummary | null>(
    null,
  )

  const [
    limitModalTarget,
    setLimitModalTarget,
  ] = useState<LimitModalTarget | null>(
    null,
  )

  const [
    actionTarget,
    setActionTarget,
  ] = useState<ActionTarget | null>(
    null,
  )

  const [
    actionError,
    setActionError,
  ] = useState<string | null>(null)

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false)

  const budgetsQuery =
    useBudgets(status)

  const budgets = useMemo(
    () => budgetsQuery.data ?? [],
    [budgetsQuery.data],
  )

  const activeBudgetId =
    budgets.some(
      (budget) =>
        budget.id === selectedBudgetId,
    )
      ? selectedBudgetId
      : preferredBudgetId(budgets)

  const budgetQuery =
    useBudget(activeBudgetId)

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
        await archiveBudget.mutateAsync({
          budgetId:
            actionTarget.budget.id,

          payload: {
            version:
              actionTarget.budget
                .version,
          },
        })
      } else {
        await deleteLimit.mutateAsync({
          budgetId:
            actionTarget.budgetId,

          limitId:
            actionTarget.limit.id,

          version:
            actionTarget.limit.version,
        })
      }

      setActionTarget(null)
    } catch (error) {
      setActionError(
        error instanceof ApiClientError
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
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[#657972]">
            SPEND WITH INTENTION
          </p>

          <h1 className="mt-3 font-serif text-4xl tracking-[-0.035em] text-[#173c32] sm:text-5xl">
            Budgets
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#657972] sm:text-base">
            Set useful boundaries, notice
            where money drifts, and adjust
            without turning the month into
            a punishment.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={isRefreshing}
            onClick={() => {
              void refreshPage()
            }}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#d8d6ce] bg-[#fffdf8] px-4 py-2.5 text-sm font-semibold text-[#173c32] transition hover:bg-[#efede7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={
                isRefreshing
                  ? 'animate-spin'
                  : ''
              }
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() =>
              setIsCreateOpen(true)
            }
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#174f43] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#236a58]"
          >
            <Plus size={17} />
            New budget
          </button>
        </div>
      </header>

      <section className="mt-8 rounded-[1.5rem] border border-[#dedbd2] bg-[#fffdf8] p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex w-fit rounded-full bg-[#eceae3] p-1">
            {statusOptions.map(
              (option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setStatus(
                      option.value,
                    )
                    setSelectedBudgetId(
                      '',
                    )
                  }}
                  className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition ${status === option.value
                    ? 'bg-[#fffdf8] text-[#173c32] shadow-sm'
                    : 'text-[#657972] hover:text-[#173c32]'
                    }`}
                >
                  {option.label}
                </button>
              ),
            )}
          </div>

          {budgets.length > 0 && (
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
              <label
                htmlFor="budget-selector"
                className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-[#657972]"
              >
                Viewing
              </label>

              <select
                id="budget-selector"
                value={activeBudgetId}
                onChange={(event) =>
                  setSelectedBudgetId(
                    event.target.value,
                  )
                }
                className="min-w-0 cursor-pointer rounded-xl border border-[#d8d6ce] bg-[#f7f5ef] px-4 py-2.5 pr-11 text-sm font-semibold text-[#173c32] outline-none transition focus:border-[#39725d] focus:ring-2 focus:ring-[#39725d]/15 sm:min-w-72"
              >
                {budgets.map(
                  (budget) => (
                    <option
                      key={budget.id}
                      value={budget.id}
                    >
                      {budgetTimingLabel(
                        budget.budgetMonth,
                      )}{' '}
                      ·{' '}
                      {formatMonth(
                        budget.budgetMonth,
                      )}{' '}
                      · {budget.name} ·{' '}
                      {budget.currencyCode}
                    </option>
                  ),
                )}
              </select>
            </div>
          )}
        </div>
      </section>

      {budgetsQuery.isPending ? (
        <div className="mt-6 space-y-5">
          <div className="h-28 animate-pulse rounded-[1.75rem] bg-[#e9e7e0]" />
          <div className="h-72 animate-pulse rounded-[1.75rem] bg-[#e9e7e0]" />
        </div>
      ) : budgetsQuery.isError ? (
        <section className="mt-6 rounded-[1.75rem] border border-[#e8c8bf] bg-[#fff8f4] p-8 text-center">
          <h2 className="font-serif text-2xl text-[#173c32]">
            Your budgets could not be loaded
          </h2>

          <p className="mt-2 text-sm text-[#657972]">
            Check the connection and try
            again.
          </p>

          <button
            type="button"
            onClick={() => {
              void budgetsQuery.refetch()
            }}
            className="mt-5 cursor-pointer rounded-full border border-[#d8d6ce] px-5 py-2.5 text-sm font-semibold text-[#173c32] transition hover:bg-[#efede7]"
          >
            Try again
          </button>
        </section>
      ) : budgets.length === 0 ? (
        <section className="mt-6 rounded-[1.75rem] border border-dashed border-[#cfcac0] bg-[#fffdf8] px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e7efe9] text-[#236a58]">
            <WalletCards size={25} />
          </div>

          <h2 className="mt-6 font-serif text-3xl text-[#173c32]">
            {status === 'ACTIVE'
              ? 'Give this month some shape'
              : 'No past plans yet'}
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#657972]">
            {status === 'ACTIVE'
              ? 'Start with a monthly plan, then add limits only to the expense categories that deserve attention.'
              : 'Archived budgets will stay here as a quiet record of how your plans changed.'}
          </p>

          {status === 'ACTIVE' ? (
            <button
              type="button"
              onClick={() =>
                setIsCreateOpen(true)
              }
              className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#174f43] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#236a58]"
            >
              <Plus size={17} />
              Create your first budget
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                setStatus('ACTIVE')
              }
              className="mt-7 cursor-pointer rounded-full border border-[#bfcfc6] px-5 py-2.5 text-sm font-semibold text-[#174f43] transition hover:bg-[#e7efe9]"
            >
              View current plans
            </button>
          )}
        </section>
      ) : budgetQuery.isError ? (
        <section className="mt-6 rounded-[1.75rem] border border-[#e8c8bf] bg-[#fff8f4] p-8 text-center">
          <h2 className="font-serif text-2xl text-[#173c32]">
            This budget could not be opened
          </h2>

          <button
            type="button"
            onClick={() => {
              void budgetQuery.refetch()
            }}
            className="mt-5 cursor-pointer rounded-full border border-[#d8d6ce] px-5 py-2.5 text-sm font-semibold text-[#173c32] transition hover:bg-[#efede7]"
          >
            Try again
          </button>
        </section>
      ) : budgetQuery.isPending ||
        !selectedBudget ? (
        <div className="mt-6 space-y-5">
          <div className="h-28 animate-pulse rounded-[1.75rem] bg-[#e9e7e0]" />
          <div className="h-72 animate-pulse rounded-[1.75rem] bg-[#e9e7e0]" />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <section className="flex flex-col gap-5 rounded-[1.75rem] border border-[#dedbd2] bg-[#f1eee6] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#dfece4] text-[#236a58]">
                <CalendarRange
                  size={21}
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#657972]">
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

                <h2 className="mt-2 font-serif text-3xl text-[#173c32]">
                  {selectedBudget.name}
                </h2>

                {selectedBudget.status ===
                  'ARCHIVED' && (
                    <p className="mt-2 text-sm text-[#8a5f20]">
                      This plan is archived
                      and read-only.
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
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#cbc7bc] bg-[#fffdf8] px-4 py-2.5 text-sm font-semibold text-[#173c32] transition hover:bg-white"
                  >
                    <Pencil size={15} />
                    Rename
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActionError(null)

                      setActionTarget({
                        kind:
                          'ARCHIVE_BUDGET',
                        budget:
                          selectedBudget,
                      })
                    }}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#e0c8bf] bg-[#fffdf8] px-4 py-2.5 text-sm font-semibold text-[#9a4c3a] transition hover:bg-[#fff1ec]"
                  >
                    <Archive size={15} />
                    Archive
                  </button>
                </div>
              )}
          </section>

          <BudgetPerformancePanel
            budget={selectedBudget}
            performance={
              performanceQuery.data
            }
            isLoading={
              performanceQuery.isPending
            }
            isError={
              performanceQuery.isError
            }
            onRetry={() => {
              void performanceQuery.refetch()
            }}
            onAddLimit={() =>
              setLimitModalTarget({})
            }
            onEditLimit={(
              limit,
              categoryName,
            ) =>
              setLimitModalTarget({
                limit,
                categoryName,
              })
            }
            onRemoveLimit={(
              limit,
              categoryName,
            ) => {
              setActionError(null)

              setActionTarget({
                kind: 'REMOVE_LIMIT',
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
            setIsCreateOpen(false)
          }
        />
      )}

      {editingBudget && (
        <BudgetModal
          budget={editingBudget}
          onClose={() =>
            setEditingBudget(null)
          }
        />
      )}

      {limitModalTarget &&
        selectedBudget && (
          <BudgetLimitModal
            budgetId={selectedBudget.id}
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
              setLimitModalTarget(null)
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
          errorMessage={actionError}
          onCancel={
            closeActionDialog
          }
          onConfirm={() => {
            void confirmAction()
          }}
        />
      )}
    </PageShell>
  )
}