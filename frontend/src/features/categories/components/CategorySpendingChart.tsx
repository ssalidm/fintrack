import { useState } from 'react'
import {
  LoaderCircle,
  RefreshCw,
} from 'lucide-react'

import type { MonthlyCategorySpending } from '@/features/categories/api/types'
import { useCategorySpending } from '@/features/categories/hooks/useCategorySpending'

interface SpendingItem
  extends MonthlyCategorySpending {
  amount: number
}

function formatMoney(
  amount: number,
  currencyCode: string,
) {
  return new Intl.NumberFormat(
    'en-ZA',
    {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2,
    },
  ).format(amount)
}

function getMonthLabel() {
  return new Intl.DateTimeFormat(
    'en-ZA',
    {
      month: 'long',
      year: 'numeric',
    },
  ).format(new Date())
}

export default function CategorySpendingChart() {
  const [
    selectedCurrency,
    setSelectedCurrency,
  ] = useState<string | null>(
    null,
  )

  const spendingQuery =
    useCategorySpending()

  const currencyCodes =
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
    ).sort()

  const activeCurrency =
    selectedCurrency &&
    currencyCodes.includes(
      selectedCurrency,
    )
      ? selectedCurrency
      : currencyCodes[0]

  const items: SpendingItem[] =
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
        ...item,
        amount: Number(
          item.spentAmount,
        ),
      }))
      .filter(
        (item) =>
          Number.isFinite(
            item.amount,
          ) &&
          item.amount > 0,
      )
      .sort(
        (
          first,
          second,
        ) =>
          second.amount -
          first.amount,
      )

  const visibleItems =
    items.slice(0, 4)

  const totalSpent =
    items.reduce(
      (total, item) =>
        total + item.amount,
      0,
    )

  const transactionCount =
    items.reduce(
      (total, item) =>
        total +
        item.transactionCount,
      0,
    )

  const maximumAmount =
    Math.max(
      ...visibleItems.map(
        (item) =>
          item.amount,
      ),
      1,
    )

  const leadingCategory =
    items[0]

  const leadingShare =
    leadingCategory &&
    totalSpent > 0
      ? Math.round(
          (
            leadingCategory.amount /
            totalSpent
          ) * 100,
        )
      : 0

  return (
    <section className="overflow-hidden rounded-2xl border border-line/50 bg-surface shadow-[0_10px_30px_rgba(23,60,50,0.03)]">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line/50 px-5 py-4 sm:px-6">
        <div>
          <p className="type-eyebrow">
            {getMonthLabel()}
          </p>

          <h2 className="mt-1 text-lg font-semibold text-ink">
            Spending snapshot
          </h2>

          <p className="mt-1 text-sm text-muted">
            Your leading expense
            categories this month.
          </p>
        </div>

        {currencyCodes.length >
          1 && (
          <select
            value={
              activeCurrency
            }
            onChange={(event) =>
              setSelectedCurrency(
                event.target
                  .value,
              )
            }
            aria-label="Spending currency"
            className="cursor-pointer rounded-full border border-line bg-surface px-3 py-2 pr-9 text-xs font-semibold text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
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
      </header>

      {spendingQuery.isPending && (
        <div className="grid min-h-52 place-items-center text-muted">
          <div className="text-center">
            <LoaderCircle
              className="mx-auto animate-spin"
              size={24}
              aria-hidden
            />

            <p className="mt-3 text-sm">
              Preparing your
              spending snapshot…
            </p>
          </div>
        </div>
      )}

      {spendingQuery.isError && (
        <div className="grid min-h-52 place-items-center px-6 text-center">
          <div>
            <p className="text-sm font-semibold text-danger">
              We couldn’t load
              your spending.
            </p>

            <p className="mt-1 text-sm text-muted">
              {spendingQuery.error instanceof
              Error
                ? spendingQuery
                    .error.message
                : 'Please try again.'}
            </p>

            <button
              type="button"
              onClick={() =>
                void spendingQuery.refetch()
              }
              className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-primary underline underline-offset-4"
            >
              <RefreshCw
                size={14}
                aria-hidden
              />

              Try again
            </button>
          </div>
        </div>
      )}

      {spendingQuery.isSuccess &&
        currencyCodes.length ===
          0 && (
          <div className="grid min-h-52 place-items-center px-6 text-center">
            <div>
              <h3 className="text-xl font-semibold text-ink">
                A quiet month so
                far
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-muted">
                Expense
                transactions will
                build your category
                spending snapshot.
              </p>
            </div>
          </div>
        )}

      {spendingQuery.isSuccess &&
        activeCurrency && (
          <div className="grid lg:grid-cols-[minmax(0,1.7fr)_minmax(230px,0.75fr)]">
            <div className="px-5 py-5 sm:px-6">
              <div className="space-y-4">
                {visibleItems.map(
                  (item) => {
                    const width =
                      Math.max(
                        (
                          item.amount /
                          maximumAmount
                        ) * 100,
                        4,
                      )

                    return (
                      <div
                        key={
                          item.categoryId
                        }
                      >
                        <div className="mb-1.5 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-ink">
                              {
                                item.categoryName
                              }
                            </p>

                            <p className="mt-0.5 text-[11px] text-subtle">
                              {
                                item.transactionCount
                              }{' '}
                              {item.transactionCount ===
                              1
                                ? 'transaction'
                                : 'transactions'}
                            </p>
                          </div>

                          <p className="shrink-0 text-sm font-semibold text-ink">
                            {formatMoney(
                              item.amount,
                              item.currencyCode,
                            )}
                          </p>
                        </div>

                        <div
                          className="h-2 overflow-hidden rounded-full bg-surface-strong"
                          role="img"
                          aria-label={`${item.categoryName}: ${formatMoney(
                            item.amount,
                            item.currencyCode,
                          )}`}
                        >
                          <div
                            className="h-full rounded-full bg-accent transition-[width] duration-500"
                            style={{
                              width: `${width}%`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  },
                )}
              </div>

              {items.length >
                visibleItems.length && (
                <p className="mt-4 text-xs text-subtle">
                  Plus{' '}
                  {items.length -
                    visibleItems.length}{' '}
                  more spending{' '}
                  {items.length -
                    visibleItems.length ===
                  1
                    ? 'category'
                    : 'categories'}
                  .
                </p>
              )}
            </div>

            <aside className="border-t border-line/50 bg-surface-muted/50 px-5 py-5 sm:px-6 lg:border-l lg:border-t-0">
              <p className="type-eyebrow">
                At a glance
              </p>

              <dl className="mt-5 space-y-5">
                <div>
                  <dt className="text-xs text-muted">
                    Total spent
                  </dt>

                  <dd className="mt-1 text-lg font-semibold text-ink">
                    {formatMoney(
                      totalSpent,
                      activeCurrency,
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-muted">
                    Expense
                    transactions
                  </dt>

                  <dd className="mt-1 text-lg font-semibold text-ink">
                    {
                      transactionCount
                    }
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-muted">
                    Leading category
                  </dt>

                  <dd className="mt-1 text-sm font-semibold text-ink">
                    {leadingCategory
                      ?.categoryName ??
                      'None yet'}
                  </dd>

                  {leadingCategory && (
                    <p className="mt-1 text-xs leading-5 text-subtle">
                      {leadingShare}%
                      of this month’s
                      recorded
                      spending
                    </p>
                  )}
                </div>

                <div>
                  <dt className="text-xs text-muted">
                    Categories used
                  </dt>

                  <dd className="mt-1 text-sm font-semibold text-ink">
                    {items.length}
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        )}
    </section>
  )
}
