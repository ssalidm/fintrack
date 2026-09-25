import {
  Ban,
  CalendarDays,
  Pencil,
  X,
} from 'lucide-react'
import {
  useEffect,
  useState,
} from 'react'

import { ApiClientError } from '@/api/ApiClientError'
import RefreshButton from '@/components/actions/RefreshButton'
import StatusTabs from '@/components/navigation/StatusTabs'
import ErrorPanel from '@/components/ui/ErrorPanel'
import Pagination from '@/components/ui/Pagination'
import { formatMoney } from '@/utils/formatters'
import type {
  GoalContribution,
  GoalContributionStatus,
  SavingsGoal,
} from '../api/types'
import { useGoalContributions } from '@/features/goals/hooks/useGoals'
import EditContributionModal from './EditContributionModal'
import VoidContributionModal from './VoidContributionModal'

interface ContributionHistoryDrawerProps {
  goal: SavingsGoal
  onClose: () => void
}

const statusOptions = [
  {
    value: 'POSTED',
    label: 'Counted',
  },
  {
    value: 'VOIDED',
    label: 'Voided',
  },
] satisfies Array<{
  value: GoalContributionStatus
  label: string
}>

const contributionPageSize = 5

function parseLocalDate(
  value: string,
) {
  const [
    year,
    month,
    day,
  ] = value
    .split('-')
    .map(Number)

  return new Date(
    year,
    month - 1,
    day,
  )
}

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    'en-ZA',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  ).format(
    parseLocalDate(value),
  )
}

function formatTimestamp(
  value: string,
) {
  return new Intl.DateTimeFormat(
    'en-ZA',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    },
  ).format(
    new Date(value),
  )
}

export default function ContributionHistoryDrawer({
  goal,
  onClose,
}: ContributionHistoryDrawerProps) {
  const [
    status,
    setStatus,
  ] =
    useState<GoalContributionStatus>(
      'POSTED',
    )

  const [
    page,
    setPage,
  ] = useState(0)

  const [
    editingContribution,
    setEditingContribution,
  ] =
    useState<GoalContribution | null>(
      null,
    )

  const [
    voidingContribution,
    setVoidingContribution,
  ] =
    useState<GoalContribution | null>(
      null,
    )

  const contributionsQuery =
    useGoalContributions(
      goal.id,
      status,
      page,
      contributionPageSize,
    )

  const contributions =
    contributionsQuery.data
      ?.items ?? []

  const pagination =
    contributionsQuery.data

  const firstVisibleContribution =
    pagination &&
      contributions.length > 0
      ? pagination.page *
      pagination.size +
      1
      : 0

  const lastVisibleContribution =
    pagination &&
      contributions.length > 0
      ? Math.min(
        firstVisibleContribution +
        contributions.length -
        1,
        pagination.totalElements,
      )
      : 0

  useEffect(() => {
    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (
        event.key === 'Escape' &&
        !editingContribution &&
        !voidingContribution
      ) {
        onClose()
      }
    }

    document.addEventListener(
      'keydown',
      handleEscape,
    )

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape,
      )
    }
  }, [
    editingContribution,
    voidingContribution,
    onClose,
  ])

  function changeStatus(
    nextStatus: GoalContributionStatus,
  ) {
    setStatus(nextStatus)
    setPage(0)
  }

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-[#102e27]/45 backdrop-blur-[2px]"
        aria-label="Close contribution history"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="contribution-history-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col bg-app shadow-2xl"
      >
        <header className="border-b border-line px-6 py-6 sm:px-8">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="type-eyebrow">
                Every step counts
              </p>

              <h2
                id="contribution-history-title"
                className="type-page-title mt-3"
              >
                Contribution history
              </h2>

              <p className="type-body mt-2">
                {goal.name}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid size-9 cursor-pointer place-items-center rounded-full border border-line bg-surface text-muted transition hover:bg-surface-muted hover:text-ink"
              aria-label="Close"
              title="Close history"
            >
              <X
                size={18}
                aria-hidden
              />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-xl border border-line/50 bg-surface">
            <div className="p-4">
              <p className="text-xs text-muted">
                Saved so far
              </p>

              <p className="mt-1 text-lg font-semibold text-ink">
                {formatMoney(
                  goal.currentAmount,
                  goal.currencyCode,
                )}
              </p>
            </div>

            <div className="border-l border-line/50 p-4">
              <p className="text-xs text-muted">
                Goal progress
              </p>

              <p className="mt-1 text-lg font-semibold text-success">
                {Math.round(
                  goal.progressPercentage,
                )}
                %
              </p>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-3 sm:px-8">
          <StatusTabs
            value={status}
            options={
              statusOptions
            }
            onChange={
              changeStatus
            }
            ariaLabel="Contribution status"
            variant="pill"
          />

          <RefreshButton
            isRefreshing={
              contributionsQuery.isFetching
            }
            onRefresh={
              contributionsQuery.refetch
            }
            label="Refresh contributions"
            iconOnly
          />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {contributionsQuery.isPending && (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="h-24 rounded-xl bg-surface-muted"
                  />
                ),
              )}
            </div>
          )}

          {contributionsQuery.error && (
            <ErrorPanel
              title="We couldn’t load the history"
              message={
                contributionsQuery.error instanceof
                  ApiClientError
                  ? contributionsQuery
                    .error.message
                  : 'Please try again.'
              }
              onRetry={() =>
                void contributionsQuery.refetch()
              }
            />
          )}

          {!contributionsQuery.isPending &&
            !contributionsQuery.error &&
            contributions.length ===
            0 && (
              <section className="py-14 text-center">
                <span className="mx-auto grid size-11 place-items-center rounded-xl bg-accent-soft text-accent">
                  <CalendarDays
                    size={19}
                    aria-hidden
                  />
                </span>

                <h3 className="mt-4 text-xl font-semibold text-ink">
                  {status ===
                    'POSTED'
                    ? 'No contributions yet'
                    : 'Nothing has been voided'}
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
                  {status ===
                    'POSTED'
                    ? 'Your progress entries will appear here as you add to this goal.'
                    : 'Contributions removed from the total will remain visible here.'}
                </p>
              </section>
            )}

          {!contributionsQuery.isPending &&
            !contributionsQuery.error &&
            contributions.length >
            0 && (
              <div className="space-y-3">
                {contributions.map(
                  (
                    contribution,
                  ) => (
                    <article
                      key={
                        contribution.id
                      }
                      className={`rounded-xl border p-5 ${contribution.status ===
                          'VOIDED'
                          ? 'border-danger/20 bg-danger-soft/40'
                          : 'border-line/50 bg-surface'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-5">
                        <div className="min-w-0">
                          <p
                            className={`text-lg font-semibold ${contribution.status ===
                                'VOIDED'
                                ? 'text-muted line-through'
                                : 'text-ink'
                              }`}
                          >
                            {formatMoney(
                              contribution.amount,
                              goal.currencyCode,
                            )}
                          </p>

                          <p className="mt-1 flex items-center gap-2 text-xs text-muted">
                            <CalendarDays
                              size={14}
                              aria-hidden
                            />

                            {formatDate(
                              contribution.contributionDate,
                            )}
                          </p>
                        </div>

                        {contribution.status ===
                          'POSTED' && (
                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingContribution(
                                    contribution,
                                  )
                                }
                                className="grid size-8 cursor-pointer place-items-center rounded-full text-muted transition hover:bg-accent-soft hover:text-accent"
                                aria-label="Edit contribution"
                                title="Edit contribution"
                              >
                                <Pencil
                                  size={15}
                                  aria-hidden
                                />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setVoidingContribution(
                                    contribution,
                                  )
                                }
                                className="grid size-8 cursor-pointer place-items-center rounded-full text-muted transition hover:bg-danger-soft hover:text-danger"
                                aria-label="Void contribution"
                                title="Void contribution"
                              >
                                <Ban
                                  size={15}
                                  aria-hidden
                                />
                              </button>
                            </div>
                          )}
                      </div>

                      {contribution.note && (
                        <p className="mt-3 text-sm leading-6 text-muted">
                          {
                            contribution.note
                          }
                        </p>
                      )}

                      {contribution.status ===
                        'VOIDED' && (
                          <div className="mt-4 border-t border-danger/20 pt-4">
                            <p className="type-eyebrow text-danger">
                              Voided
                            </p>

                            <p className="mt-2 text-sm text-danger">
                              {
                                contribution.voidReason
                              }
                            </p>

                            {contribution.voidedAt && (
                              <p className="mt-2 text-xs text-subtle">
                                {formatTimestamp(
                                  contribution.voidedAt,
                                )}
                              </p>
                            )}
                          </div>
                        )}
                    </article>
                  ),
                )}
              </div>
            )}
        </div>

        {pagination &&
          !contributionsQuery.error &&
          pagination.totalElements >
          0 && (
            <footer className="border-t border-line bg-surface px-6 py-4 sm:px-8">
              <Pagination
                label="Contribution history pages"
                page={
                  pagination.page
                }
                totalPages={
                  pagination.totalPages
                }
                onPageChange={
                  setPage
                }
                isFetching={
                  contributionsQuery.isFetching
                }
                showPageNumbers
                summary={
                  contributions.length >
                    0
                    ? `Showing ${firstVisibleContribution}–${lastVisibleContribution} of ${pagination.totalElements}`
                    : 'No contributions on this page'
                }
              />
            </footer>
          )}
      </section>

      {editingContribution && (
        <EditContributionModal
          goal={goal}
          contribution={
            editingContribution
          }
          onClose={() =>
            setEditingContribution(
              null,
            )
          }
        />
      )}

      {voidingContribution && (
        <VoidContributionModal
          goal={goal}
          contribution={
            voidingContribution
          }
          onClose={() =>
            setVoidingContribution(
              null,
            )
          }
        />
      )}
    </div>
  )
}
