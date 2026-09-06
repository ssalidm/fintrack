import {
  BarChart3,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react'
import type { MonthlyCategorySpending } from '../api/types'
import { useCategorySpending } from '../hooks/useCategorySpending'

interface SpendingItem extends MonthlyCategorySpending {
  amount: number
}

interface CurrencyGroup {
  currencyCode: string
  items: SpendingItem[]
  total: number
}

function groupByCurrency(
  rows: MonthlyCategorySpending[],
): CurrencyGroup[] {
  const groups = new Map<string, SpendingItem[]>()

  for (const row of rows) {
    const amount = Number(row.spentAmount)

    if (!Number.isFinite(amount) || amount <= 0) {
      continue
    }

    const existing = groups.get(row.currencyCode) ?? []

    existing.push({
      ...row,
      amount,
    })

    groups.set(row.currencyCode, existing)
  }

  return Array.from(groups.entries())
    .map(([currencyCode, items]) => {
      const sortedItems = items.sort(
        (first, second) => second.amount - first.amount,
      )

      return {
        currencyCode,
        items: sortedItems,
        total: sortedItems.reduce(
          (total, item) => total + item.amount,
          0,
        ),
      }
    })
    .sort((first, second) =>
      first.currencyCode.localeCompare(second.currencyCode),
    )
}

function formatMoney(amount: number, currencyCode: string) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(amount)
}

export default function CategorySpendingChart() {
  const spendingQuery = useCategorySpending()
  const groups = groupByCurrency(spendingQuery.data ?? [])

  const monthLabel = new Intl.DateTimeFormat('en-ZA', {
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-[#dedbd2] bg-[#fbfaf6] shadow-[0_14px_40px_rgba(36,64,54,0.04)]">
      <header className="flex flex-col gap-4 border-b border-[#e2ded4] px-6 py-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6c7973]">
            Where it went
          </p>

          <h2 className="mt-2 font-serif text-3xl text-[#173c32]">
            Spending by category
          </h2>

          <p className="mt-2 text-sm text-[#69756f]">
            Your leading expenses for {monthLabel}.
          </p>
        </div>

        <span className="grid size-12 place-items-center rounded-2xl bg-[#deebe1] text-[#276b56]">
          <BarChart3 size={22} aria-hidden />
        </span>
      </header>

      {spendingQuery.isPending && (
        <div className="grid min-h-64 place-items-center">
          <div className="text-center text-[#69756f]">
            <LoaderCircle
              className="mx-auto animate-spin"
              size={27}
              aria-hidden
            />

            <p className="mt-3 text-sm">
              Preparing your spending picture…
            </p>
          </div>
        </div>
      )}

      {spendingQuery.isError && (
        <div className="m-6 rounded-2xl border border-[#e8c8bf] bg-[#fff4f1] px-5 py-4">
          <p className="font-semibold text-[#8f3f30]">
            We couldn’t load your spending graph.
          </p>

          <p className="mt-1 text-sm text-[#9b5a4d]">
            {spendingQuery.error instanceof Error
              ? spendingQuery.error.message
              : 'Please try again.'}
          </p>

          <button
            type="button"
            onClick={() => {
              void spendingQuery.refetch()
            }}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#174f43] underline underline-offset-4"
          >
            <RefreshCw size={14} aria-hidden />
            Try again
          </button>
        </div>
      )}

      {spendingQuery.isSuccess && groups.length === 0 && (
        <div className="grid min-h-64 place-items-center px-6 py-12 text-center">
          <div>
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#e4ede7] text-[#276b56]">
              <BarChart3 size={24} aria-hidden />
            </span>

            <h3 className="mt-5 font-serif text-2xl text-[#173c32]">
              A quiet month so far
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-[#69756f]">
              Expense transactions recorded this month will build your
              category spending graph.
            </p>
          </div>
        </div>
      )}

      {spendingQuery.isSuccess && groups.length > 0 && (
        <div className="space-y-8 px-6 py-7">
          {groups.map((group) => {
            const visibleItems = group.items.slice(0, 6)
            const maximumAmount = Math.max(
              ...visibleItems.map((item) => item.amount),
              1,
            )

            return (
              <div key={group.currencyCode}>
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6c7973]">
                      {group.currencyCode} spending
                    </p>

                    <p className="mt-1 font-serif text-2xl text-[#173c32]">
                      {formatMoney(
                        group.total,
                        group.currencyCode,
                      )}
                    </p>
                  </div>

                  <p className="text-xs text-[#748079]">
                    Top {visibleItems.length}{' '}
                    {visibleItems.length === 1
                      ? 'category'
                      : 'categories'}
                  </p>
                </div>

                <div className="space-y-5">
                  {visibleItems.map((item) => {
                    const width = Math.max(
                      (item.amount / maximumAmount) * 100,
                      3,
                    )

                    return (
                      <div key={item.categoryId}>
                        <div className="mb-2 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#173c32]">
                              {item.categoryName}
                            </p>

                            <p className="mt-0.5 text-xs text-[#748079]">
                              {item.transactionCount}{' '}
                              {item.transactionCount === 1
                                ? 'transaction'
                                : 'transactions'}
                            </p>
                          </div>

                          <p className="shrink-0 text-sm font-semibold text-[#173c32]">
                            {formatMoney(
                              item.amount,
                              item.currencyCode,
                            )}
                          </p>
                        </div>

                        <div
                          className="h-3 overflow-hidden rounded-full bg-[#e8e7df]"
                          role="img"
                          aria-label={`${item.categoryName}: ${formatMoney(
                            item.amount,
                            item.currencyCode,
                          )}`}
                        >
                          <div
                            className="h-full rounded-full bg-[#2b7d67] transition-[width] duration-500"
                            style={{
                              width: `${width}%`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {group.items.length > visibleItems.length && (
                  <p className="mt-5 text-xs text-[#748079]">
                    Plus {group.items.length - visibleItems.length}{' '}
                    smaller categories.
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}