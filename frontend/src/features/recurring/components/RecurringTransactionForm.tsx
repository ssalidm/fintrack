import {
  useEffect,
  useRef,
} from 'react'
import {
  Controller,
  useForm,
  useWatch,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarClock } from 'lucide-react'

import { ApiClientError } from '@/api/ApiClientError'
import { useAccounts } from '@/features/accounts/hooks/useAccounts'
import { useCategories } from '@/features/categories/hooks/useCategories'
import type {
  CreateRecurringTransactionRequest,
  RecurringTransaction,
  UpdateRecurringTransactionRequest,
} from '@/features/recurring/api/types'
import {
  useCreateRecurringTransaction,
  useUpdateRecurringTransaction,
} from '@/features/recurring/hooks/useRecurringTransactions'
import {
  recurringTransactionSchema,
  type RecurringTransactionFormValues,
} from '@/features/recurring/validation/recurringTransactionSchema'

interface RecurringTransactionFormProps {
  schedule?: RecurringTransaction | null
  onSuccess: () => void
  onCancel: () => void
}

const inputClassName =
  'mt-2 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-accent/10 disabled:bg-surface-muted disabled:text-muted'

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

function getLaterDate(
  first: string,
  second: string | null,
) {
  if (!second) {
    return first
  }

  return first > second
    ? first
    : second
}

function FieldError({
  message,
}: {
  message?: string
}) {
  if (!message) {
    return null
  }

  return (
    <p className="mt-1.5 text-xs text-danger">
      {message}
    </p>
  )
}

export default function RecurringTransactionForm({
  schedule,
  onSuccess,
  onCancel,
}: RecurringTransactionFormProps) {
  const isEditMode =
    Boolean(schedule)

  const createRecurringTransaction =
    useCreateRecurringTransaction()

  const updateRecurringTransaction =
    useUpdateRecurringTransaction()

  const {
    data: accounts = [],
    isPending:
      accountsPending,
    error: accountsError,
  } = useAccounts('ACTIVE')

  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<RecurringTransactionFormValues>(
      {
        resolver: zodResolver(
          recurringTransactionSchema,
        ),
        defaultValues: {
          accountId:
            schedule?.accountId ??
            '',
          categoryId:
            schedule?.categoryId ??
            '',
          name:
            schedule?.name ?? '',
          transactionType:
            schedule?.transactionType ??
            'EXPENSE',
          amount:
            schedule?.amount ?? 0,
          description:
            schedule?.description ??
            '',
          merchantName:
            schedule?.merchantName ??
            '',
          frequency:
            schedule?.frequency ??
            'MONTHLY',
          intervalCount:
            schedule?.intervalCount ??
            1,
          startDate:
            schedule?.startDate ??
            getToday(),
          endDate:
            schedule?.endDate ??
            '',
          autoPost:
            schedule?.autoPost ??
            false,
          catchUpMode:
            'START_FROM_CURRENT',
        },
      },
    )

  const transactionType =
    useWatch({
      control,
      name: 'transactionType',
    })

  const startDate =
    useWatch({
      control,
      name: 'startDate',
    })

  const previousTransactionType =
    useRef(transactionType)

  const {
    data: categories = [],
    isPending:
      categoriesPending,
    error: categoriesError,
  } = useCategories(
    transactionType,
    'ACTIVE',
  )

  useEffect(() => {
    if (
      previousTransactionType.current !==
      transactionType
    ) {
      setValue(
        'categoryId',
        '',
        {
          shouldValidate:
            true,
        },
      )

      previousTransactionType.current =
        transactionType
    }
  }, [
    setValue,
    transactionType,
  ])

  const createError =
    createRecurringTransaction.error instanceof
    ApiClientError
      ? createRecurringTransaction
          .error.message
      : createRecurringTransaction.error
        ? 'The recurring transaction could not be created.'
        : null

  const updateError =
    updateRecurringTransaction.error instanceof
    ApiClientError
      ? updateRecurringTransaction
          .error.message
      : updateRecurringTransaction.error
        ? 'The recurring transaction could not be updated.'
        : null

  const mutationError =
    createError ?? updateError

  const formIsBusy =
    isSubmitting ||
    createRecurringTransaction.isPending ||
    updateRecurringTransaction.isPending

  const hasCurrentAccount =
    schedule !== undefined &&
    schedule !== null &&
    !accounts.some(
      (account) =>
        account.id ===
        schedule.accountId,
    )

  const hasCurrentCategory =
    schedule !== undefined &&
    schedule !== null &&
    !categories.some(
      (category) =>
        category.id ===
        schedule.categoryId,
    )

  const minimumEndDate =
    schedule
      ? getLaterDate(
          schedule.startDate,
          schedule.nextDueDate,
        )
      : startDate

  async function submitCreate(
    values: RecurringTransactionFormValues,
  ) {
    const payload: CreateRecurringTransactionRequest =
      {
        accountId:
          values.accountId,
        categoryId:
          values.categoryId,
        name:
          values.name.trim(),
        transactionType:
          values.transactionType,
        amount:
          values.amount,
        frequency:
          values.frequency,
        intervalCount:
          values.intervalCount,
        startDate:
          values.startDate,
        autoPost:
          values.autoPost,
        catchUpMode:
          values.catchUpMode,
      }

    const description =
      values.description.trim()

    const merchantName =
      values.merchantName.trim()

    if (description) {
      payload.description =
        description
    }

    if (merchantName) {
      payload.merchantName =
        merchantName
    }

    if (values.endDate) {
      payload.endDate =
        values.endDate
    }

    await createRecurringTransaction.mutateAsync(
      payload,
    )
  }

  async function submitUpdate(
    values: RecurringTransactionFormValues,
    currentSchedule: RecurringTransaction,
  ) {
    if (
      values.endDate &&
      currentSchedule.nextDueDate &&
      values.endDate <
        currentSchedule.nextDueDate
    ) {
      setError('endDate', {
        message:
          'The end date cannot be before the next due date.',
      })

      return false
    }

    const payload: UpdateRecurringTransactionRequest =
      {
        version:
          currentSchedule.version,
        accountId:
          values.accountId,
        categoryId:
          values.categoryId,
        name:
          values.name.trim(),
        transactionType:
          values.transactionType,
        amount:
          values.amount,
        description:
          values.description.trim(),
        merchantName:
          values.merchantName.trim(),
        frequency:
          values.frequency,
        intervalCount:
          values.intervalCount,
        autoPost:
          values.autoPost,
      }

    if (values.endDate) {
      payload.endDate =
        values.endDate
    } else if (
      currentSchedule.endDate
    ) {
      payload.clearEndDate =
        true
    }

    await updateRecurringTransaction.mutateAsync(
      {
        scheduleId:
          currentSchedule.id,
        payload,
      },
    )

    return true
  }

  async function submitForm(
    values: RecurringTransactionFormValues,
  ) {
    if (schedule) {
      const wasUpdated =
        await submitUpdate(
          values,
          schedule,
        )

      if (!wasUpdated) {
        return
      }
    } else {
      await submitCreate(
        values,
      )
    }

    onSuccess()
  }

  if (accountsPending) {
    return (
      <div className="grid min-h-48 place-items-center text-center">
        <p className="text-sm text-muted">
          Loading your accounts…
        </p>
      </div>
    )
  }

  if (accountsError) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-danger/20 bg-danger-soft p-5 text-sm text-danger"
      >
        Your accounts could not
        be loaded.
      </div>
    )
  }

  if (
    accounts.length === 0 &&
    !schedule
  ) {
    return (
      <div className="rounded-2xl border border-line/50 bg-surface-muted p-6 text-center">
        <CalendarClock
          size={24}
          className="mx-auto text-muted"
          aria-hidden
        />

        <h3 className="mt-4 text-xl font-semibold tracking-[-0.02em] text-ink">
          Add an account first
        </h3>

        <p className="mt-2 text-sm leading-6 text-muted">
          A recurring transaction
          must belong to an active
          account.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={(event) =>
        void handleSubmit(
          submitForm,
        )(event)
      }
      className="space-y-6"
    >
      {schedule && (
        <div className="rounded-xl border border-line/50 bg-surface-muted px-5 py-4">
          <p className="type-eyebrow">
            Original schedule
          </p>

          <p className="mt-2 text-sm text-ink">
            Started{' '}
            {schedule.startDate}
            {' · '}
            Next due{' '}
            {schedule.nextDueDate ??
              'completed'}
          </p>

          <p className="mt-1 text-xs leading-5 text-muted">
            The original start date
            cannot be changed.
          </p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="type-label">
            Type
          </span>

          <select
            {...register(
              'transactionType',
            )}
            disabled={
              formIsBusy
            }
            className={`${inputClassName} cursor-pointer pr-10`}
          >
            <option value="EXPENSE">
              Expense
            </option>
            <option value="INCOME">
              Income
            </option>
          </select>

          <FieldError
            message={
              errors.transactionType
                ?.message
            }
          />
        </label>

        <label className="block">
          <span className="type-label">
            Schedule name
          </span>

          <input
            {...register('name')}
            disabled={
              formIsBusy
            }
            placeholder="Monthly rent"
            className={
              inputClassName
            }
          />

          <FieldError
            message={
              errors.name?.message
            }
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="type-label">
            Account
          </span>

          <select
            {...register(
              'accountId',
            )}
            disabled={
              formIsBusy
            }
            className={`${inputClassName} cursor-pointer pr-10`}
          >
            <option value="">
              Choose an account
            </option>

            {hasCurrentAccount &&
              schedule && (
                <option
                  value={
                    schedule.accountId
                  }
                >
                  Current account
                </option>
              )}

            {accounts.map(
              (account) => (
                <option
                  key={account.id}
                  value={account.id}
                >
                  {account.name} ·{' '}
                  {
                    account.currencyCode
                  }
                </option>
              ),
            )}
          </select>

          <FieldError
            message={
              errors.accountId
                ?.message
            }
          />
        </label>

        <label className="block">
          <span className="type-label">
            Category
          </span>

          <select
            {...register(
              'categoryId',
            )}
            disabled={
              formIsBusy ||
              categoriesPending ||
              Boolean(
                categoriesError,
              )
            }
            className={`${inputClassName} cursor-pointer pr-10`}
          >
            <option value="">
              {categoriesPending
                ? 'Loading categories…'
                : 'Choose a category'}
            </option>

            {hasCurrentCategory &&
              schedule && (
                <option
                  value={
                    schedule.categoryId
                  }
                >
                  Current category
                </option>
              )}

            {categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {
                    category.name
                  }
                </option>
              ),
            )}
          </select>

          <FieldError
            message={
              errors.categoryId
                ?.message ??
              (categoriesError
                ? 'Categories could not be loaded.'
                : undefined)
            }
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="type-label">
            Amount
          </span>

          <input
            {...register(
              'amount',
              {
                valueAsNumber:
                  true,
              },
            )}
            type="number"
            min="0.0001"
            step="0.0001"
            disabled={
              formIsBusy
            }
            className={
              inputClassName
            }
          />

          <FieldError
            message={
              errors.amount
                ?.message
            }
          />
        </label>

        <label className="block">
          <span className="type-label">
            Merchant
          </span>

          <input
            {...register(
              'merchantName',
            )}
            disabled={
              formIsBusy
            }
            placeholder="Optional"
            className={
              inputClassName
            }
          />

          <FieldError
            message={
              errors.merchantName
                ?.message
            }
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="type-label">
            Frequency
          </span>

          <select
            {...register(
              'frequency',
            )}
            disabled={
              formIsBusy
            }
            className={`${inputClassName} cursor-pointer pr-10`}
          >
            <option value="DAILY">
              Daily
            </option>
            <option value="WEEKLY">
              Weekly
            </option>
            <option value="MONTHLY">
              Monthly
            </option>
            <option value="YEARLY">
              Yearly
            </option>
          </select>

          <FieldError
            message={
              errors.frequency
                ?.message
            }
          />
        </label>

        <label className="block">
          <span className="type-label">
            Repeat every
          </span>

          <input
            {...register(
              'intervalCount',
              {
                valueAsNumber:
                  true,
              },
            )}
            type="number"
            min="1"
            max="365"
            disabled={
              formIsBusy
            }
            className={
              inputClassName
            }
          />

          <FieldError
            message={
              errors.intervalCount
                ?.message
            }
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {!isEditMode && (
          <label className="block">
            <span className="type-label">
              Start date
            </span>

            <input
              {...register(
                'startDate',
              )}
              type="date"
              disabled={
                formIsBusy
              }
              className={`${inputClassName} cursor-pointer`}
            />

            <FieldError
              message={
                errors.startDate
                  ?.message
              }
            />
          </label>
        )}

        <label className="block">
          <span className="type-label">
            End date
          </span>

          <input
            {...register(
              'endDate',
            )}
            type="date"
            min={
              minimumEndDate
            }
            disabled={
              formIsBusy
            }
            className={`${inputClassName} cursor-pointer`}
          />

          <FieldError
            message={
              errors.endDate
                ?.message
            }
          />
        </label>
      </div>

      <label className="block">
        <span className="type-label">
          Description
        </span>

        <textarea
          {...register(
            'description',
          )}
          rows={3}
          disabled={formIsBusy}
          placeholder="Optional notes about this schedule"
          className={`${inputClassName} resize-none`}
        />

        <FieldError
          message={
            errors.description
              ?.message
          }
        />
      </label>

      {!isEditMode && (
        <fieldset>
          <legend className="type-label">
            If the start date is
            already in the past
          </legend>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="cursor-pointer rounded-xl border border-line bg-surface p-4 transition has-checked:border-accent/50 has-checked:bg-accent-soft">
              <input
                {...register(
                  'catchUpMode',
                )}
                type="radio"
                value="START_FROM_CURRENT"
                disabled={
                  formIsBusy
                }
                className="accent-primary"
              />

              <span className="ml-3 text-sm font-semibold text-ink">
                Start from current
              </span>

              <p className="mt-2 pl-6 text-xs leading-5 text-muted">
                Skip older occurrences
                and start from the
                current schedule.
              </p>
            </label>

            <label className="cursor-pointer rounded-xl border border-line bg-surface p-4 transition has-checked:border-accent/50 has-checked:bg-accent-soft">
              <input
                {...register(
                  'catchUpMode',
                )}
                type="radio"
                value="GENERATE_MISSED"
                disabled={
                  formIsBusy
                }
                className="accent-primary"
              />

              <span className="ml-3 text-sm font-semibold text-ink">
                Generate missed
              </span>

              <p className="mt-2 pl-6 text-xs leading-5 text-muted">
                Process occurrences
                missed since the
                original start date.
              </p>
            </label>
          </div>
        </fieldset>
      )}

      <Controller
        control={control}
        name="autoPost"
        render={({ field }) => (
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line/50 bg-surface-muted p-4">
            <input
              type="checkbox"
              checked={
                field.value
              }
              disabled={
                formIsBusy
              }
              onChange={
                field.onChange
              }
              className="mt-1 size-4 accent-primary"
            />

            <span>
              <span className="block text-sm font-semibold text-ink">
                Post automatically
              </span>

              <span className="mt-1 block text-xs leading-5 text-muted">
                Create each
                transaction
                automatically when it
                becomes due.
              </span>
            </span>
          </label>
        )}
      />

      {mutationError && (
        <div
          role="alert"
          className="rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          {mutationError}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={formIsBusy}
          onClick={onCancel}
          className="cursor-pointer rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={formIsBusy}
          className="cursor-pointer rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-inverse transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {formIsBusy
            ? isEditMode
              ? 'Saving changes…'
              : 'Creating schedule…'
            : isEditMode
              ? 'Save changes'
              : 'Create schedule'}
        </button>
      </div>
    </form>
  )
}
