import {
  useMemo,
  useState,
} from 'react'
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  History,
  Pencil,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'

import { ApiClientError } from '@/api/ApiClientError'
import RefreshButton from '@/components/actions/RefreshButton'
import PageHeader from '@/components/layout/PageHeader'
import PageShell from '@/components/layout/PageShell'
import StatusTabs from '@/components/navigation/StatusTabs'
import EmptyState from '@/components/ui/EmptyState'
import ErrorPanel from '@/components/ui/ErrorPanel'
import { formatMoney } from '@/utils/formatters'
import type {
  SavingsGoal,
  SavingsGoalStatus,
} from '@/features/goals/api/types'
import ContributionHistoryDrawer from '@/features/goals/components/ContributionHistoryDrawer'
import ContributionModal from '@/features/goals/components/ContributionModal'
import GoalActionDialog, {
  type GoalAction,
} from '@/features/goals/components/GoalActionDialog'
import GoalModal from '@/features/goals/components/GoalModal'
import {
  useArchiveGoal,
  useCompleteGoal,
  useGoals,
} from '@/features/goals/hooks/useGoals'

const statusOptions = [
  {
    value: 'ACTIVE',
    label: 'In progress',
  },
  {
    value: 'COMPLETED',
    label: 'Completed',
  },
  {
    value: 'ARCHIVED',
    label: 'Archived',
  },
] satisfies Array<{
  value: SavingsGoalStatus
  label: string
}>

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

function formatTargetDate(
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

function daysUntil(
  value: string,
) {
  const target =
    parseLocalDate(value)

  const now = new Date()

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  )

  return Math.ceil(
    (
      target.getTime() -
      today.getTime()
    ) / 86_400_000,
  )
}

function deadlineCopy(
  targetDate: string | null,
) {
  if (!targetDate) {
    return 'No fixed deadline'
  }

  const remaining =
    daysUntil(targetDate)

  if (remaining < 0) {
    return `${Math.abs(
      remaining,
    )} days past target`
  }

  if (remaining === 0) {
    return 'Target is today'
  }

  return `${remaining} days remaining`
}

interface ActionTarget {
  goal: SavingsGoal
  action: GoalAction
}

export default function GoalsPage() {
  const [
    status,
    setStatus,
  ] =
    useState<SavingsGoalStatus>(
      'ACTIVE',
    )

  const [
    isGoalModalOpen,
    setIsGoalModalOpen,
  ] = useState(false)

  const [
    editingGoal,
    setEditingGoal,
  ] =
    useState<SavingsGoal | null>(
      null,
    )

  const [
    contributionGoal,
    setContributionGoal,
  ] =
    useState<SavingsGoal | null>(
      null,
    )

  const [
    actionTarget,
    setActionTarget,
  ] =
    useState<ActionTarget | null>(
      null,
    )

  const [
    actionError,
    setActionError,
  ] = useState<string | null>(
    null,
  )

  const [
    historyGoalId,
    setHistoryGoalId,
  ] = useState<string | null>(
    null,
  )

  const goalsQuery =
    useGoals(status)

  const completeGoal =
    useCompleteGoal()

  const archiveGoal =
    useArchiveGoal()

  const goals = useMemo(
    () =>
      goalsQuery.data ?? [],
    [goalsQuery.data],
  )

  const historyGoal =
    useMemo(
      () =>
        goals.find(
          (goal) =>
            goal.id ===
            historyGoalId,
        ) ?? null,
      [
        goals,
        historyGoalId,
      ],
    )

  const averageProgress =
    useMemo(() => {
      if (
        goals.length === 0
      ) {
        return 0
      }

      const totalProgress =
        goals.reduce(
          (
            total,
            goal,
          ) =>
            total +
            Math.min(
              goal.progressPercentage,
              100,
            ),
          0,
        )

      return Math.round(
        totalProgress /
          goals.length,
      )
    }, [goals])

  const nearestGoal =
    useMemo(
      () =>
        goals
          .filter(
            (goal) =>
              goal.targetDate !==
              null,
          )
          .toSorted(
            (
              left,
              right,
            ) =>
              left.targetDate!.localeCompare(
                right.targetDate!,
              ),
          )[0],
      [goals],
    )

  const momentumMessage =
    useMemo(() => {
      if (
        status === 'COMPLETED'
      ) {
        return goals.length === 0
          ? 'Finished goals will become milestones here.'
          : goals.length === 1
            ? 'One promise to yourself, kept.'
            : 'A growing record of promises kept.'
      }

      if (
        status === 'ARCHIVED'
      ) {
        return goals.length === 0
          ? 'Nothing tucked away yet.'
          : 'Past plans, kept for perspective.'
      }

      if (
        goals.length === 0
      ) {
        return 'A fresh page for your next plan.'
      }

      if (
        averageProgress >= 100
      ) {
        return 'A target has been reached—time to celebrate it.'
      }

      if (
        averageProgress >= 75
      ) {
        return 'The finish line is getting close.'
      }

      if (
        averageProgress >= 35
      ) {
        return 'Small steps are building something real.'
      }

      return 'Every strong goal starts with one step.'
    }, [
      averageProgress,
      goals.length,
      status,
    ])

  function openCreateGoal() {
    setEditingGoal(null)
    setIsGoalModalOpen(true)
  }

  function openEditGoal(
    goal: SavingsGoal,
  ) {
    setEditingGoal(goal)
    setIsGoalModalOpen(true)
  }

  function closeGoalModal() {
    setIsGoalModalOpen(false)
    setEditingGoal(null)
  }

  function requestAction(
    goal: SavingsGoal,
    action: GoalAction,
  ) {
    setActionError(null)
    setActionTarget({
      goal,
      action,
    })
  }

  async function confirmAction() {
    if (!actionTarget) {
      return
    }

    setActionError(null)

    try {
      if (
        actionTarget.action ===
        'complete'
      ) {
        await completeGoal.mutateAsync(
          {
            goalId:
              actionTarget.goal.id,
            payload: {
              version:
                actionTarget.goal
                  .version,
            },
          },
        )
      } else {
        await archiveGoal.mutateAsync(
          {
            goalId:
              actionTarget.goal.id,
            payload: {
              version:
                actionTarget.goal
                  .version,
            },
          },
        )
      }

      setActionTarget(null)
    } catch (error) {
      setActionError(
        error instanceof
        ApiClientError
          ? error.message
          : 'Unable to update this goal.',
      )
    }
  }

  const actionPending =
    completeGoal.isPending ||
    archiveGoal.isPending

  return (
    <PageShell>
      <PageHeader
        eyebrow="Room for what matters"
        title="Your goals"
        description="Turn the things you care about into steady, visible progress."
        actions={
          <>
            <RefreshButton
              isRefreshing={
                goalsQuery.isFetching
              }
              onRefresh={
                goalsQuery.refetch
              }
              label="Refresh goals"
              iconOnly
            />

            <button
              type="button"
              onClick={
                openCreateGoal
              }
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-inverse transition hover:bg-primary-hover"
            >
              <Plus
                size={18}
                aria-hidden
              />

              New goal
            </button>
          </>
        }
      />

      <section className="feature-reveal feature-reveal-delay-1 mt-10 grid overflow-hidden rounded-2xl border border-line/50 bg-surface sm:grid-cols-3">
        <div className="p-5 sm:col-span-1 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
              <Sparkles
                size={18}
                aria-hidden
              />
            </span>

            <div>
              <p className="type-eyebrow">
                Momentum
              </p>

              <p className="mt-2 text-base font-semibold leading-6 text-ink">
                {
                  momentumMessage
                }
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-line/50 p-5 sm:border-l sm:border-t-0 sm:p-6">
          <p className="type-eyebrow">
            Average progress
          </p>

          <div className="mt-2 flex items-end gap-2">
            <p className="text-3xl font-semibold tracking-[-0.03em] text-ink">
              {
                averageProgress
              }
              %
            </p>

            <TrendingUp
              size={17}
              className="mb-1 text-success"
              aria-hidden
            />
          </div>
        </div>

        <div className="border-t border-line/50 p-5 sm:border-l sm:border-t-0 sm:p-6">
          <p className="type-eyebrow">
            Nearest target
          </p>

          <p className="mt-2 truncate text-sm font-semibold text-ink">
            {nearestGoal?.name ??
              'No date set'}
          </p>

          <p className="mt-1 text-xs text-muted">
            {nearestGoal
              ? deadlineCopy(
                  nearestGoal.targetDate,
                )
              : 'Choose dates only when they help.'}
          </p>
        </div>
      </section>

      <div className="feature-reveal feature-reveal-delay-2 mt-8">
        <StatusTabs
          value={status}
          options={
            statusOptions
          }
          onChange={setStatus}
          ariaLabel="Goal status"
        />
      </div>

      {goalsQuery.isPending && (
        <div className="feature-reveal feature-reveal-delay-3 mt-8 grid animate-pulse gap-5 md:grid-cols-2">
          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="h-64 rounded-2xl border border-line/50 bg-surface-muted/50"
              />
            ),
          )}
        </div>
      )}

      {goalsQuery.error && (
        <ErrorPanel
          title="We couldn’t load your goals"
          message={
            goalsQuery.error instanceof
            ApiClientError
              ? goalsQuery.error
                  .message
              : 'Please try again.'
          }
          onRetry={() =>
            void goalsQuery.refetch()
          }
          className="feature-reveal feature-reveal-delay-3 mt-8"
        />
      )}

      {!goalsQuery.isPending &&
        !goalsQuery.error &&
        goals.length === 0 && (
          <EmptyState
            icon={
              <Target
                size={22}
                aria-hidden
              />
            }
            title={
              status === 'ACTIVE'
                ? 'What are you making room for?'
                : status ===
                    'COMPLETED'
                  ? 'No completed goals yet'
                  : 'No archived goals'
            }
            description={
              status === 'ACTIVE'
                ? 'Start with something meaningful. The amount can be practical; the reason should feel personal.'
                : 'Goals in this stage will stay here with their history intact.'
            }
            action={
              status ===
              'ACTIVE' ? (
                <button
                  type="button"
                  onClick={
                    openCreateGoal
                  }
                  className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-inverse transition hover:bg-primary-hover"
                >
                  <Plus
                    size={16}
                    aria-hidden
                  />

                  Create your first
                  goal
                </button>
              ) : undefined
            }
            variant="solid"
            className="feature-reveal feature-reveal-delay-3 mt-8"
          />
        )}

      {!goalsQuery.isPending &&
        !goalsQuery.error &&
        goals.length > 0 && (
          <section className="feature-reveal feature-reveal-delay-3 mt-8 grid gap-5 md:grid-cols-2">
            {goals.map(
              (goal) => {
                const displayedProgress =
                  Math.min(
                    goal.progressPercentage,
                    100,
                  )

                const targetReached =
                  goal.currentAmount >=
                  goal.targetAmount

                return (
                  <article
                    key={goal.id}
                    className="flex min-h-64 flex-col rounded-2xl border border-line/50 bg-surface p-5 shadow-[0_10px_30px_rgba(23,60,50,0.03)] sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                        {goal.status ===
                        'COMPLETED' ? (
                          <CheckCircle2
                            size={18}
                            aria-hidden
                          />
                        ) : (
                          <Target
                            size={18}
                            aria-hidden
                          />
                        )}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setHistoryGoalId(
                              goal.id,
                            )
                          }
                          className="grid size-8 cursor-pointer place-items-center rounded-full text-muted transition hover:bg-surface-muted hover:text-primary"
                          aria-label={`View contribution history for ${goal.name}`}
                          title="Contribution history"
                        >
                          <History
                            size={15}
                            aria-hidden
                          />
                        </button>

                        {goal.status ===
                          'ACTIVE' && (
                          <button
                            type="button"
                            onClick={() =>
                              openEditGoal(
                                goal,
                              )
                            }
                            className="grid size-8 cursor-pointer place-items-center rounded-full text-muted transition hover:bg-accent-soft hover:text-accent"
                            aria-label={`Edit ${goal.name}`}
                            title="Edit goal"
                          >
                            <Pencil
                              size={15}
                              aria-hidden
                            />
                          </button>
                        )}

                        {goal.status !==
                          'ARCHIVED' && (
                          <button
                            type="button"
                            onClick={() =>
                              requestAction(
                                goal,
                                'archive',
                              )
                            }
                            className="grid size-8 cursor-pointer place-items-center rounded-full text-muted transition hover:bg-danger-soft hover:text-danger"
                            aria-label={`Archive ${goal.name}`}
                            title="Archive goal"
                          >
                            <Archive
                              size={15}
                              aria-hidden
                            />
                          </button>
                        )}
                      </div>
                    </div>

                    <h2 className="mt-4 text-xl font-semibold tracking-[-0.02em] text-ink">
                      {goal.name}
                    </h2>

                    <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-muted">
                      {goal.description ??
                        'A clear destination for steady progress.'}
                    </p>

                    <div className="mt-5">
                      <div className="flex items-end justify-between gap-4">
                        <div>
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

                        <p className="text-lg font-semibold text-success">
                          {Math.round(
                            goal.progressPercentage,
                          )}
                          %
                        </p>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-strong">
                        <div
                          className="h-full rounded-full bg-accent transition-[width] duration-500"
                          style={{
                            width: `${displayedProgress}%`,
                          }}
                        />
                      </div>

                      <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted">
                        <span>
                          {formatMoney(
                            goal.remainingAmount,
                            goal.currencyCode,
                          )}{' '}
                          to go
                        </span>

                        <span>
                          Target{' '}
                          {formatMoney(
                            goal.targetAmount,
                            goal.currencyCode,
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-muted">
                      <CalendarDays
                        size={14}
                        aria-hidden
                      />

                      {goal.targetDate
                        ? `${formatTargetDate(
                            goal.targetDate,
                          )} · ${deadlineCopy(
                            goal.targetDate,
                          )}`
                        : 'No fixed deadline'}
                    </div>

                    {goal.status ===
                      'ACTIVE' && (
                      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line/50 pt-4">
                        <button
                          type="button"
                          onClick={() =>
                            setContributionGoal(
                              goal,
                            )
                          }
                          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-inverse transition hover:bg-primary-hover"
                        >
                          <CircleDollarSign
                            size={16}
                            aria-hidden
                          />

                          Add contribution
                        </button>

                        {targetReached && (
                          <button
                            type="button"
                            onClick={() =>
                              requestAction(
                                goal,
                                'complete',
                              )
                            }
                            className="inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-2.5 text-sm font-semibold text-success transition hover:bg-success-soft"
                          >
                            <CheckCircle2
                              size={16}
                              aria-hidden
                            />

                            Mark complete
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                )
              },
            )}
          </section>
        )}

      {historyGoal && (
        <ContributionHistoryDrawer
          goal={historyGoal}
          onClose={() =>
            setHistoryGoalId(
              null,
            )
          }
        />
      )}

      {isGoalModalOpen && (
        <GoalModal
          goal={
            editingGoal ??
            undefined
          }
          onClose={
            closeGoalModal
          }
        />
      )}

      {contributionGoal && (
        <ContributionModal
          goal={
            contributionGoal
          }
          onClose={() =>
            setContributionGoal(
              null,
            )
          }
        />
      )}

      {actionTarget && (
        <GoalActionDialog
          goal={
            actionTarget.goal
          }
          action={
            actionTarget.action
          }
          isPending={
            actionPending
          }
          error={
            actionError
          }
          onCancel={() =>
            setActionTarget(null)
          }
          onConfirm={() =>
            void confirmAction()
          }
        />
      )}
    </PageShell>
  )
}
