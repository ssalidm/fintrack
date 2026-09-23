import { ArrowRightLeft } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useForm,
  useWatch,
} from 'react-hook-form'

import { useAccounts } from '../../accounts/hooks/useAccounts'
import { useCreateTransfer } from '../hooks/useTransfers'
import {
  transferSchema,
  type TransferFormValues,
} from '../validation/transferSchema'

interface TransferFormProps {
  onCancel: () => void
  onSuccess: () => void
}

const fieldClasses =
  'w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink outline-none transition placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-accent/10 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted'

function getCurrentLocalDate() {
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

export default function TransferForm({
  onCancel,
  onSuccess,
}: TransferFormProps) {
  const accountsQuery =
    useAccounts('ACTIVE')

  const createTransfer =
    useCreateTransfer()

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: {
      errors,
    },
  } = useForm<TransferFormValues>({
    resolver: zodResolver(
      transferSchema,
    ),
    defaultValues: {
      sourceAccountId: '',
      destinationAccountId: '',
      amount: 0,
      transactionDate:
        getCurrentLocalDate(),
      description: '',
    },
  })

  const sourceAccountId =
    useWatch({
      control,
      name: 'sourceAccountId',
    })

  const destinationAccountId =
    useWatch({
      control,
      name: 'destinationAccountId',
    })

  const accounts =
    accountsQuery.data ?? []

  const sourceAccount =
    accounts.find(
      (account) =>
        account.id ===
        sourceAccountId,
    )

  const destinationAccounts =
    sourceAccount
      ? accounts.filter(
          (account) =>
            account.id !==
              sourceAccount.id &&
            account.currencyCode ===
              sourceAccount.currencyCode,
        )
      : []

  const hasEnoughAccounts =
    accounts.length >= 2

  function swapAccounts() {
    if (
      !sourceAccountId ||
      !destinationAccountId
    ) {
      return
    }

    setValue(
      'sourceAccountId',
      destinationAccountId,
      {
        shouldValidate: true,
      },
    )

    setValue(
      'destinationAccountId',
      sourceAccountId,
      {
        shouldValidate: true,
      },
    )
  }

  async function onSubmit(
    values: TransferFormValues,
  ) {
    try {
      await createTransfer.mutateAsync({
        sourceAccountId:
          values.sourceAccountId,
        destinationAccountId:
          values.destinationAccountId,
        amount: values.amount,
        transactionDate:
          values.transactionDate,
        description:
          values.description.length >
          0
            ? values.description
            : undefined,
      })

      onSuccess()
    } catch {
      // The mutation exposes the API error below.
    }
  }

  const mutationError =
    createTransfer.error instanceof
    Error
      ? createTransfer.error
          .message
      : createTransfer.error
        ? 'The transfer could not be created.'
        : null

  if (
    accountsQuery.isPending
  ) {
    return (
      <div className="grid min-h-64 place-items-center text-sm text-muted">
        Loading your accounts…
      </div>
    )
  }

  if (
    accountsQuery.isError
  ) {
    return (
      <div className="rounded-2xl border border-danger/20 bg-danger-soft px-5 py-4">
        <p className="font-semibold text-danger">
          We couldn’t load your
          accounts.
        </p>

        <button
          type="button"
          onClick={() => {
            void accountsQuery.refetch()
          }}
          className="mt-3 cursor-pointer text-sm font-semibold text-primary underline underline-offset-4"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!hasEnoughAccounts) {
    return (
      <div className="rounded-2xl border border-warning/20 bg-warning-soft px-5 py-5">
        <p className="font-semibold text-warning">
          Two active accounts are
          required
        </p>

        <p className="mt-2 text-sm leading-6 text-muted">
          Add another account before
          creating a transfer.
        </p>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-muted"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(
          onSubmit,
        )(event)
      }}
      className="space-y-5"
    >
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <div>
          <label
            htmlFor="transfer-source-account"
            className="type-label mb-2 block"
          >
            From
          </label>

          <select
            id="transfer-source-account"
            {...register(
              'sourceAccountId',
              {
                onChange: () => {
                  setValue(
                    'destinationAccountId',
                    '',
                    {
                      shouldValidate:
                        false,
                    },
                  )
                },
              },
            )}
            className={`${fieldClasses} cursor-pointer pr-10`}
          >
            <option value="">
              Select source account
            </option>

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

          {errors.sourceAccountId && (
            <p className="mt-2 text-sm text-danger">
              {
                errors.sourceAccountId
                  .message
              }
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={swapAccounts}
          disabled={
            !sourceAccountId ||
            !destinationAccountId
          }
          className="mb-1 grid size-10 cursor-pointer place-items-center justify-self-center rounded-full border border-line text-primary transition hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Swap source and destination accounts"
          title="Swap accounts"
        >
          <ArrowRightLeft
            size={17}
            aria-hidden
          />
        </button>

        <div>
          <label
            htmlFor="transfer-destination-account"
            className="type-label mb-2 block"
          >
            To
          </label>

          <select
            id="transfer-destination-account"
            disabled={
              !sourceAccount
            }
            {...register(
              'destinationAccountId',
            )}
            className={`${fieldClasses} cursor-pointer pr-10`}
          >
            <option value="">
              {sourceAccount
                ? 'Select destination account'
                : 'Choose source account first'}
            </option>

            {destinationAccounts.map(
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

          {errors.destinationAccountId && (
            <p className="mt-2 text-sm text-danger">
              {
                errors.destinationAccountId
                  .message
              }
            </p>
          )}
        </div>
      </div>

      {sourceAccount &&
        destinationAccounts.length ===
          0 && (
          <div className="rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning">
            No other active{' '}
            {
              sourceAccount.currencyCode
            }{' '}
            account is available.
            Transfers require matching
            currencies.
          </div>
        )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="transfer-amount"
            className="type-label mb-2 block"
          >
            Amount

            {sourceAccount && (
              <span className="ml-1 font-normal text-muted">
                (
                {
                  sourceAccount.currencyCode
                }
                )
              </span>
            )}
          </label>

          <input
            id="transfer-amount"
            type="number"
            min="0.0001"
            step="0.0001"
            inputMode="decimal"
            placeholder="0.00"
            {...register(
              'amount',
              {
                valueAsNumber:
                  true,
              },
            )}
            className={
              fieldClasses
            }
          />

          {errors.amount && (
            <p className="mt-2 text-sm text-danger">
              {
                errors.amount
                  .message
              }
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="transfer-date"
            className="type-label mb-2 block"
          >
            Transfer date
          </label>

          <input
            id="transfer-date"
            type="date"
            {...register(
              'transactionDate',
            )}
            className={
              fieldClasses
            }
          />

          {errors.transactionDate && (
            <p className="mt-2 text-sm text-danger">
              {
                errors
                  .transactionDate
                  .message
              }
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="transfer-description"
          className="type-label mb-2 block"
        >
          Description

          <span className="ml-1 font-normal text-muted">
            optional
          </span>
        </label>

        <textarea
          id="transfer-description"
          rows={3}
          maxLength={500}
          placeholder="Add a note about this transfer"
          {...register(
            'description',
          )}
          className={`${fieldClasses} resize-none`}
        />

        {errors.description && (
          <p className="mt-2 text-sm text-danger">
            {
              errors.description
                .message
            }
          </p>
        )}
      </div>

      {mutationError && (
        <div
          role="alert"
          className="rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          {mutationError}
        </div>
      )}

      <div className="flex justify-end gap-3 border-t border-line pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={
            createTransfer.isPending
          }
          className="cursor-pointer rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            createTransfer.isPending ||
            !sourceAccount ||
            destinationAccounts.length ===
              0
          }
          className="cursor-pointer rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-inverse transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createTransfer.isPending
            ? 'Transferring…'
            : 'Create transfer'}
        </button>
      </div>
    </form>
  )
}
