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
} from '@/features/budgets/api/types'

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
      text: 'text-danger',
      pill:
        'bg-danger-soft text-danger',
      bar: 'bg-danger',
    }
  }

  if (
    category.utilizationPercentage >=
    85
  ) {
    return {
      label: 'Close watch',
      text: 'text-warning',
      pill:
        'bg-warning-soft text-warning',
      bar: 'bg-warning',
    }
  }

  return {
    label: 'On track',
    text: 'text-success',
    pill:
      'bg-success-soft text-success',
    bar: 'bg-success',
  }
}

function performanceMessage(
  performance?: BudgetPerformance,
) {
  if (
    !performance ||
    performance.categories.length ===
      0
  ) {
    return {
      heading: 'A clean page',
      copy:
        'Add a few thoughtful limits and let the month reveal its shape.',
    }
  }

  if (
    performance.anyCategoryExceeded
  ) {
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
    performance?.totalLimitAmount ??
    0

  const totalSpent =
    performance?.totalSpentAmount ??
    0

  const totalRemaining =
    performance?.totalRemainingAmount ??
    0

  const utilization =
    performance?.utilizationPercentage ??
    0

  const message =
    performanceMessage(
      performance,
    )

  if (isError) {
    return (
      <section className="rounded-2xl border border-danger/20 bg-danger-soft p-6 sm:p-7">
        <AlertTriangle
          size={22}
          className="text-danger"
          aria-hidden
        />

        <h2 className="mt-4 text-xl font-semibold tracking-[-0.02em] text-ink">
          We could not read this
          budget yet
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
          The budget itself is safe.
          Its live spending report
          could not be loaded.
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-muted"
        >
          <RefreshCw
            size={16}
            aria-hidden
          />

          Try again
        </button>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-line/50 bg-surface">
        <div className="grid lg:grid-cols-[1fr_280px]">
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="type-eyebrow">
                  Month at a glance
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-ink">
                  Your spending
                  boundary
                </h2>
              </div>

              {performance?.anyCategoryExceeded ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-danger-soft px-3 py-1.5 text-xs font-semibold text-danger">
                  <AlertTriangle
                    size={14}
                    aria-hidden
                  />
                  Needs attention
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-success-soft px-3 py-1.5 text-xs font-semibold text-success">
                  <CheckCircle2
                    size={14}
                    aria-hidden
                  />
                  Looking steady
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="mt-7 animate-pulse space-y-5">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-16 rounded-xl bg-surface-muted" />
                  <div className="h-16 rounded-xl bg-surface-muted" />
                  <div className="h-16 rounded-xl bg-surface-muted" />
                </div>

                <div className="h-2 rounded-full bg-surface-muted" />
              </div>
            ) : (
              <>
                <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:divide-x sm:divide-line/50">
                  <div>
                    <p className="type-eyebrow">
                      Planned
                    </p>

                    <p className="mt-2 text-lg font-semibold text-ink">
                      {formatMoney(
                        totalLimit,
                        budget.currencyCode,
                      )}
                    </p>
                  </div>

                  <div className="sm:pl-5">
                    <p className="type-eyebrow">
                      Spent
                    </p>

                    <p className="mt-2 text-lg font-semibold text-ink">
                      {formatMoney(
                        totalSpent,
                        budget.currencyCode,
                      )}
                    </p>
                  </div>

                  <div className="sm:pl-5">
                    <p className="type-eyebrow">
                      {totalRemaining <
                      0
                        ? 'Over by'
                        : 'Remaining'}
                    </p>

                    <p
                      className={`mt-2 text-lg font-semibold ${
                        totalRemaining <
                        0
                          ? 'text-danger'
                          : 'text-success'
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
                  <div className="flex items-center justify-between gap-4 text-xs text-muted">
                    <span>
                      Overall use
                    </span>

                    <span className="font-semibold text-ink">
                      {Math.round(
                        utilization,
                      )}
                      %
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-strong">
                    <div
                      className={`h-full rounded-full transition-all ${
                        performance?.anyCategoryExceeded
                          ? 'bg-danger'
                          : utilization >=
                              85
                            ? 'bg-warning'
                            : 'bg-success'
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

          <aside className="border-t border-line/50 bg-accent-soft p-6 lg:border-l lg:border-t-0">
            <div className="grid size-10 place-items-center rounded-xl bg-surface/70 text-accent">
              <Gauge
                size={18}
                aria-hidden
              />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-ink">
              {message.heading}
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted">
              {message.copy}
            </p>
          </aside>
        </div>
      </section>

      <section className="rounded-2xl border border-line/50 bg-surface">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line/50 px-5 py-4 sm:px-6">
          <div>
            <p className="type-eyebrow">
              Category rhythm
            </p>

            <h2 className="mt-1 text-lg font-semibold text-ink">
              Where the plan lives
            </h2>
          </div>

          {!isArchived && (
            <button
              type="button"
              onClick={onAddLimit}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-inverse transition hover:bg-primary-hover"
            >
              <Plus
                size={16}
                aria-hidden
              />

              Add limit
            </button>
          )}
        </header>

        {isLoading ? (
          <div className="space-y-4 p-5 sm:p-6">
            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-xl bg-surface-muted"
                />
              ),
            )}
          </div>
        ) : !performance ||
          performance.categories
            .length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto grid size-11 place-items-center rounded-xl bg-accent-soft text-accent">
              <Gauge
                size={20}
                aria-hidden
              />
            </div>

            <h3 className="mt-4 text-xl font-semibold text-ink">
              No limits yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              Start with the
              categories that tend
              to drift. A budget does
              not need to account for
              every cent to be useful.
            </p>

            {!isArchived && (
              <button
                type="button"
                onClick={
                  onAddLimit
                }
                className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-accent-soft"
              >
                <Plus
                  size={16}
                  aria-hidden
                />

                Add the first limit
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-line/50">
            {performance.categories.map(
              (category) => {
                const tone =
                  categoryTone(
                    category,
                  )

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
                    className="px-5 py-4 sm:px-6"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-sm font-semibold text-ink">
                            {
                              category.categoryName
                            }
                          </h3>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] ${tone.pill}`}
                          >
                            {tone.label}
                          </span>
                        </div>

                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-strong">
                          <div
                            className={`h-full rounded-full ${tone.bar}`}
                            style={{
                              width: `${clampPercentage(
                                category.utilizationPercentage,
                              )}%`,
                            }}
                          />
                        </div>

                        <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted">
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
                          <div className="flex shrink-0 gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                onEditLimit(
                                  limit,
                                  category.categoryName,
                                )
                              }
                              className="grid size-8 cursor-pointer place-items-center rounded-full text-muted transition hover:bg-accent-soft hover:text-accent"
                              aria-label={`Edit ${category.categoryName} limit`}
                              title="Edit limit"
                            >
                              <Pencil
                                size={15}
                                aria-hidden
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                onRemoveLimit(
                                  limit,
                                  category.categoryName,
                                )
                              }
                              className="grid size-8 cursor-pointer place-items-center rounded-full text-muted transition hover:bg-danger-soft hover:text-danger"
                              aria-label={`Remove ${category.categoryName} limit`}
                              title="Remove limit"
                            >
                              <Trash2
                                size={15}
                                aria-hidden
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
