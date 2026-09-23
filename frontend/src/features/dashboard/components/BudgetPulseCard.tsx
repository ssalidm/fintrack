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
  formatMoney,
  formatMonth,
} from '../../../utils/formatters'
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

export default function BudgetPulseCard() {
  const [
    selectedBudgetId,
    setSelectedBudgetId,
  ] = useState('')

  const budgetsQuery =
    useBudgets('ACTIVE')

  const currentBudgets =
    useMemo(() => {
      const month =
        currentMonthKey()

      return (
        budgetsQuery.data ?? []
      ).filter(
        (budget) =>
          budget.budgetMonth.slice(
            0,
            7,
          ) === month,
      )
    }, [budgetsQuery.data])

  const activeBudget =
    currentBudgets.find(
      (budget) =>
        budget.id ===
        selectedBudgetId,
    ) ?? currentBudgets[0]

  const performanceQuery =
    useBudgetPerformance(
      activeBudget?.id ?? '',
    )

  const categoryToWatch =
    useMemo(() => {
      const categories =
        performanceQuery.data
          ?.categories

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
    }, [
      performanceQuery.data
        ?.categories,
    ])

  const performance =
    performanceQuery.data

  const currencyCode =
    performance?.currencyCode ??
    activeBudget?.currencyCode ??
    'ZAR'

  const utilization = Math.max(
    0,
    Number(
      performance
        ?.utilizationPercentage ?? 0,
    ),
  )

  const progressWidth = Math.min(
    utilization,
    100,
  )

  const isOverBudget =
    Boolean(
      performance
        ?.anyCategoryExceeded,
    ) || utilization > 100

  return (
    <article
      className="
        flex min-h-[250px]
        flex-col
        border-y border-line/60
        py-6
      "
    >
      <header
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div>
          <p className="type-eyebrow">
            BUDGET
          </p>

          <p className="mt-1 text-xs text-muted">
            {activeBudget
              ? formatMonth(
                  activeBudget.budgetMonth,
                )
              : 'This month'}
          </p>
        </div>

        {currentBudgets.length >
        1 ? (
          <select
            value={
              activeBudget?.id ?? ''
            }
            onChange={(event) =>
              setSelectedBudgetId(
                event.target.value,
              )
            }
            aria-label="Budget currency"
            className="
              cursor-pointer
              rounded-md
              border border-line-strong
              bg-surface
              py-1.5 pr-8 pl-3
              text-xs font-semibold
              text-ink
              outline-none
              transition
              focus:border-accent
            "
          >
            {currentBudgets.map(
              (budget) => (
                <option
                  key={budget.id}
                  value={budget.id}
                >
                  {
                    budget.currencyCode
                  }
                </option>
              ),
            )}
          </select>
        ) : activeBudget ? (
          <span className="text-xs font-semibold text-muted">
            {
              activeBudget.currencyCode
            }
          </span>
        ) : null}
      </header>

      {budgetsQuery.isPending && (
        <div className="grid flex-1 place-items-center text-muted">
          <LoaderCircle
            size={22}
            className="animate-spin"
            aria-label="Loading budget"
          />
        </div>
      )}

      {budgetsQuery.isError && (
        <div className="mt-6 flex flex-1 flex-col justify-between">
          <p className="text-sm leading-6 text-danger">
            Your budget could not be
            loaded.
          </p>

          <button
            type="button"
            onClick={() =>
              void budgetsQuery.refetch()
            }
            className="
              mt-4
              w-fit
              cursor-pointer
              text-sm font-semibold
              text-accent
              underline
              underline-offset-4
            "
          >
            Try again
          </button>
        </div>
      )}

      {budgetsQuery.isSuccess &&
        !activeBudget && (
          <div
            className="
              mt-7
              flex flex-1
              flex-col
              justify-between
            "
          >
            <div>
              <div className="flex items-center gap-3">
                <span
                  className="
                    grid size-9
                    shrink-0
                    place-items-center
                    rounded-lg
                    bg-accent-soft
                    text-accent
                  "
                >
                  <WalletCards
                    size={17}
                    aria-hidden
                  />
                </span>

                <p className="type-card-title">
                  No budget this month
                </p>
              </div>

              <p className="mt-3 type-body">
                Give this month&apos;s
                spending a clear
                direction.
              </p>
            </div>

            <Link
              to="/budgets"
              className="
                mt-6
                inline-flex
                w-fit
                cursor-pointer
                items-center
                gap-2
                text-sm font-semibold
                text-accent
                transition
                hover:text-primary
              "
            >
              Create a budget

              <ArrowRight
                size={15}
                aria-hidden
              />
            </Link>
          </div>
        )}

      {activeBudget &&
        performanceQuery.isPending && (
          <div className="grid flex-1 place-items-center text-muted">
            <LoaderCircle
              size={22}
              className="animate-spin"
              aria-label="Loading budget performance"
            />
          </div>
        )}

      {activeBudget &&
        performanceQuery.isError && (
          <div className="mt-6 flex flex-1 flex-col justify-between">
            <p className="text-sm leading-6 text-danger">
              Budget performance
              could not be loaded.
            </p>

            <button
              type="button"
              onClick={() =>
                void performanceQuery.refetch()
              }
              className="
                mt-4
                w-fit
                cursor-pointer
                text-sm font-semibold
                text-accent
                underline
                underline-offset-4
              "
            >
              Try again
            </button>
          </div>
        )}

      {activeBudget &&
        performance && (
          <div
            className="
              mt-7
              flex flex-1
              flex-col
            "
          >
            <div
              className="
                flex
                items-end
                justify-between
                gap-4
              "
            >
              <div>
                <p
                  className={`
                    text-3xl
                    font-bold
                    tracking-[-0.035em]
                    sm:text-4xl
                    ${
                      isOverBudget
                        ? 'text-danger'
                        : 'text-ink'
                    }
                  `}
                >
                  {Math.round(
                    utilization,
                  )}
                  %
                </p>

                <p className="mt-1 text-xs text-muted">
                  {formatMoney(
                    Number(
                      performance
                        .totalSpentAmount,
                    ),
                    currencyCode,
                    0,
                  )}{' '}
                  of{' '}
                  {formatMoney(
                    Number(
                      performance
                        .totalLimitAmount,
                    ),
                    currencyCode,
                    0,
                  )}
                </p>
              </div>

              <p
                className={`
                  text-right
                  text-xs
                  font-semibold
                  ${
                    isOverBudget
                      ? 'text-danger'
                      : 'text-success'
                  }
                `}
              >
                {isOverBudget
                  ? 'Needs attention'
                  : 'On track'}
              </p>
            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-strong">
              <div
                className={
                  isOverBudget
                    ? 'h-full rounded-full bg-danger'
                    : 'h-full rounded-full bg-success'
                }
                style={{
                  width: `${progressWidth}%`,
                }}
              />
            </div>

            <div
              className="
                mt-auto
                flex
                items-end
                justify-between
                gap-4
                border-t border-line/60
                pt-5
              "
            >
              <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-[0.1em] text-subtle">
                  {categoryToWatch
                    ? 'CATEGORY TO WATCH'
                    : 'REMAINING'}
                </p>

                <div className="mt-1 flex min-w-0 items-center gap-2">
                  <p className="truncate text-sm font-semibold text-ink">
                    {categoryToWatch
                      ? categoryToWatch.categoryName
                      : formatMoney(
                          Number(
                            performance
                              .totalRemainingAmount,
                          ),
                          currencyCode,
                          0,
                        )}
                  </p>

                  {categoryToWatch
                    ?.exceeded && (
                    <CircleAlert
                      size={15}
                      className="shrink-0 text-danger"
                      aria-label="Category limit exceeded"
                    />
                  )}
                </div>
              </div>

              <Link
                to="/budgets"
                className="
                  inline-flex
                  shrink-0
                  cursor-pointer
                  items-center
                  gap-2
                  text-sm font-semibold
                  text-accent
                  transition
                  hover:text-primary
                "
              >
                Budgets

                <ArrowRight
                  size={15}
                  aria-hidden
                />
              </Link>
            </div>
          </div>
        )}
    </article>
  )
}
