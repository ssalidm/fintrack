import {
  ArrowDown,
  ArrowUp,
  LoaderCircle,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { formatMoney } from '@/utils/formatters'
import type { MonthlyCashFlow } from '@/features/dashboard/api/types'
import { useCashFlowReport } from '@/features/dashboard/hooks/useCashFlowReport'

interface Point {
  readonly monthStart: string
  readonly income: number
  readonly expenses: number
}

function getMonthLabel(
  monthStart: string,
) {
  const [year, month] =
    monthStart.split('-').map(Number)

  return new Intl.DateTimeFormat(
    'en-ZA',
    {
      month: 'short',
    },
  ).format(
    new Date(
      year,
      month - 1,
      1,
    ),
  )
}

function buildPoints(
  rows: MonthlyCashFlow[],
  currencyCode: string,
): Point[] {
  return rows
    .filter(
      (row) =>
        row.currencyCode ===
        currencyCode,
    )
    .toSorted((left, right) =>
      left.monthStart.localeCompare(
        right.monthStart,
      ),
    )
    .map((row) => ({
      monthStart: row.monthStart,
      income: Number(
        row.totalIncome,
      ),
      expenses: Number(
        row.totalExpenses,
      ),
    }))
}

function linePath(
  values: number[],
  width: number,
  height: number,
  maxValue: number,
) {
  if (values.length === 0) {
    return ''
  }

  if (values.length === 1) {
    const y =
      height -
      (values[0] / maxValue) *
        height

    return `M 0 ${y} L ${width} ${y}`
  }

  return values
    .map((value, index) => {
      const x =
        (index /
          (values.length - 1)) *
        width

      const y =
        height -
        (value / maxValue) *
          height

      return `${
        index === 0
          ? 'M'
          : 'L'
      } ${x} ${y}`
    })
    .join(' ')
}

export default function OverviewCashFlowPanel() {
  const reportQuery =
    useCashFlowReport(12)

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
              reportQuery.data ?? []
            ).map(
              (row) =>
                row.currencyCode,
            ),
          ),
        ).sort(),
      [reportQuery.data],
    )

  const activeCurrency =
    selectedCurrency &&
    currencyCodes.includes(
      selectedCurrency,
    )
      ? selectedCurrency
      : currencyCodes[0]

  const points = useMemo(
    () =>
      activeCurrency
        ? buildPoints(
            reportQuery.data ?? [],
            activeCurrency,
          )
        : [],
    [
      activeCurrency,
      reportQuery.data,
    ],
  )

  const totalIncome =
    points.reduce(
      (total, point) =>
        total + point.income,
      0,
    )

  const totalExpenses =
    points.reduce(
      (total, point) =>
        total + point.expenses,
      0,
    )

  const netChange =
    totalIncome - totalExpenses

  const maxValue = Math.max(
    ...points.flatMap(
      (point) => [
        point.income,
        point.expenses,
      ],
    ),
    1,
  )

  const chartWidth = 900
  const chartHeight = 210

  const incomePath =
    linePath(
      points.map(
        (point) => point.income,
      ),
      chartWidth,
      chartHeight,
      maxValue,
    )

  const expensePath =
    linePath(
      points.map(
        (point) =>
          point.expenses,
      ),
      chartWidth,
      chartHeight,
      maxValue,
    )

  return (
    <section
      className="
        flex h-full
        min-h-[410px]
        flex-col
        rounded-2xl
        border border-line/50
        bg-surface
        p-5
        shadow-[0_10px_30px_rgba(23,60,50,0.05)]
        sm:p-6
      "
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-ink">
            Money overview
          </h2>

          <p className="mt-1 text-xs text-muted">
            Income and expenses over
            the last 12 months
          </p>
        </div>

        {currencyCodes.length > 1 && (
          <select
            value={activeCurrency}
            onChange={(event) =>
              setSelectedCurrency(
                event.target.value,
              )
            }
            aria-label="Cash flow currency"
            className="
              cursor-pointer
              rounded-lg
              border border-line
              bg-app
              py-1.5 pr-8 pl-3
              text-xs font-semibold
              text-ink
              outline-none
              transition
              focus:border-accent
            "
          >
            {currencyCodes.map(
              (currency) => (
                <option
                  key={currency}
                  value={currency}
                >
                  {currency}
                </option>
              ),
            )}
          </select>
        )}
      </div>

      {reportQuery.isPending && (
        <div className="grid flex-1 place-items-center text-muted">
          <LoaderCircle
            className="animate-spin"
            size={24}
            aria-label="Loading cash flow"
          />
        </div>
      )}

      {reportQuery.isError && (
        <div className="grid flex-1 place-items-center text-center">
          <div>
            <p className="text-sm text-danger">
              Cash flow could not be
              loaded.
            </p>

            <button
              type="button"
              onClick={() =>
                void reportQuery.refetch()
              }
              className="mt-2 cursor-pointer text-xs font-semibold text-accent underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {reportQuery.isSuccess &&
        points.length === 0 && (
          <div className="grid flex-1 place-items-center">
            <p className="max-w-sm text-center text-sm leading-6 text-muted">
              Add posted transactions
              to start building your
              cash-flow history.
            </p>
          </div>
        )}

      {points.length > 0 &&
        activeCurrency && (
          <>
            <div className="mt-6">
              <p className="text-xs font-medium text-muted">
                Net change
              </p>

              <p
                className={
                  netChange >= 0
                    ? 'mt-1 text-3xl font-semibold tracking-[-0.03em] text-success'
                    : 'mt-1 text-3xl font-semibold tracking-[-0.03em] text-danger'
                }
              >
                {netChange >= 0
                  ? '+'
                  : ''}
                {formatMoney(
                  netChange,
                  activeCurrency,
                )}
              </p>
            </div>

            <div className="mt-6 min-h-0 flex-1">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="h-[210px] w-full overflow-visible"
                role="img"
                aria-label="Income and expense trend"
                preserveAspectRatio="none"
              >
                {[0.25, 0.5, 0.75].map(
                  (ratio) => (
                    <line
                      key={ratio}
                      x1="0"
                      y1={
                        chartHeight *
                        ratio
                      }
                      x2={chartWidth}
                      y2={
                        chartHeight *
                        ratio
                      }
                      stroke="currentColor"
                      className="text-line/60"
                      strokeWidth="1"
                    />
                  ),
                )}

                <path
                  d={incomePath}
                  fill="none"
                  stroke="currentColor"
                  className="text-success"
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                />

                <path
                  d={expensePath}
                  fill="none"
                  stroke="currentColor"
                  className="text-danger"
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              <div
                className="
                  mt-2
                  grid
                  text-[10px]
                  font-medium
                  text-subtle
                "
                style={{
                  gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))`,
                }}
              >
                {points.map(
                  (point) => (
                    <span
                      key={
                        point.monthStart
                      }
                      className="text-center"
                    >
                      {getMonthLabel(
                        point.monthStart,
                      )}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line/50 pt-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-md bg-success-soft text-success">
                  <ArrowUp
                    size={13}
                    aria-hidden
                  />
                </span>

                <span className="text-muted">
                  Money in
                </span>

                <strong className="font-semibold text-ink">
                  {formatMoney(
                    totalIncome,
                    activeCurrency,
                    0,
                  )}
                </strong>
              </div>

              <div className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-md bg-danger-soft text-danger">
                  <ArrowDown
                    size={13}
                    aria-hidden
                  />
                </span>

                <span className="text-muted">
                  Money out
                </span>

                <strong className="font-semibold text-ink">
                  {formatMoney(
                    totalExpenses,
                    activeCurrency,
                    0,
                  )}
                </strong>
              </div>
            </div>
          </>
        )}
    </section>
  )
}
