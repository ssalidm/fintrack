import { useState } from 'react'
import {
  LoaderCircle,
  RefreshCw,
} from 'lucide-react'
import type { MonthlyCashFlow } from '../api/types'
import { useCashFlowReport } from '../hooks/useCashFlowReport'

interface CashFlowPoint {
  monthStart: string
  totalIncome: number
  totalExpenses: number
}

function formatMonthStart(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(
    2,
    '0',
  )

  return `${year}-${month}-01`
}

function getLastSixMonths() {
  const today = new Date()

  return Array.from({ length: 6 }, (_, index) => {
    const offset = index - 5

    return formatMonthStart(
      new Date(
        today.getFullYear(),
        today.getMonth() + offset,
        1,
      ),
    )
  })
}

function getMonthLabel(monthStart: string) {
  const [year, month] = monthStart
    .split('-')
    .map(Number)

  return new Intl.DateTimeFormat('en-ZA', {
    month: 'short',
  }).format(new Date(year, month - 1, 1))
}

function formatMoney(
  amount: number,
  currencyCode: string,
) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatCompactMoney(
  amount: number,
  currencyCode: string,
) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'narrowSymbol',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount)
}

function buildCashFlowPoints(
  rows: MonthlyCashFlow[],
  currencyCode: string,
): CashFlowPoint[] {
  return getLastSixMonths().map((monthStart) => {
    const row = rows.find(
      (item) =>
        item.currencyCode === currencyCode &&
        item.monthStart === monthStart,
    )

    return {
      monthStart,
      totalIncome: Number(row?.totalIncome ?? 0),
      totalExpenses: Number(
        row?.totalExpenses ?? 0,
      ),
    }
  })
}

export default function CashFlowChart() {
  const [selectedCurrency, setSelectedCurrency] =
    useState<string | null>(null)

  const cashFlowQuery = useCashFlowReport(6)

  const currencyCodes = Array.from(
    new Set(
      (cashFlowQuery.data ?? []).map(
        (item) => item.currencyCode,
      ),
    ),
  ).sort()

  const activeCurrency =
    selectedCurrency &&
    currencyCodes.includes(selectedCurrency)
      ? selectedCurrency
      : currencyCodes[0]

  const points = activeCurrency
    ? buildCashFlowPoints(
        cashFlowQuery.data ?? [],
        activeCurrency,
      )
    : []

  const maximumAmount = Math.max(
    ...points.flatMap((point) => [
      point.totalIncome,
      point.totalExpenses,
    ]),
    1,
  )

  const totalIncome = points.reduce(
    (total, point) => total + point.totalIncome,
    0,
  )

  const totalExpenses = points.reduce(
    (total, point) => total + point.totalExpenses,
    0,
  )

  const totalNetFlow = totalIncome - totalExpenses

  return (
    <article className="flex min-h-[330px] flex-col overflow-hidden rounded-3xl border border-[#dedbd2] bg-[#fffdf8]">
      <header className="flex items-start justify-between gap-4 px-6 pt-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
            SIX-MONTH VIEW
          </p>

          <h2 className="mt-2 font-serif text-2xl text-[#173c32]">
            Cash flow
          </h2>
        </div>

        {currencyCodes.length > 1 && (
          <select
            value={activeCurrency}
            onChange={(event) =>
              setSelectedCurrency(event.target.value)
            }
            aria-label="Cash-flow currency"
            className="cursor-pointer rounded-full border border-[#d7d3c9] bg-white py-2 pr-9 pl-3 text-xs font-semibold text-[#173c32]"
          >
            {currencyCodes.map((currencyCode) => (
              <option
                key={currencyCode}
                value={currencyCode}
              >
                {currencyCode}
              </option>
            ))}
          </select>
        )}
      </header>

      {cashFlowQuery.isPending && (
        <div className="grid flex-1 place-items-center text-[#657972]">
          <LoaderCircle
            className="animate-spin"
            size={25}
            aria-label="Loading cash flow"
          />
        </div>
      )}

      {cashFlowQuery.isError && (
        <div className="grid flex-1 place-items-center px-6 text-center">
          <div>
            <p className="text-sm text-[#8f3f30]">
              Cash flow could not be loaded.
            </p>

            <button
              type="button"
              onClick={() => {
                void cashFlowQuery.refetch()
              }}
              className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#174f43] underline"
            >
              <RefreshCw size={14} aria-hidden />
              Try again
            </button>
          </div>
        </div>
      )}

      {cashFlowQuery.isSuccess &&
        currencyCodes.length === 0 && (
          <div className="grid flex-1 place-items-center px-6 text-center">
            <p className="max-w-sm text-sm leading-6 text-[#657972]">
              Add income and expense transactions to begin
              building your cash-flow history.
            </p>
          </div>
        )}

      {cashFlowQuery.isSuccess && activeCurrency && (
        <div className="flex flex-1 flex-col px-6 pt-5 pb-6">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-[#657972]">
                Income
              </p>

              <p className="mt-1 text-sm font-semibold text-[#36775d]">
                {formatCompactMoney(
                  totalIncome,
                  activeCurrency,
                )}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wide text-[#657972]">
                Expenses
              </p>

              <p className="mt-1 text-sm font-semibold text-[#a85e49]">
                {formatCompactMoney(
                  totalExpenses,
                  activeCurrency,
                )}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wide text-[#657972]">
                Net flow
              </p>

              <p
                className={[
                  'mt-1 text-sm font-semibold',
                  totalNetFlow >= 0
                    ? 'text-[#36775d]'
                    : 'text-[#a85e49]',
                ].join(' ')}
              >
                {formatCompactMoney(
                  totalNetFlow,
                  activeCurrency,
                )}
              </p>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <div className="min-w-[480px]">
              <div className="grid h-44 grid-cols-6 gap-3 border-b border-[#d9d6cd]">
                {points.map((point) => {
                  const incomeHeight =
                    point.totalIncome === 0
                      ? 1
                      : Math.max(
                          (point.totalIncome /
                            maximumAmount) *
                            100,
                          4,
                        )

                  const expenseHeight =
                    point.totalExpenses === 0
                      ? 1
                      : Math.max(
                          (point.totalExpenses /
                            maximumAmount) *
                            100,
                          4,
                        )

                  return (
                    <div
                      key={point.monthStart}
                      className="flex h-full flex-col"
                    >
                      <div
                        className="flex min-h-0 flex-1 items-end justify-center gap-1.5"
                        aria-label={`${getMonthLabel(
                          point.monthStart,
                        )}: income ${formatMoney(
                          point.totalIncome,
                          activeCurrency,
                        )}, expenses ${formatMoney(
                          point.totalExpenses,
                          activeCurrency,
                        )}`}
                      >
                        <div
                          title={`Income: ${formatMoney(
                            point.totalIncome,
                            activeCurrency,
                          )}`}
                          className="w-3.5 rounded-t bg-[#4f8d71] transition-[height] duration-500"
                          style={{
                            height: `${incomeHeight}%`,
                          }}
                        />

                        <div
                          title={`Expenses: ${formatMoney(
                            point.totalExpenses,
                            activeCurrency,
                          )}`}
                          className="w-3.5 rounded-t bg-[#c98767] transition-[height] duration-500"
                          style={{
                            height: `${expenseHeight}%`,
                          }}
                        />
                      </div>

                      <div className="h-11 pt-2 text-center">
                        <p className="text-xs font-semibold text-[#657972]">
                          {getMonthLabel(
                            point.monthStart,
                          )}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}