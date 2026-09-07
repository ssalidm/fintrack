import {
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react'

import type {
  Budget,
  BudgetCategoryLimit,
  BudgetCategoryPerformance,
  BudgetPerformance,
} from '../api/types'

interface BudgetPerformancePanelProps {
  budget: Budget
  performance?: BudgetPerformance
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  onAddLimit: () => void
  onEditLimit: (
    limit: BudgetCategoryLimit,
    categoryName: string,
  ) => void
  onRemoveLimit: (
    limit: BudgetCategoryLimit,
    categoryName: string,
  ) => void
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

function clampPercentage(
  value: number,
) {
  return Math.min(
    Math.max(value, 0),
    100,
  )
}

function categoryTone(
  category: BudgetCategoryPerformance,
) {
  if (category.exceeded) {
    return {
      label: 'Over limit',
      text: 'text-[#a5503d]',
      pill:
        'bg-[#f4e2dc] text-[#954936]',
      bar: 'bg-[#b85e47]',
    }
  }

  if (
    category.utilizationPercentage >=
    85
  ) {
    return {
      label: 'Close watch',
      text: 'text-[#8a5f20]',
      pill:
        'bg-[#f5e8c8] text-[#7b551d]',
      bar: 'bg-[#c39442]',
    }
  }

  return {
    label: 'On track',
    text: 'text-[#236a58]',
    pill:
      'bg-[#dfece4] text-[#236a58]',
    bar: 'bg-[#5f9278]',
  }
}

function performanceMessage(
  performance?: BudgetPerformance,
) {
  if (
    !performance ||
    performance.categories.length === 0
  ) {
    return {
      heading: 'A clean page',
      copy:
        'Add a few thoughtful limits and let the month reveal its shape.',
    }
  }

  if (performance.anyCategoryExceeded) {
    return {
      heading:
        'A little course correction',
      copy:
        'Some categories crossed their boundaries. Notice the pattern before changing the plan.',
    }
  }

  if (
    performance.utilizationPercentage >=
    85
  ) {
    return {
      heading:
        'The edges are getting close',
      copy:
        'Your plan is still intact. The remaining choices simply deserve more attention.',
    }
  }

  return {
    heading: 'Room to move',
    copy:
      'Your spending is sitting comfortably inside the boundaries you chose.',
  }
}

export default function BudgetPerformancePanel({
  budget,
  performance,
  isLoading,
  isError,
  onRetry,
  onAddLimit,
  onEditLimit,
  onRemoveLimit,
}: BudgetPerformancePanelProps) {
  const isArchived =
    budget.status === 'ARCHIVED'

  const totalLimit =
    performance?.totalLimitAmount ?? 0

  const totalSpent =
    performance?.totalSpentAmount ?? 0

  const totalRemaining =
    performance?.totalRemainingAmount ?? 0

  const utilization =
    performance?.utilizationPercentage ??
    0

  const message =
    performanceMessage(performance)

  if (isError) {
    return (
      <section className="rounded-[1.75rem] border border-[#e8c8bf] bg-[#fff8f4] p-6 sm:p-8">
        <AlertTriangle
          size={25}
          className="text-[#a5503d]"
          aria-hidden
        />

        <h2 className="mt-5 font-serif text-2xl text-[#173c32]">
          We could not read this budget
          yet
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-[#657972]">
          The budget itself is safe. Its
          live spending report could not be
          loaded.
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#d8d6ce] px-5 py-2.5 text-sm font-semibold text-[#173c32] transition hover:bg-[#efede7]"
        >
          <RefreshCw size={16}/>
          Try again
        </button>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[1.75rem] border border-[#dedbd2] bg-[#fffdf8]">
        <div className="grid lg:grid-cols-[1fr_280px]">
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
                  MONTH AT A GLANCE
                </p>

                <h2 className="mt-2 font-serif text-2xl text-[#173c32]">
                  Your spending boundary
                </h2>
              </div>

              {performance?.anyCategoryExceeded ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-[#f4e2dc] px-3 py-1.5 text-xs font-semibold text-[#954936]">
                  <AlertTriangle
                    size={14}
                  />
                  Needs attention
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-[#dfece4] px-3 py-1.5 text-xs font-semibold text-[#236a58]">
                  <CheckCircle2
                    size={14}
                  />
                  Looking steady
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="mt-7 animate-pulse space-y-5">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-16 rounded-2xl bg-[#eceae3]"/>
                  <div className="h-16 rounded-2xl bg-[#eceae3]"/>
                  <div className="h-16 rounded-2xl bg-[#eceae3]"/>
                </div>

                <div className="h-2 rounded-full bg-[#eceae3]"/>
              </div>
            ) : (
              <>
                <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:divide-x sm:divide-[#e2ded4]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7a8984]">
                      Planned
                    </p>

                    <p className="mt-2 text-xl font-semibold text-[#173c32]">
                      {formatMoney(
                        totalLimit,
                        budget.currencyCode,
                      )}
                    </p>
                  </div>

                  <div className="sm:pl-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7a8984]">
                      Spent
                    </p>

                    <p className="mt-2 text-xl font-semibold text-[#173c32]">
                      {formatMoney(
                        totalSpent,
                        budget.currencyCode,
                      )}
                    </p>
                  </div>

                  <div className="sm:pl-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7a8984]">
                      {totalRemaining < 0
                        ? 'Over by'
                        : 'Remaining'}
                    </p>

                    <p
                      className={`mt-2 text-xl font-semibold ${
                        totalRemaining < 0
                          ? 'text-[#a5503d]'
                          : 'text-[#236a58]'
                      }`}
                    >
                      {formatMoney(
                        Math.abs(
                          totalRemaining,
                        ),
                        budget.currencyCode,
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-7">
                  <div className="flex items-center justify-between gap-4 text-xs text-[#657972]">
                    <span>
                      Overall use
                    </span>

                    <span className="font-semibold text-[#173c32]">
                      {Math.round(
                        utilization,
                      )}
                      %
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e8e7df]">
                    <div
                      className={`h-full rounded-full transition-all ${
                        performance?.anyCategoryExceeded
                          ? 'bg-[#b85e47]'
                          : utilization >=
                              85
                            ? 'bg-[#c39442]'
                            : 'bg-[#5f9278]'
                      }`}
                      style={{
                        width: `${clampPercentage(
                          utilization,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <aside className="border-t border-[#dedbd2] bg-[#e7efe9] p-6 lg:border-l lg:border-t-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 text-[#236a58]">
              <Gauge
                size={20}
                aria-hidden
              />
            </div>

            <h3 className="mt-5 font-serif text-2xl text-[#173c32]">
              {message.heading}
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#536b63]">
              {message.copy}
            </p>
          </aside>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[#dedbd2] bg-[#fffdf8]">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e2ded4] px-5 py-5 sm:px-7">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
              CATEGORY RHYTHM
            </p>

            <h2 className="mt-2 font-serif text-2xl text-[#173c32]">
              Where the plan lives
            </h2>
          </div>

          {!isArchived && (
            <button
              type="button"
              onClick={onAddLimit}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#174f43] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#236a58]"
            >
              <Plus size={16}/>
              Add limit
            </button>
          )}
        </header>

        {isLoading ? (
          <div className="space-y-4 p-5 sm:p-7">
            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="h-24 animate-pulse rounded-2xl bg-[#efede7]"
                />
              ),
            )}
          </div>
        ) : !performance ||
          performance.categories.length ===
            0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e7efe9] text-[#236a58]">
              <Gauge size={22}/>
            </div>

            <h3 className="mt-5 font-serif text-2xl text-[#173c32]">
              No limits yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#657972]">
              Start with the categories that
              tend to drift. A budget does
              not need to account for every
              cent to be useful.
            </p>

            {!isArchived && (
              <button
                type="button"
                onClick={onAddLimit}
                className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#bfcfc6] px-5 py-2.5 text-sm font-semibold text-[#174f43] transition hover:bg-[#e7efe9]"
              >
                <Plus size={16}/>
                Add the first limit
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#e6e2d9]">
            {performance.categories.map(
              (category) => {
                const tone =
                  categoryTone(category)

                const limit =
                  budget.limits.find(
                    (item) =>
                      item.id ===
                      category.budgetLimitId,
                  )

                return (
                  <article
                    key={
                      category.budgetLimitId
                    }
                    className="px-5 py-5 sm:px-7"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-semibold text-[#173c32]">
                            {
                              category.categoryName
                            }
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone.pill}`}
                          >
                            {tone.label}
                          </span>
                        </div>

                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e8e7df]">
                          <div
                            className={`h-full rounded-full ${tone.bar}`}
                            style={{
                              width: `${clampPercentage(
                                category.utilizationPercentage,
                              )}%`,
                            }}
                          />
                        </div>

                        <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-[#657972]">
                          <span>
                            {formatMoney(
                              category.spentAmount,
                              budget.currencyCode,
                            )}{' '}
                            spent of{' '}
                            {formatMoney(
                              category.limitAmount,
                              budget.currencyCode,
                            )}
                          </span>

                          <span
                            className={
                              tone.text
                            }
                          >
                            {category.exceeded
                              ? `${formatMoney(
                                  Math.abs(
                                    category.remainingAmount,
                                  ),
                                  budget.currencyCode,
                                )} over`
                              : `${formatMoney(
                                  category.remainingAmount,
                                  budget.currencyCode,
                                )} left`}
                          </span>
                        </div>
                      </div>

                      {!isArchived &&
                        limit && (
                          <div className="flex shrink-0 gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                onEditLimit(
                                  limit,
                                  category.categoryName,
                                )
                              }
                              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#d8d6ce] px-3.5 py-2 text-xs font-semibold text-[#173c32] transition hover:bg-[#efede7]"
                            >
                              <Pencil
                                size={14}
                              />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                onRemoveLimit(
                                  limit,
                                  category.categoryName,
                                )
                              }
                              className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#e3c9c2] p-2 text-[#a5503d] transition hover:bg-[#fff0eb]"
                              aria-label={`Remove ${category.categoryName} limit`}
                            >
                              <Trash2
                                size={15}
                              />
                            </button>
                          </div>
                        )}
                    </div>
                  </article>
                )
              },
            )}
          </div>
        )}
      </section>
    </div>
  )
}