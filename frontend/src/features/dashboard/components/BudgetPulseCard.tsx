import {
  ArrowRight,
  CircleAlert,
  LoaderCircle,
  WalletCards,
} from 'lucide-react'
import {
  useMemo,
  useState,
} from 'react'
import { Link } from 'react-router'

import {
  useBudgetPerformance,
  useBudgets,
} from '../../budgets/hooks/useBudgets'

function currentMonthKey() {
  const today = new Date()
  const month = String(
    today.getMonth() + 1,
  ).padStart(2, '0')

  return `${today.getFullYear()}-${month}`
}

function formatMonth(value: string) {
  const [year, month] = value
    .slice(0, 7)
    .split('-')
    .map(Number)

  return new Intl.DateTimeFormat('en-ZA', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1))
}

function formatMoney(
  amount: number,
  currencyCode: string,
) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function BudgetPulseCard() {
  const [selectedBudgetId, setSelectedBudgetId] =
    useState('')

  const budgetsQuery = useBudgets('ACTIVE')

  const currentBudgets = useMemo(() => {
    const month = currentMonthKey()

    return (budgetsQuery.data ?? []).filter(
      (budget) =>
        budget.budgetMonth.slice(0, 7) === month,
    )
  }, [budgetsQuery.data])

  const activeBudget =
    currentBudgets.find(
      (budget) => budget.id === selectedBudgetId,
    ) ?? currentBudgets[0]

  const performanceQuery = useBudgetPerformance(
    activeBudget?.id ?? '',
  )

  const categoryToWatch = useMemo(() => {
    const categories =
      performanceQuery.data?.categories

    if (!categories?.length) {
      return null
    }

    return categories.toSorted(
      (left, right) =>
        Number(right.exceeded) -
          Number(left.exceeded) ||
        right.utilizationPercentage -
          left.utilizationPercentage,
    )[0]
  }, [performanceQuery.data?.categories])

  const performance = performanceQuery.data
  const currencyCode =
    performance?.currencyCode ??
    activeBudget?.currencyCode ??
    'ZAR'
  const utilization = Math.max(
    0,
    Number(performance?.utilizationPercentage ?? 0),
  )
  const progressWidth = Math.min(utilization, 100)
  const isOverBudget =
    performance?.anyCategoryExceeded || utilization > 100

  return (
    <article className="flex h-full min-h-[190px] flex-col rounded-3xl border border-[#dedbd2] bg-[#fffdf8] p-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
            BUDGET PULSE
          </p>

          {activeBudget && (
            <p className="mt-1 text-xs text-[#657972]">
              {formatMonth(activeBudget.budgetMonth)}
            </p>
          )}
        </div>

        {currentBudgets.length > 1 ? (
          <select
            value={activeBudget?.id ?? ''}
            onChange={(event) =>
              setSelectedBudgetId(event.target.value)
            }
            aria-label="Budget currency"
            className="cursor-pointer rounded-full border border-[#d7d3c9] bg-white py-1.5 pr-8 pl-3 text-xs font-semibold text-[#173c32]"
          >
            {currentBudgets.map((budget) => (
              <option key={budget.id} value={budget.id}>
                {budget.currencyCode}
              </option>
            ))}
          </select>
        ) : activeBudget ? (
          <span className="rounded-full bg-[#eef3ed] px-3 py-1.5 text-xs font-semibold text-[#426859]">
            {activeBudget.currencyCode}
          </span>
        ) : null}
      </header>

      {budgetsQuery.isPending && (
        <div className="grid flex-1 place-items-center text-[#657972]">
          <LoaderCircle
            size={22}
            className="animate-spin"
            aria-label="Loading budget"
          />
        </div>
      )}

      {budgetsQuery.isError && (
        <div className="mt-5 flex flex-1 flex-col justify-between">
          <p className="text-sm leading-6 text-[#8f3f30]">
            Your budget could not be loaded.
          </p>

          <button
            type="button"
            onClick={() => void budgetsQuery.refetch()}
            className="mt-3 w-fit cursor-pointer text-sm font-semibold text-[#174f43] underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      {budgetsQuery.isSuccess && !activeBudget && (
        <div className="mt-5 flex flex-1 flex-col justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#e7eee7] text-[#477360]">
              <WalletCards size={17} aria-hidden />
            </span>

            <div>
              <p className="font-serif text-xl text-[#173c32]">
                No plan this month
              </p>

              <p className="mt-1 text-xs leading-5 text-[#657972]">
                Give this month&apos;s spending a clear direction.
              </p>
            </div>
          </div>

          <Link
            to="/budgets"
            className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#9a6828]"
          >
            Create a budget
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      )}

      {activeBudget && performanceQuery.isPending && (
        <div className="grid flex-1 place-items-center text-[#657972]">
          <LoaderCircle
            size={22}
            className="animate-spin"
            aria-label="Loading budget performance"
          />
        </div>
      )}

      {activeBudget && performanceQuery.isError && (
        <div className="mt-5 flex flex-1 flex-col justify-between">
          <p className="text-sm leading-6 text-[#8f3f30]">
            Budget performance could not be loaded.
          </p>

          <button
            type="button"
            onClick={() => void performanceQuery.refetch()}
            className="mt-3 w-fit cursor-pointer text-sm font-semibold text-[#174f43] underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      {activeBudget && performance && (
        <div className="mt-4 flex flex-1 flex-col">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p
                className={[
                  'font-serif text-3xl tracking-[-0.03em]',
                  isOverBudget
                    ? 'text-[#a85e49]'
                    : 'text-[#173c32]',
                ].join(' ')}
              >
                {Math.round(utilization)}%
              </p>

              <p className="mt-1 text-xs text-[#657972]">
                {formatMoney(
                  Number(performance.totalSpentAmount),
                  currencyCode,
                )}{' '}
                of{' '}
                {formatMoney(
                  Number(performance.totalLimitAmount),
                  currencyCode,
                )}
              </p>
            </div>

            <p
              className={[
                'text-right text-xs font-semibold',
                isOverBudget
                  ? 'text-[#a85e49]'
                  : 'text-[#36775d]',
              ].join(' ')}
            >
              {isOverBudget ? 'Needs attention' : 'On track'}
            </p>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e5e7df]">
            <div
              className={[
                'h-full rounded-full',
                isOverBudget
                  ? 'bg-[#c4775f]'
                  : 'bg-[#79a486]',
              ].join(' ')}
              style={{ width: `${progressWidth}%` }}
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#ebe7de] pt-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.08em] text-[#7a847e]">
                {categoryToWatch
                  ? 'CATEGORY TO WATCH'
                  : 'REMAINING'}
              </p>

              <p className="mt-0.5 truncate text-sm font-semibold text-[#173c32]">
                {categoryToWatch
                  ? categoryToWatch.categoryName
                  : formatMoney(
                    Number(performance.totalRemainingAmount),
                    currencyCode,
                  )}
              </p>
            </div>

            {categoryToWatch?.exceeded && (
              <CircleAlert
                size={17}
                className="shrink-0 text-[#a85e49]"
                aria-label="Category limit exceeded"
              />
            )}

            <Link
              to="/budgets"
              title="View budgets"
              aria-label="View budgets"
              className="ml-auto grid size-8 shrink-0 cursor-pointer place-items-center rounded-full border border-[#dedbd2] text-[#9a6828] transition hover:border-[#bd9460]"
            >
              <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        </div>
      )}
    </article>
  )
}
