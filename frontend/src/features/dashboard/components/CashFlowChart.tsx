import { useState } from 'react'
import {
  BarChart3,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react'
import type { MonthlyCashFlow } from '../api/types'
import { useCashFlowReport } from '../hooks/useCashFlowReport'

interface CashFlowPoint {
  monthStart: string
  totalIncome: number
  totalExpenses: number
  netCashFlow: number
}

function formatMonthStart(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')

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
  const [year, month] = monthStart.split('-').map(Number)

  return new Intl.DateTimeFormat('en-ZA', {
    month: 'short',
  }).format(new Date(year, month - 1, 1))
}

function formatMoney(amount: number, currencyCode: string) {
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
      totalExpenses: Number(row?.totalExpenses ?? 0),
      netCashFlow: Number(row?.netCashFlow ?? 0),
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
    <section className="overflow-hidden rounded-3xl border border-[#dedbd2] bg-[#fffdf8]">
      <header className="flex flex-col gap-5 border-b border-[#e5e1d8] px-6 py-6 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
            SIX-MONTH VIEW
          </p>

          <h2 className="mt-3 font-serif text-3xl tracking-[-0.02em] text-[#173c32] sm:text-4xl">
            Your cash flow
          </h2>

          <p className="mt-2 text-sm text-[#657972]">
            Income and expenses across the last six months.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {currencyCodes.length > 1 && (
            <select
              value={activeCurrency}
              onChange={(event) =>
                setSelectedCurrency(event.target.value)
              }
              aria-label="Cash-flow currency"
              className="cursor-pointer rounded-full border border-[#d7d3c9] bg-white py-2 pr-10 pl-4 text-xs font-semibold text-[#173c32] outline-none focus:border-[#2b7d67]"
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

          <span className="grid size-11 place-items-center rounded-2xl bg-[#deebe1] text-[#276b56]">
            <BarChart3 size={20} aria-hidden />
          </span>
        </div>
      </header>

      {cashFlowQuery.isPending && (
        <div className="grid min-h-80 place-items-center">
          <div className="text-center text-[#657972]">
            <LoaderCircle
              className="mx-auto animate-spin"
              size={27}
              aria-hidden
            />

            <p className="mt-3 text-sm">
              Building your cash-flow view…
            </p>
          </div>
        </div>
      )}

      {cashFlowQuery.isError && (
        <div className="m-6 rounded-2xl border border-[#e8c8bf] bg-[#fff4f1] px-5 py-4">
          <p className="font-semibold text-[#8f3f30]">
            We couldn’t load your cash flow.
          </p>

          <p className="mt-1 text-sm text-[#9b5a4d]">
            {cashFlowQuery.error instanceof Error
              ? cashFlowQuery.error.message
              : 'Please try again.'}
          </p>

          <button
            type="button"
            onClick={() => {
              void cashFlowQuery.refetch()
            }}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#174f43] underline underline-offset-4"
          >
            <RefreshCw size={14} aria-hidden />
            Try again
          </button>
        </div>
      )}

      {cashFlowQuery.isSuccess &&
        currencyCodes.length === 0 && (
          <div className="grid min-h-80 place-items-center px-6 text-center">
            <div>
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#e4ede7] text-[#276b56]">
                <BarChart3 size={24} aria-hidden />
              </span>

              <h3 className="mt-5 font-serif text-2xl text-[#173c32]">
                Your graph is ready
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-[#657972]">
                Add income and expense transactions to begin
                building your six-month cash-flow history.
              </p>
            </div>
          </div>
        )}

      {cashFlowQuery.isSuccess && activeCurrency && (
        <div className="px-6 py-7 sm:px-8">
          <div className="grid gap-5 border-b border-[#e5e1d8] pb-6 sm:grid-cols-3">
            <div>
              <p className="text-xs text-[#657972]">
                Total income
              </p>

              <p className="mt-1 font-semibold text-[#36775d]">
                {formatMoney(totalIncome, activeCurrency)}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#657972]">
                Total expenses
              </p>

              <p className="mt-1 font-semibold text-[#a85e49]">
                {formatMoney(totalExpenses, activeCurrency)}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#657972]">
                Net flow
              </p>

              <p
                className={[
                  'mt-1 font-semibold',
                  totalNetFlow >= 0
                    ? 'text-[#36775d]'
                    : 'text-[#a85e49]',
                ].join(' ')}
              >
                {formatMoney(totalNetFlow, activeCurrency)}
              </p>
            </div>
          </div>

          <div className="mt-7 flex items-center gap-5 text-xs text-[#657972]">
            <span className="inline-flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[#4f8d71]" />
              Income
            </span>

            <span className="inline-flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[#c98767]" />
              Expenses
            </span>
          </div>

          <div className="overflow-x-auto">
            <div className="mt-6 min-w-[600px]">
              <div className="grid h-64 grid-cols-6 gap-4 border-b border-[#d9d6cd]">
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
                        className="flex min-h-0 flex-1 items-end justify-center gap-2"
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
                          className="w-5 rounded-t-md bg-[#4f8d71] transition-[height] duration-500"
                          style={{
                            height: `${incomeHeight}%`,
                          }}
                        />

                        <div
                          title={`Expenses: ${formatMoney(
                            point.totalExpenses,
                            activeCurrency,
                          )}`}
                          className="w-5 rounded-t-md bg-[#c98767] transition-[height] duration-500"
                          style={{
                            height: `${expenseHeight}%`,
                          }}
                        />
                      </div>

                      <div className="h-16 pt-3 text-center">
                        <p className="text-xs font-semibold text-[#173c32]">
                          {getMonthLabel(point.monthStart)}
                        </p>

                        <p
                          className={[
                            'mt-1 text-[10px] font-medium',
                            point.netCashFlow >= 0
                              ? 'text-[#36775d]'
                              : 'text-[#a85e49]',
                          ].join(' ')}
                        >
                          {formatCompactMoney(
                            point.netCashFlow,
                            activeCurrency,
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
    </section>
  )
}