import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Gauge,
  WalletCards,
} from 'lucide-react'
import { Link } from 'react-router'

import { formatMoney } from '@/utils/formatters'
import {
  useBudgetPerformance,
  useBudgets,
} from '@/features/budgets/hooks/useBudgets'

function currentMonthKey() {
  const now = new Date()

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function clampPercentage(value: number) {
  return Math.min(Math.max(value, 0), 100)
}

export default function OverviewBudgetPanel() {
  const budgetsQuery = useBudgets('ACTIVE')
  const currentMonth = currentMonthKey()

  const currentBudget = (budgetsQuery.data ?? []).find(
    (budget) => budget.budgetMonth.slice(0, 7) === currentMonth,
  )

  const performanceQuery = useBudgetPerformance(currentBudget?.id ?? '')
  const performance = performanceQuery.data

  const currencyCode =
    performance?.currencyCode ?? currentBudget?.currencyCode

  const utilization = performance?.utilizationPercentage ?? 0
  const progress = clampPercentage(utilization)

  const exceededCount =
    performance?.categories.filter((category) => category.exceeded).length ?? 0

  const isLoading =
    budgetsQuery.isPending ||
    (Boolean(currentBudget) && performanceQuery.isPending)

  const hasError =
    budgetsQuery.isError ||
    (Boolean(currentBudget) && performanceQuery.isError)

  return (
    <section className="flex h-full flex-col rounded-2xl border border-line/50 bg-surface p-5 shadow-[0_10px_30px_rgba(23,60,50,0.05)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-warning-soft text-warning">
            <WalletCards size={16} aria-hidden />
          </span>

          <div>
            <h2 className="text-base font-semibold text-ink">
              Monthly budget
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              This month&apos;s plan
            </p>
          </div>
        </div>

        <Link
          to="/budgets"
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-accent transition hover:text-primary"
        >
          Manage
          <ArrowRight size={13} aria-hidden />
        </Link>
      </div>

      {isLoading && (
        <div className="mt-5 flex-1 animate-pulse space-y-4">
          <div className="h-7 w-32 rounded bg-surface-muted" />
          <div className="h-16 rounded-xl bg-surface-muted" />
          <div className="h-2 rounded-full bg-surface-muted" />
        </div>
      )}

      {hasError && (
        <div className="mt-6" role="alert">
          <p className="text-sm text-danger">
            Budget progress could not be loaded.
          </p>

          <button
            type="button"
            onClick={() => {
              void budgetsQuery.refetch()

              if (currentBudget) {
                void performanceQuery.refetch()
              }
            }}
            className="mt-2 cursor-pointer text-xs font-semibold text-accent underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !hasError && !currentBudget && (
        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <span className="grid size-11 place-items-center rounded-xl bg-warning-soft text-warning">
            <Gauge size={19} aria-hidden />
          </span>

          <p className="mt-4 text-sm font-semibold text-ink">
            No budget for this month
          </p>

          <p className="mt-1 max-w-xs text-xs leading-5 text-muted">
            Create a monthly plan to track spending against your category limits.
          </p>

          <Link
            to="/budgets"
            className="mt-4 text-xs font-semibold text-accent transition hover:text-primary"
          >
            Create a budget
          </Link>
        </div>
      )}

      {!isLoading && !hasError && currentBudget && performance && (
        <>
          <div className="mt-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {currentBudget.name}
                </p>

                <p className="mt-1 text-xs text-muted">
                  {formatMoney(performance.totalSpentAmount, currencyCode)} spent of{' '}
                  {formatMoney(performance.totalLimitAmount, currencyCode)}
                </p>
              </div>

              <span
                className={`shrink-0 text-xs font-semibold ${
                  performance.anyCategoryExceeded
                    ? 'text-danger'
                    : utilization >= 85
                      ? 'text-warning'
                      : 'text-success'
                }`}
              >
                {Math.round(utilization)}%
              </span>
            </div>

            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-surface-strong"
              role="progressbar"
              aria-label="Budget utilization"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
            >
              <div
                className={`h-full rounded-full transition-[width] duration-500 ${
                  performance.anyCategoryExceeded
                    ? 'bg-danger'
                    : utilization >= 85
                      ? 'bg-warning'
                      : 'bg-success'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface-muted p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle">
                {performance.totalRemainingAmount < 0 ? 'Over by' : 'Remaining'}
              </p>

              <p
                className={`mt-1 text-sm font-semibold ${
                  performance.totalRemainingAmount < 0
                    ? 'text-danger'
                    : 'text-ink'
                }`}
              >
                {formatMoney(
                  Math.abs(performance.totalRemainingAmount),
                  currencyCode,
                )}
              </p>
            </div>

            <div className="rounded-xl bg-surface-muted p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle">
                Categories
              </p>

              <p className="mt-1 text-sm font-semibold text-ink">
                {performance.categories.length}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs">
            {performance.anyCategoryExceeded ? (
              <>
                <AlertTriangle size={14} className="text-danger" aria-hidden />
                <span className="text-danger">
                  {exceededCount}{' '}
                  {exceededCount === 1 ? 'category is' : 'categories are'} over limit
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 size={14} className="text-success" aria-hidden />
                <span className="text-success">
                  Spending is within your limits
                </span>
              </>
            )}
          </div>
        </>
      )}
    </section>
  )
}
