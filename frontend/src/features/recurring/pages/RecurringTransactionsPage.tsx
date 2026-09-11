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
  Plus,
  Pencil,
  RefreshCw,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react'
import { ApiClientError } from '../../../api/ApiClientError'
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

const statuses: RecurringTransactionStatus[] = [
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'ARCHIVED',
]

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
  const year = today.getFullYear()
  const month = String(
    today.getMonth() + 1,
  ).padStart(2, '0')
  const day = String(today.getDate()).padStart(
    2,
    '0',
  )

  return `${year}-${month}-${day}`
}

function parseLocalDate(value: string) {
  const [year, month, day] =
    value.split('-').map(Number)

  return new Date(year, month - 1, day)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parseLocalDate(value))
}

function formatMoney(
  amount: number,
  currencyCode?: string,
) {
  if (!currencyCode) {
    return new Intl.NumberFormat('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatFrequency(
  frequency: RecurringFrequency,
  intervalCount: number,
) {
  const units = frequencyUnits[frequency]

  if (intervalCount === 1) {
    return `Every ${units.singular}`
  }

  return `Every ${intervalCount} ${units.plural}`
}

function statusLabel(
  status: RecurringTransactionStatus,
) {
  return (
    status.charAt(0) +
    status.slice(1).toLowerCase()
  )
}

function getErrorMessage(
  error: unknown,
  fallback: string,
) {
  return error instanceof ApiClientError
    ? error.message
    : fallback
}

function RecurringPageSkeleton() {
  return (
    <div className="feature-reveal feature-reveal-delay-3 mt-8 animate-pulse space-y-4">
      <div className="h-24 rounded-2xl bg-[#e5e8e1]" />
      <div className="h-36 rounded-3xl bg-[#e5e8e1]" />
      <div className="h-36 rounded-3xl bg-[#e5e8e1]" />
      <div className="h-36 rounded-3xl bg-[#e5e8e1]" />
    </div>
  )
}

interface ArchiveConfirmationProps {
  schedule: RecurringTransaction
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
}

function ArchiveConfirmation({
  schedule,
  isPending,
  onCancel,
  onConfirm,
}: ArchiveConfirmationProps) {
  return (
    <div
      role="presentation"
      onMouseDown={() => {
        if (!isPending) {
          onCancel()
        }
      }}
      className="fixed inset-0 z-[60] grid place-items-center bg-[#102f28]/55 px-4 backdrop-blur-sm"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="archive-schedule-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        className="w-full max-w-md rounded-3xl border border-[#dedbd2] bg-[#fffdf8] p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#f4e7df] text-[#a85e49]">
            <Archive size={19} aria-hidden />
          </span>

          <button
            type="button"
            disabled={isPending}
            onClick={onCancel}
            aria-label="Close archive confirmation"
            className="cursor-pointer rounded-full p-2 text-[#657972] transition hover:bg-[#eef1eb] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={19} aria-hidden />
          </button>
        </div>

        <h2
          id="archive-schedule-title"
          className="mt-5 font-serif text-3xl tracking-[-0.02em] text-[#173c32]"
        >
          Archive this schedule?
        </h2>

        <p className="mt-3 text-sm leading-6 text-[#657972]">
          <strong className="font-semibold text-[#173c32]">
            {schedule.name}
          </strong>{' '}
          will stop generating transactions and move to
          your archived schedules.
        </p>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isPending}
            onClick={onCancel}
            className="cursor-pointer rounded-full border border-[#d8d5cc] px-5 py-2.5 text-sm font-semibold text-[#173c32] transition hover:bg-[#f5f5ef] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Keep schedule
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="cursor-pointer rounded-full bg-[#a85e49] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#914d3c] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending
              ? 'Archiving…'
              : 'Archive'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default function RecurringTransactionsPage() {
  const [status, setStatus] =
    useState<RecurringTransactionStatus>('ACTIVE')

  const [isCreateOpen, setIsCreateOpen] =
    useState(false)

  const [scheduleToArchive, setScheduleToArchive] =
    useState<RecurringTransaction | null>(null)

  const [scheduleToEdit, setScheduleToEdit] =
    useState<RecurringTransaction | null>(null)

  const [busyScheduleId, setBusyScheduleId] =
    useState<string | null>(null)

  const [actionError, setActionError] =
    useState<string | null>(null)

  const schedulesQuery =
    useRecurringTransactions(status)

  const accountsQuery = useAccounts('ACTIVE')

  const incomeCategoriesQuery = useCategories(
    'INCOME',
    'ACTIVE',
  )

  const expenseCategoriesQuery = useCategories(
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

  const accountById = useMemo(
    () =>
      new Map(
        (accountsQuery.data ?? []).map(
          (account) => [account.id, account],
        ),
      ),
    [accountsQuery.data],
  )

  const categoryById = useMemo(() => {
    const categories = [
      ...(incomeCategoriesQuery.data ?? []),
      ...(expenseCategoriesQuery.data ?? []),
    ]

    return new Map(
      categories.map((category) => [
        category.id,
        category,
      ]),
    )
  }, [
    expenseCategoriesQuery.data,
    incomeCategoriesQuery.data,
  ])

  const schedules = schedulesQuery.data ?? []
  const today = getToday()

  const dueScheduleCount = schedules.filter(
    (schedule) =>
      schedule.status === 'ACTIVE' &&
      schedule.nextDueDate !== null &&
      schedule.nextDueDate <= today,
  ).length

  const automaticScheduleCount = schedules.filter(
    (schedule) => schedule.autoPost,
  ).length

  const queryErrorMessage =
    schedulesQuery.error instanceof ApiClientError
      ? schedulesQuery.error.message
      : 'Unable to load your recurring transactions.'

  async function runAction(
    scheduleId: string,
    action: () => Promise<unknown>,
    fallbackError: string,
  ) {
    setBusyScheduleId(scheduleId)
    setActionError(null)

    try {
      await action()
      return true
    } catch (error) {
      setActionError(
        getErrorMessage(error, fallbackError),
      )

      return false
    } finally {
      setBusyScheduleId(null)
    }
  }

  async function handlePause(
    schedule: RecurringTransaction,
  ) {
    await runAction(
      schedule.id,
      () =>
        pauseSchedule.mutateAsync({
          scheduleId: schedule.id,
          payload: {
            version: schedule.version,
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
          scheduleId: schedule.id,
          payload: {
            version: schedule.version,
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
          scheduleId: schedule.id,
          payload: {
            version: schedule.version,
          },
        }),
      'The due transaction could not be posted.',
    )
  }

  async function handleArchive() {
    if (!scheduleToArchive) {
      return
    }

    const wasSuccessful = await runAction(
      scheduleToArchive.id,
      () =>
        archiveSchedule.mutateAsync({
          scheduleId: scheduleToArchive.id,
          payload: {
            version: scheduleToArchive.version,
          },
        }),
      'The schedule could not be archived.',
    )

    if (wasSuccessful) {
      setScheduleToArchive(null)
    }
  }

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12 lg:py-12 xl:px-16">
      <div className="mx-auto max-w-[1280px]">
        <header className="feature-reveal flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#657972]">
              MONEY IN MOTION
            </p>

            <h1 className="mt-4 font-serif text-4xl tracking-[-0.03em] text-[#173c32] sm:text-5xl">
              Recurring
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#657972]">
              Plan repeating income and expenses and decide
              whether Salif should post them automatically.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#174f43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#216353]"
          >
            <Plus size={17} aria-hidden />
            New schedule
          </button>
        </header>

        <section className="feature-reveal feature-reveal-delay-1 mt-8 grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-[#dedbd2] bg-[#fffdf8] px-5 py-4">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#657972]">
              {status}
            </p>

            <p className="mt-2 font-serif text-3xl text-[#173c32]">
              {schedules.length}
            </p>

            <p className="mt-1 text-xs text-[#657972]">
              {schedules.length === 1
                ? 'schedule'
                : 'schedules'}
            </p>
          </article>

          <article className="rounded-2xl border border-[#dedbd2] bg-[#fffdf8] px-5 py-4">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#657972]">
              DUE NOW
            </p>

            <p className="mt-2 font-serif text-3xl text-[#a85e49]">
              {dueScheduleCount}
            </p>

            <p className="mt-1 text-xs text-[#657972]">
              need attention
            </p>
          </article>

          <article className="rounded-2xl border border-[#dedbd2] bg-[#fffdf8] px-5 py-4">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#657972]">
              AUTOMATIC
            </p>

            <p className="mt-2 font-serif text-3xl text-[#2d684f]">
              {automaticScheduleCount}
            </p>

            <p className="mt-1 text-xs text-[#657972]">
              posted by Salif
            </p>
          </article>
        </section>

        <section className="feature-reveal feature-reveal-delay-2 mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#dedbd2] bg-[#fffdf8] p-4">
          <div className="flex flex-wrap gap-1 rounded-full bg-[#eef0ea] p-1">
            {statuses.map((filterStatus) => (
              <button
                key={filterStatus}
                type="button"
                onClick={() => {
                  setStatus(filterStatus)
                  setActionError(null)
                }}
                className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition ${status === filterStatus
                  ? 'bg-[#174f43] text-white shadow-sm'
                  : 'text-[#657972] hover:text-[#173c32]'
                  }`}
              >
                {statusLabel(filterStatus)}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={schedulesQuery.isFetching}
            onClick={() =>
              void schedulesQuery.refetch()
            }
            className="inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[#173c32] transition hover:bg-[#eef1eb] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={
                schedulesQuery.isFetching
                  ? 'animate-spin'
                  : ''
              }
              aria-hidden
            />

            Refresh
          </button>
        </section>

        {actionError && (
          <div
            role="alert"
            className="mt-5 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
          >
            <p>{actionError}</p>

            <button
              type="button"
              onClick={() => setActionError(null)}
              aria-label="Dismiss error"
              className="cursor-pointer"
            >
              <X size={17} aria-hidden />
            </button>
          </div>
        )}

        {schedulesQuery.isPending && (
          <RecurringPageSkeleton />
        )}

        {schedulesQuery.error && (
          <section
            role="alert"
            className="feature-reveal feature-reveal-delay-3 mt-6 rounded-2xl border border-red-200 bg-red-50 p-6"
          >
            <h2 className="font-serif text-2xl text-red-950">
              We couldn’t load your schedules
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {queryErrorMessage}
            </p>

            <button
              type="button"
              onClick={() =>
                void schedulesQuery.refetch()
              }
              className="mt-4 cursor-pointer text-sm font-semibold text-red-800 underline underline-offset-4"
            >
              Try again
            </button>
          </section>
        )}

        {schedulesQuery.data &&
          schedules.length === 0 && (
            <section className="feature-reveal feature-reveal-delay-3 mt-6 rounded-3xl border border-dashed border-[#cfcac0] bg-[#fffdf8] px-6 py-14 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#e3e9ed] text-[#557587]">
                <CalendarClock size={24} aria-hidden />
              </span>

              <h2 className="mt-5 font-serif text-3xl text-[#173c32]">
                No {statusLabel(status).toLowerCase()}{' '}
                schedules
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#657972]">
                {status === 'ACTIVE'
                  ? 'Create a schedule for income or expenses that repeat over time.'
                  : `You do not have any ${statusLabel(
                    status,
                  ).toLowerCase()} recurring transactions.`}
              </p>

              {status === 'ACTIVE' && (
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#174f43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#216353]"
                >
                  <Plus size={17} aria-hidden />
                  Create your first schedule
                </button>
              )}
            </section>
          )}

        {schedules.length > 0 && (
          <section className="feature-reveal feature-reveal-delay-3 mt-6 space-y-4">
            {schedules.map((schedule) => {
              const account = accountById.get(
                schedule.accountId,
              )

              const category = categoryById.get(
                schedule.categoryId,
              )

              const isBusy =
                busyScheduleId === schedule.id

              const isDue =
                schedule.status === 'ACTIVE' &&
                schedule.nextDueDate !== null &&
                schedule.nextDueDate <= today

              const canPostManually =
                isDue && !schedule.autoPost

              return (
                <article
                  key={schedule.id}
                  className="rounded-3xl border border-[#dedbd2] bg-[#fffdf8] p-5 sm:p-7"
                >
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                    <div className="flex min-w-0 items-start gap-4">
                      <span
                        className={`grid size-12 shrink-0 place-items-center rounded-2xl ${schedule.transactionType ===
                          'INCOME'
                          ? 'bg-[#dfece3] text-[#2d684f]'
                          : 'bg-[#f4e7df] text-[#a85e49]'
                          }`}
                      >
                        {schedule.transactionType ===
                          'INCOME' ? (
                          <CirclePlay
                            size={21}
                            aria-hidden
                          />
                        ) : (
                          <CalendarClock
                            size={21}
                            aria-hidden
                          />
                        )}
                      </span>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-serif text-2xl text-[#173c32]">
                            {schedule.name}
                          </h2>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${schedule.status ===
                              'ACTIVE'
                              ? 'bg-[#e2eee5] text-[#2d684f]'
                              : schedule.status ===
                                'PAUSED'
                                ? 'bg-[#f1e7d3] text-[#9a6828]'
                                : 'bg-[#ece9e2] text-[#756a61]'
                              }`}
                          >
                            {schedule.status}
                          </span>

                          {schedule.autoPost && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#e3e9ed] px-2.5 py-1 text-[10px] font-bold tracking-wide text-[#557587]">
                              <Sparkles
                                size={10}
                                aria-hidden
                              />
                              AUTO
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm text-[#657972]">
                          {account?.name ??
                            'Unavailable account'}
                          {' · '}
                          {category?.name ??
                            'Unavailable category'}

                          {schedule.merchantName &&
                            ` · ${schedule.merchantName}`}
                        </p>

                        {schedule.description && (
                          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#657972]">
                            {schedule.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="lg:text-right">
                      <p
                        className={`font-serif text-3xl ${schedule.transactionType ===
                          'INCOME'
                          ? 'text-[#2d684f]'
                          : 'text-[#173c32]'
                          }`}
                      >
                        {formatMoney(
                          schedule.amount,
                          account?.currencyCode,
                        )}
                      </p>

                      <p className="mt-1 text-sm text-[#657972]">
                        {formatFrequency(
                          schedule.frequency,
                          schedule.intervalCount,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 border-t border-[#e5e1d8] pt-5 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="flex flex-wrap gap-x-7 gap-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock3
                          size={15}
                          className={
                            isDue
                              ? 'text-[#a85e49]'
                              : 'text-[#657972]'
                          }
                          aria-hidden
                        />

                        <span
                          className={
                            isDue
                              ? 'font-semibold text-[#a85e49]'
                              : 'text-[#657972]'
                          }
                        >
                          {schedule.nextDueDate
                            ? isDue
                              ? `Due ${formatDate(
                                schedule.nextDueDate,
                              )}`
                              : `Next ${formatDate(
                                schedule.nextDueDate,
                              )}`
                            : 'Schedule completed'}
                        </span>
                      </div>

                      <span className="text-[#657972]">
                        Started{' '}
                        {formatDate(schedule.startDate)}
                      </span>

                      {schedule.endDate && (
                        <span className="text-[#657972]">
                          Ends{' '}
                          {formatDate(schedule.endDate)}
                        </span>
                      )}
                    </div>

                    {schedule.status !== 'ARCHIVED' && (
                      <div className="flex flex-wrap justify-end gap-2">
                        {canPostManually && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              void handlePostDue(
                                schedule,
                              )
                            }
                            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#174f43] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#216353] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <CheckCircle2
                              size={14}
                              aria-hidden
                            />
                            Post due
                          </button>
                        )}

                        {(
                          schedule.status === 'ACTIVE' ||
                          schedule.status === 'PAUSED'
                        ) && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => setScheduleToEdit(schedule)}
                              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#d8d5cc] px-4 py-2 text-xs font-semibold text-[#173c32] transition hover:bg-[#f4f2ec] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Pencil size={14} aria-hidden />
                              Edit
                            </button>
                          )}
                        {schedule.status ===
                          'ACTIVE' && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() =>
                                void handlePause(schedule)
                              }
                              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#d8d5cc] px-4 py-2 text-xs font-semibold text-[#173c32] transition hover:bg-[#f4f2ec] disabled:cursor-not-allowed disabled:opacity-50"
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
                              disabled={isBusy}
                              onClick={() =>
                                void handleResume(schedule)
                              }
                              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#b8cdbd] px-4 py-2 text-xs font-semibold text-[#2d684f] transition hover:bg-[#eef5f0] disabled:cursor-not-allowed disabled:opacity-50"
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
                          disabled={isBusy}
                          onClick={() =>
                            setScheduleToArchive(
                              schedule,
                            )
                          }
                          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#e0c9bf] px-4 py-2 text-xs font-semibold text-[#a85e49] transition hover:bg-[#f8ebe6] disabled:cursor-not-allowed disabled:opacity-50"
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
            })}
          </section>
        )}
      </div>

      <RecurringTransactionModal
        isOpen={isCreateOpen || Boolean(scheduleToEdit)}
        schedule={scheduleToEdit}
        onClose={() => {
          setIsCreateOpen(false)
          setScheduleToEdit(null)
        }}
      />

      {scheduleToArchive && (
        <ArchiveConfirmation
          schedule={scheduleToArchive}
          isPending={
            busyScheduleId ===
            scheduleToArchive.id
          }
          onCancel={() =>
            setScheduleToArchive(null)
          }
          onConfirm={() =>
            void handleArchive()
          }
        />
      )}
    </main>
  )
}