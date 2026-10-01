import {
  ArrowRight,
  LoaderCircle,
  PieChart,
} from 'lucide-react'
import {
  useMemo,
  useState,
} from 'react'
import { Link } from 'react-router'

import { formatMoney } from '@/utils/formatters'
import { useCategorySpending } from '@/features/categories/hooks/useCategorySpending'

interface SpendingSlice {
  key: string
  name: string
  amount: number
  transactionCount: number
}

const DONUT_SIZE = 220
const DONUT_RADIUS = 78
const DONUT_STROKE_WIDTH = 26
const DONUT_CIRCUMFERENCE =
  2 * Math.PI * DONUT_RADIUS

const sliceColours = [
  'var(--salif-color-accent)',
  'var(--salif-color-primary)',
  'var(--salif-color-warning)',
  'var(--salif-color-danger)',
  'var(--salif-color-text-muted)',
  'var(--salif-color-border-strong)',
] as const

function buildSlices(
  items: SpendingSlice[],
): SpendingSlice[] {
  if (items.length <= 5) {
    return items
  }

  const topFive = items.slice(0, 5)
  const remaining = items.slice(5)

  const other = remaining.reduce<SpendingSlice>(
    (aggregate, item) => ({
      ...aggregate,
      amount:
        aggregate.amount +
        item.amount,
      transactionCount:
        aggregate.transactionCount +
        item.transactionCount,
    }),
    {
      key: 'other',
      name: 'Other',
      amount: 0,
      transactionCount: 0,
    },
  )

  return [
    ...topFive,
    other,
  ]
}

export default function OverviewCategorySpendingPanel() {
  const spendingQuery =
    useCategorySpending()

  const [
    selectedCurrency,
    setSelectedCurrency,
  ] = useState<string | null>(
    null,
  )

  const currencyCodes =
    useMemo(
      () =>
        Array.from(
          new Set(
            (
              spendingQuery.data ??
              []
            ).map(
              (item) =>
                item.currencyCode,
            ),
          ),
        ).sort(),
      [spendingQuery.data],
    )

  const activeCurrency =
    selectedCurrency &&
      currencyCodes.includes(
        selectedCurrency,
      )
      ? selectedCurrency
      : currencyCodes[0]

  const sourceItems =
    useMemo(
      () =>
        (
          spendingQuery.data ??
          []
        )
          .filter(
            (item) =>
              item.currencyCode ===
              activeCurrency,
          )
          .map((item) => ({
            key: item.categoryId,
            name:
              item.categoryName,
            amount: Number(
              item.spentAmount,
            ),
            transactionCount:
              item.transactionCount,
          }))
          .filter(
            (item) =>
              Number.isFinite(
                item.amount,
              ) &&
              item.amount > 0,
          )
          .toSorted(
            (
              left,
              right,
            ) =>
              right.amount -
              left.amount,
          ),
      [
        activeCurrency,
        spendingQuery.data,
      ],
    )

  const slices =
    useMemo(
      () =>
        buildSlices(
          sourceItems,
        ),
      [sourceItems],
    )

  const totalSpent =
    sourceItems.reduce(
      (total, item) =>
        total + item.amount,
      0,
    )

  const transactionCount =
    sourceItems.reduce(
      (total, item) =>
        total +
        item.transactionCount,
      0,
    )

  return (
    <section className="overflow-hidden rounded-2xl border border-line/50 bg-surface shadow-[0_10px_30px_rgba(23,60,50,0.05)]">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent">
            <PieChart
              size={16}
              aria-hidden
            />
          </span>

          <div>
            <h2 className="text-base font-semibold text-ink">
              Spending by category
            </h2>

            <p className="mt-0.5 text-xs text-muted">
              Where your money went
              this month
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currencyCodes.length >
            1 && (
              <select
                value={
                  activeCurrency
                }
                onChange={(event) =>
                  setSelectedCurrency(
                    event.target.value,
                  )
                }
                aria-label="Spending currency"
                className="cursor-pointer rounded-lg border border-line bg-app py-1.5 pr-8 pl-3 text-xs font-semibold text-ink outline-none transition focus:border-accent"
              >
                {currencyCodes.map(
                  (
                    currencyCode,
                  ) => (
                    <option
                      key={
                        currencyCode
                      }
                      value={
                        currencyCode
                      }
                    >
                      {
                        currencyCode
                      }
                    </option>
                  ),
                )}
              </select>
            )}

          <Link
            to="/categories"
            className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-accent transition hover:text-primary"
          >
            Categories

            <ArrowRight
              size={13}
              aria-hidden
            />
          </Link>
        </div>
      </header>

      {spendingQuery.isPending && (
        <div className="grid min-h-[310px] place-items-center text-muted">
          <LoaderCircle
            className="animate-spin"
            size={22}
            aria-label="Loading category spending"
          />
        </div>
      )}

      {spendingQuery.isError && (
        <div
          className="px-5 py-12 text-center"
          role="alert"
        >
          <p className="text-sm text-danger">
            Category spending could
            not be loaded.
          </p>

          <button
            type="button"
            onClick={() =>
              void spendingQuery.refetch()
            }
            className="mt-2 cursor-pointer text-xs font-semibold text-accent underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      {spendingQuery.isSuccess &&
        sourceItems.length ===
        0 && (
          <div className="px-5 py-14 text-center">
            <span className="mx-auto grid size-11 place-items-center rounded-xl bg-accent-soft text-accent">
              <PieChart
                size={19}
                aria-hidden
              />
            </span>

            <p className="mt-4 text-sm font-semibold text-ink">
              No expense data yet
            </p>

            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted">
              Posted expenses will
              build this chart as the
              month progresses.
            </p>
          </div>
        )}

      {spendingQuery.isSuccess &&
        sourceItems.length > 0 &&
        activeCurrency && (
          <div className="grid gap-6 px-5 py-5 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-center lg:px-6 lg:py-6">
            <div className="flex justify-center">
              <div className="relative size-[220px]">
                <svg
                  viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
                  className="size-full -rotate-90"
                  role="img"
                  aria-label={`Spending by category. Total spent ${formatMoney(
                    totalSpent,
                    activeCurrency,
                  )}.`}
                >
                  <circle
                    cx={
                      DONUT_SIZE / 2
                    }
                    cy={
                      DONUT_SIZE / 2
                    }
                    r={DONUT_RADIUS}
                    fill="none"
                    stroke="var(--salif-color-surface-strong)"
                    strokeWidth={
                      DONUT_STROKE_WIDTH
                    }
                  />

                  {slices.map(
                    (
                      item,
                      index,
                    ) => {
                      const share =
                        totalSpent > 0
                          ? item.amount /
                          totalSpent
                          : 0

                      const accumulatedShare =
                        slices
                          .slice(0, index)
                          .reduce(
                            (
                              total,
                              slice,
                            ) =>
                              total +
                              (totalSpent > 0
                                ? slice.amount /
                                totalSpent
                                : 0),
                            0,
                          )

                      const dashLength =
                        DONUT_CIRCUMFERENCE *
                        share

                      const dashOffset =
                        -DONUT_CIRCUMFERENCE *
                        accumulatedShare

                      return (
                        <circle
                          key={
                            item.key
                          }
                          cx={
                            DONUT_SIZE /
                            2
                          }
                          cy={
                            DONUT_SIZE /
                            2
                          }
                          r={
                            DONUT_RADIUS
                          }
                          fill="none"
                          stroke={
                            sliceColours[
                            index %
                            sliceColours.length
                            ]
                          }
                          strokeWidth={
                            DONUT_STROKE_WIDTH
                          }
                          strokeDasharray={`${dashLength} ${DONUT_CIRCUMFERENCE -
                            dashLength
                            }`}
                          strokeDashoffset={
                            dashOffset
                          }
                          strokeLinecap="butt"
                        >
                          <title>
                            {item.name}:{' '}
                            {formatMoney(
                              item.amount,
                              activeCurrency,
                            )}{' '}
                            (
                            {Math.round(
                              share *
                              100,
                            )}
                            %)
                          </title>
                        </circle>
                      )
                    },
                  )}
                </svg>

                <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle">
                      Total spent
                    </p>

                    <p className="mt-1 text-xl font-semibold tracking-[-0.025em] text-ink">
                      {formatMoney(
                        totalSpent,
                        activeCurrency,
                      )}
                    </p>

                    <p className="mt-1 text-[11px] text-muted">
                      {
                        transactionCount
                      }{' '}
                      {transactionCount ===
                        1
                        ? 'expense'
                        : 'expenses'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="divide-y divide-line/50">
                {slices.map(
                  (
                    item,
                    index,
                  ) => {
                    const share =
                      totalSpent > 0
                        ? (
                          item.amount /
                          totalSpent
                        ) *
                        100
                        : 0

                    return (
                      <div
                        key={
                          item.key
                        }
                        className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{
                            backgroundColor:
                              sliceColours[
                              index %
                              sliceColours.length
                              ],
                          }}
                          aria-hidden
                        />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-ink">
                            {
                              item.name
                            }
                          </p>

                          <p className="mt-0.5 text-[10px] text-subtle">
                            {
                              item.transactionCount
                            }{' '}
                            {item.transactionCount ===
                              1
                              ? 'transaction'
                              : 'transactions'}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-xs font-semibold text-ink">
                            {formatMoney(
                              item.amount,
                              activeCurrency,
                            )}
                          </p>

                          <p className="mt-0.5 text-[10px] text-subtle">
                            {Math.round(
                              share,
                            )}
                            %
                          </p>
                        </div>
                      </div>
                    )
                  },
                )}
              </div>

              {sourceItems.length >
                5 && (
                  <p className="mt-4 text-[11px] leading-5 text-subtle">
                    Smaller
                    categories are
                    grouped into
                    “Other” to keep
                    the chart easy to
                    read.
                  </p>
                )}
            </div>
          </div>
        )}
    </section>
  )
}
