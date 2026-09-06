import { useState } from 'react'
import {
  ArrowRight,
  LoaderCircle,
} from 'lucide-react'
import { Link } from 'react-router'
import { useCategorySpending } from '../../categories/hooks/useCategorySpending'

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

export default function TopSpendingCard() {
  const [selectedCurrency, setSelectedCurrency] =
    useState<string | null>(null)

  const spendingQuery = useCategorySpending()

  const currencyCodes = Array.from(
    new Set(
      (spendingQuery.data ?? []).map(
        (item) => item.currencyCode,
      ),
    ),
  ).sort()

  const activeCurrency =
    selectedCurrency &&
    currencyCodes.includes(selectedCurrency)
      ? selectedCurrency
      : currencyCodes[0]

  const items = (spendingQuery.data ?? [])
    .filter(
      (item) =>
        item.currencyCode === activeCurrency,
    )
    .map((item) => ({
      ...item,
      amount: Number(item.spentAmount),
    }))
    .sort(
      (first, second) =>
        second.amount - first.amount,
    )
    .slice(0, 5)

  const maximumAmount = Math.max(
    ...items.map((item) => item.amount),
    1,
  )

  return (
    <article className="flex min-h-[330px] flex-col rounded-3xl border border-[#dedbd2] bg-[#fffdf8] p-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
            THIS MONTH
          </p>

          <h2 className="mt-2 font-serif text-2xl text-[#173c32]">
            Top spending
          </h2>
        </div>

        {currencyCodes.length > 1 && (
          <select
            value={activeCurrency}
            onChange={(event) =>
              setSelectedCurrency(event.target.value)
            }
            aria-label="Spending currency"
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

      {spendingQuery.isPending && (
        <div className="grid flex-1 place-items-center text-[#657972]">
          <LoaderCircle
            className="animate-spin"
            size={24}
            aria-label="Loading spending"
          />
        </div>
      )}

      {spendingQuery.isError && (
        <div className="grid flex-1 place-items-center text-center">
          <div>
            <p className="text-sm text-[#8f3f30]">
              Spending could not be loaded.
            </p>

            <button
              type="button"
              onClick={() => {
                void spendingQuery.refetch()
              }}
              className="mt-3 cursor-pointer text-sm font-semibold text-[#174f43] underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {spendingQuery.isSuccess &&
        items.length === 0 && (
          <div className="grid flex-1 place-items-center text-center">
            <p className="max-w-xs text-sm leading-6 text-[#657972]">
              Add expense transactions to see your
              leading categories.
            </p>
          </div>
        )}

      {spendingQuery.isSuccess && items.length > 0 && (
        <div className="mt-6 flex-1 space-y-4">
          {items.map((item) => {
            const width = Math.max(
              (item.amount / maximumAmount) * 100,
              4,
            )

            return (
              <div key={item.categoryId}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium text-[#173c32]">
                    {item.categoryName}
                  </p>

                  <p className="shrink-0 text-xs font-semibold text-[#173c32]">
                    {formatMoney(
                      item.amount,
                      item.currencyCode,
                    )}
                  </p>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[#e8e7df]">
                  <div
                    className="h-full rounded-full bg-[#6f9d7d]"
                    style={{
                      width: `${width}%`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Link
        to="/categories"
        className="mt-6 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#174f43]"
      >
        View categories
        <ArrowRight size={15} aria-hidden />
      </Link>
    </article>
  )
}