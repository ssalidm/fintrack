import {
  useMemo,
  useState,
} from 'react'
import {
  Archive,
  CalendarClock,
  CheckCircle2,
  CirclePause,
  CirclePlay,
  Clock3,
  Pencil,
  Plus,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react'

import { ApiClientError } from '../../../api/ApiClientError'
import RefreshButton from '../../../components/actions/RefreshButton'
import PageHeader from '../../../components/layout/PageHeader'
import PageShell from '../../../components/layout/PageShell'
import StatusTabs from '../../../components/navigation/StatusTabs'
import ConfirmationDialog from '../../../components/ui/ConfirmationDialog'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorPanel from '../../../components/ui/ErrorPanel'
import {
  formatDateOnly,
  formatMoney,
} from '../../../utils/formatters'
import { useAccounts } from '../../accounts/hooks/useAccounts'
import { useCategories } from '../../categories/hooks/useCategories'
import type {
  RecurringFrequency,
  RecurringTransaction,
  RecurringTransactionStatus,
} from '../api/types'
import RecurringTransactionModal from '../components/RecurringTransactionModal'
import {
  useArchiveRecurringTransaction,
  usePauseRecurringTransaction,
  usePostDueRecurringTransaction,
  useRecurringTransactions,
  useResumeRecurringTransaction,
} from '../hooks/useRecurringTransactions'

const statusOptions = [
  {
    value: 'ACTIVE',
    label: 'Active',
  },
  {
    value: 'PAUSED',
    label: 'Paused',
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
  value: RecurringTransactionStatus
  label: string
}>

const frequencyUnits: Record<
  RecurringFrequency,
  {
    singular: string
    plural: string
  }
> = {
  DAILY: {
    singular: 'day',
    plural: 'days',
  },
  WEEKLY: {
    singular: 'week',
    plural: 'weeks',
  },
  MONTHLY: {
    singular: 'month',
    plural: 'months',
  },
  YEARLY: {
    singular: 'year',
    plural: 'years',
  },
}

function getToday() {
  const today = new Date()

  const year =
    today.getFullYear()

  const month = String(
    today.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    today.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatFrequency(
  frequency: RecurringFrequency,
  intervalCount: number,
) {
  const units =
    frequencyUnits[frequency]

  return intervalCount === 1
    ? `Every ${units.singular}`
    : `Every ${intervalCount} ${units.plural}`
}

function statusLabel(
  status: RecurringTransactionStatus,
) {
  return (
    status.charAt(0) +
    status
      .slice(1)
      .toLowerCase()
  )
}

function getErrorMessage(
  error: unknown,
  fallback: string,
) {
  return error instanceof
    ApiClientError
    ? error.message
    : fallback
}

function RecurringPageSkeleton() {
  return (
    <div className="feature-reveal feature-reveal-delay-3 mt-8 overflow-hidden rounded-2xl border border-line/50 bg-surface">
      {[1, 2, 3].map(
        (item) => (
          <div
            key={item}
            className="h-40 animate-pulse border-b border-line/50 bg-surface-muted/40 last:border-0"
          />
        ),
      )}
    </div>
  )
}

export default function RecurringTransactionsPage() {
  const [
    status,
    setStatus,
  ] =
    useState<RecurringTransactionStatus>(
      'ACTIVE',
    )

  const [
    isCreateOpen,
    setIsCreateOpen,
  ] = useState(false)

  const [
    scheduleToArchive,
    setScheduleToArchive,
  ] =
    useState<RecurringTransaction | null>(
      null,
    )

  const [
    scheduleToEdit,
    setScheduleToEdit,
  ] =
    useState<RecurringTransaction | null>(
      null,
    )

  const [
    busyScheduleId,
    setBusyScheduleId,
  ] = useState<string | null>(
    null,
  )

  const [
    actionError,
    setActionError,
  ] = useState<string | null>(
    null,
  )

  const schedulesQuery =
    useRecurringTransactions(
      status,
    )

  const accountsQuery =
    useAccounts('ACTIVE')

  const incomeCategoriesQuery =
    useCategories(
      'INCOME',
      'ACTIVE',
    )

  const expenseCategoriesQuery =
    useCategories(
      'EXPENSE',
      'ACTIVE',
    )

  const pauseSchedule =
    usePauseRecurringTransaction()

  const resumeSchedule =
    useResumeRecurringTransaction()

  const archiveSchedule =
    useArchiveRecurringTransaction()

  const postDueSchedule =
    usePostDueRecurringTransaction()

  const accountById =
    useMemo(
      () =>
        new Map(
          (
            accountsQuery.data ??
            []
          ).map(
            (account) => [
              account.id,
              account,
            ],
          ),
        ),
      [accountsQuery.data],
    )

  const categoryById =
    useMemo(() => {
      const categories = [
        ...(incomeCategoriesQuery.data ??
          []),
        ...(expenseCategoriesQuery.data ??
          []),
      ]

      return new Map(
        categories.map(
          (category) => [
            category.id,
            category,
          ],
        ),
      )
    }, [
      expenseCategoriesQuery.data,
      incomeCategoriesQuery.data,
    ])

  const schedules =
    schedulesQuery.data ?? []

  const today = getToday()

  const dueScheduleCount =
    schedules.filter(
      (schedule) =>
        schedule.status ===
          'ACTIVE' &&
        schedule.nextDueDate !==
          null &&
        schedule.nextDueDate <=
          today,
    ).length

  const automaticScheduleCount =
    schedules.filter(
      (schedule) =>
        schedule.autoPost,
    ).length

  const queryErrorMessage =
    schedulesQuery.error instanceof
    ApiClientError
      ? schedulesQuery.error
          .message
      : 'Unable to load your recurring transactions.'

  async function runAction(
    scheduleId: string,
    action: () => Promise<unknown>,
    fallbackError: string,
  ) {
    setBusyScheduleId(
      scheduleId,
    )

    setActionError(null)

    try {
      await action()
      return true
    } catch (error) {
      setActionError(
        getErrorMessage(
          error,
          fallbackError,
        ),
      )

      return false
    } finally {
      setBusyScheduleId(
        null,
      )
    }
  }

  async function handlePause(
    schedule: RecurringTransaction,
  ) {
    await runAction(
      schedule.id,
      () =>
        pauseSchedule.mutateAsync({
          scheduleId:
            schedule.id,
          payload: {
            version:
              schedule.version,
          },
        }),
      'The schedule could not be paused.',
    )
  }

  async function handleResume(
    schedule: RecurringTransaction,
  ) {
    await runAction(
      schedule.id,
      () =>
        resumeSchedule.mutateAsync({
          scheduleId:
            schedule.id,
          payload: {
            version:
              schedule.version,
          },
        }),
      'The schedule could not be resumed.',
    )
  }

  async function handlePostDue(
    schedule: RecurringTransaction,
  ) {
    await runAction(
      schedule.id,
      () =>
        postDueSchedule.mutateAsync({
          scheduleId:
            schedule.id,
          payload: {
            version:
              schedule.version,
          },
        }),
      'The due transaction could not be posted.',
    )
  }

  async function handleArchive() {
    if (
      !scheduleToArchive ||
      busyScheduleId ===
        scheduleToArchive.id
    ) {
      return
    }

    const wasSuccessful =
      await runAction(
        scheduleToArchive.id,
        () =>
          archiveSchedule.mutateAsync({
            scheduleId:
              scheduleToArchive.id,
            payload: {
              version:
                scheduleToArchive.version,
            },
          }),
        'The schedule could not be archived.',
      )

    if (wasSuccessful) {
      setScheduleToArchive(
        null,
      )
    }
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Money in motion"
        title="Recurring"
        description="Plan repeating income and expenses and decide whether Salif should post them automatically."
        actions={
          <>
            <RefreshButton
              isRefreshing={
                schedulesQuery.isFetching
              }
              onRefresh={
                schedulesQuery.refetch
              }
              label="Refresh recurring transactions"
              iconOnly
            />

            <button
              type="button"
              onClick={() =>
                setIsCreateOpen(
                  true,
                )
              }
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-inverse transition hover:bg-primary-hover"
            >
              <Plus
                size={18}
                aria-hidden
              />

              New schedule
            </button>
          </>
        }
      />

      <section className="feature-reveal feature-reveal-delay-1 mt-10 grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-line/50 bg-surface px-5 py-4 shadow-[0_10px_30px_rgba(23,60,50,0.03)]">
          <p className="type-eyebrow">
            {status}
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-ink">
            {schedules.length}
          </p>

          <p className="mt-1 text-xs text-muted">
            {schedules.length ===
            1
              ? 'schedule'
              : 'schedules'}
          </p>
        </article>

        <article className="rounded-2xl border border-line/50 bg-surface px-5 py-4 shadow-[0_10px_30px_rgba(23,60,50,0.03)]">
          <p className="type-eyebrow">
            Due now
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-danger">
            {dueScheduleCount}
          </p>

          <p className="mt-1 text-xs text-muted">
            need attention
          </p>
        </article>

        <article className="rounded-2xl border border-line/50 bg-surface px-5 py-4 shadow-[0_10px_30px_rgba(23,60,50,0.03)]">
          <p className="type-eyebrow">
            Automatic
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-success">
            {
              automaticScheduleCount
            }
          </p>

          <p className="mt-1 text-xs text-muted">
            posted by Salif
          </p>
        </article>
      </section>

      <section className="feature-reveal feature-reveal-delay-2 mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line/50 bg-surface p-4">
        <StatusTabs
          value={status}
          options={
            statusOptions
          }
          onChange={(
            nextStatus,
          ) => {
            setStatus(
              nextStatus,
            )
            setActionError(
              null,
            )
          }}
          ariaLabel="Recurring transaction status"
          variant="pill"
        />

        {schedulesQuery.isFetching && (
          <span className="text-xs font-medium text-muted">
            Updating…
          </span>
        )}
      </section>

      {actionError &&
        !scheduleToArchive && (
          <div
            role="alert"
            className="mt-5 flex items-start justify-between gap-4 rounded-2xl border border-danger/20 bg-danger-soft px-5 py-4 text-sm text-danger"
          >
            <p>
              {actionError}
            </p>

            <button
              type="button"
              onClick={() =>
                setActionError(
                  null,
                )
              }
              aria-label="Dismiss error"
              className="cursor-pointer"
            >
              <X
                size={17}
                aria-hidden
              />
            </button>
          </div>
        )}

      {schedulesQuery.isPending && (
        <RecurringPageSkeleton />
      )}

      {schedulesQuery.error && (
        <ErrorPanel
          title="We couldn’t load your schedules"
          message={
            queryErrorMessage
          }
          onRetry={() =>
            void schedulesQuery.refetch()
          }
          className="feature-reveal feature-reveal-delay-3 mt-6"
        />
      )}

      {schedulesQuery.isSuccess &&
        schedules.length === 0 && (
          <EmptyState
            icon={
              <CalendarClock
                size={22}
                aria-hidden
              />
            }
            title={`No ${statusLabel(
              status,
            ).toLowerCase()} schedules`}
            description={
              status === 'ACTIVE'
                ? 'Create a schedule for income or expenses that repeat over time.'
                : `You do not have any ${statusLabel(
                    status,
                  ).toLowerCase()} recurring transactions.`
            }
            action={
              status ===
              'ACTIVE' ? (
                <button
                  type="button"
                  onClick={() =>
                    setIsCreateOpen(
                      true,
                    )
                  }
                  className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-inverse transition hover:bg-primary-hover"
                >
                  <Plus
                    size={16}
                    aria-hidden
                  />

                  Create your first
                  schedule
                </button>
              ) : undefined
            }
            variant="solid"
            className="feature-reveal feature-reveal-delay-3 mt-6"
          />
        )}

      {schedules.length > 0 && (
        <section className="feature-reveal feature-reveal-delay-3 mt-6 overflow-hidden rounded-2xl border border-line/50 bg-surface shadow-[0_10px_30px_rgba(23,60,50,0.04)]">
          <div className="flex items-center justify-between gap-4 border-b border-line/50 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-sm font-semibold text-ink">
                {statusLabel(
                  status,
                )}{' '}
                schedules
              </h2>

              <p className="mt-0.5 text-xs text-subtle">
                {schedules.length}{' '}
                {schedules.length ===
                1
                  ? 'schedule'
                  : 'schedules'}
              </p>
            </div>
          </div>

          {schedules.map(
            (
              schedule,
              index,
            ) => {
              const account =
                accountById.get(
                  schedule.accountId,
                )

              const category =
                categoryById.get(
                  schedule.categoryId,
                )

              const isBusy =
                busyScheduleId ===
                schedule.id

              const isDue =
                schedule.status ===
                  'ACTIVE' &&
                schedule.nextDueDate !==
                  null &&
                schedule.nextDueDate <=
                  today

              const canPostManually =
                isDue &&
                !schedule.autoPost

              return (
                <article
                  key={
                    schedule.id
                  }
                  className={`px-5 py-5 sm:px-6 ${
                    index > 0
                      ? 'border-t border-line/50'
                      : ''
                  }`}
                >
                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                          schedule.transactionType ===
                          'INCOME'
                            ? 'bg-success-soft text-success'
                            : 'bg-danger-soft text-danger'
                        }`}
                      >
                        {schedule.transactionType ===
                        'INCOME' ? (
                          <CirclePlay
                            size={17}
                            aria-hidden
                          />
                        ) : (
                          <CalendarClock
                            size={17}
                            aria-hidden
                          />
                        )}
                      </span>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-base font-semibold text-ink">
                            {
                              schedule.name
                            }
                          </h3>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] ${
                              schedule.status ===
                              'ACTIVE'
                                ? 'bg-success-soft text-success'
                                : schedule.status ===
                                    'PAUSED'
                                  ? 'bg-warning-soft text-warning'
                                  : 'bg-surface-strong text-muted'
                            }`}
                          >
                            {
                              schedule.status
                            }
                          </span>

                          {schedule.autoPost && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-accent">
                              <Sparkles
                                size={9}
                                aria-hidden
                              />
                              Auto
                            </span>
                          )}
                        </div>

                        <p className="mt-1 truncate text-xs text-subtle">
                          {account?.name ??
                            'Unavailable account'}
                          {' · '}
                          {category?.name ??
                            'Unavailable category'}

                          {schedule.merchantName &&
                            ` · ${schedule.merchantName}`}
                        </p>

                        {schedule.description && (
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                            {
                              schedule.description
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pl-[52px] lg:pl-0 lg:text-right">
                      <p
                        className={`text-lg font-semibold ${
                          schedule.transactionType ===
                          'INCOME'
                            ? 'text-success'
                            : 'text-ink'
                        }`}
                      >
                        {formatMoney(
                          schedule.amount,
                          account?.currencyCode,
                        )}
                      </p>

                      <p className="mt-1 text-xs text-muted">
                        {formatFrequency(
                          schedule.frequency,
                          schedule.intervalCount,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 border-t border-line/50 pt-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Clock3
                          size={14}
                          className={
                            isDue
                              ? 'text-danger'
                              : 'text-muted'
                          }
                          aria-hidden
                        />

                        <span
                          className={
                            isDue
                              ? 'font-semibold text-danger'
                              : 'text-muted'
                          }
                        >
                          {schedule.nextDueDate
                            ? isDue
                              ? `Due ${formatDateOnly(
                                  schedule.nextDueDate,
                                )}`
                              : `Next ${formatDateOnly(
                                  schedule.nextDueDate,
                                )}`
                            : 'Schedule completed'}
                        </span>
                      </div>

                      <span className="text-muted">
                        Started{' '}
                        {formatDateOnly(
                          schedule.startDate,
                        )}
                      </span>

                      {schedule.endDate && (
                        <span className="text-muted">
                          Ends{' '}
                          {formatDateOnly(
                            schedule.endDate,
                          )}
                        </span>
                      )}
                    </div>

                    {schedule.status !==
                      'ARCHIVED' && (
                      <div className="flex flex-wrap justify-end gap-2">
                        {canPostManually && (
                          <button
                            type="button"
                            disabled={
                              isBusy
                            }
                            onClick={() =>
                              void handlePostDue(
                                schedule,
                              )
                            }
                            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-inverse transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <CheckCircle2
                              size={14}
                              aria-hidden
                            />

                            Post due
                          </button>
                        )}

                        {(schedule.status ===
                          'ACTIVE' ||
                          schedule.status ===
                            'PAUSED') && (
                          <button
                            type="button"
                            disabled={
                              isBusy
                            }
                            onClick={() =>
                              setScheduleToEdit(
                                schedule,
                              )
                            }
                            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Pencil
                              size={14}
                              aria-hidden
                            />

                            Edit
                          </button>
                        )}

                        {schedule.status ===
                          'ACTIVE' && (
                          <button
                            type="button"
                            disabled={
                              isBusy
                            }
                            onClick={() =>
                              void handlePause(
                                schedule,
                              )
                            }
                            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <CirclePause
                              size={14}
                              aria-hidden
                            />

                            Pause
                          </button>
                        )}

                        {schedule.status ===
                          'PAUSED' && (
                          <button
                            type="button"
                            disabled={
                              isBusy
                            }
                            onClick={() =>
                              void handleResume(
                                schedule,
                              )
                            }
                            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-success/20 px-4 py-2 text-xs font-semibold text-success transition hover:bg-success-soft disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <RotateCcw
                              size={14}
                              aria-hidden
                            />

                            Resume
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={
                            isBusy
                          }
                          onClick={() => {
                            setActionError(
                              null,
                            )

                            setScheduleToArchive(
                              schedule,
                            )
                          }}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-danger/20 px-4 py-2 text-xs font-semibold text-danger transition hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Archive
                            size={14}
                            aria-hidden
                          />

                          Archive
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              )
            },
          )}
        </section>
      )}

      <RecurringTransactionModal
        isOpen={
          isCreateOpen ||
          Boolean(
            scheduleToEdit,
          )
        }
        schedule={
          scheduleToEdit
        }
        onClose={() => {
          setIsCreateOpen(false)
          setScheduleToEdit(null)
        }}
      />

      {scheduleToArchive && (
        <ConfirmationDialog
          title="Archive this schedule?"
          description={
            <>
              <strong className="font-semibold text-ink">
                {
                  scheduleToArchive.name
                }
              </strong>{' '}
              will stop generating
              transactions and move
              to your archived
              schedules.
            </>
          }
          icon={
            <Archive
              size={18}
              aria-hidden
            />
          }
          confirmLabel="Archive"
          pendingLabel="Archiving…"
          cancelLabel="Keep schedule"
          isPending={
            busyScheduleId ===
            scheduleToArchive.id
          }
          onConfirm={() =>
            void handleArchive()
          }
          onClose={() =>
            setScheduleToArchive(
              null,
            )
          }
          role="dialog"
          closeLabel="Close archive confirmation"
        >
          {actionError && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
            >
              {actionError}
            </p>
          )}
        </ConfirmationDialog>
      )}
    </PageShell>
  )
}
