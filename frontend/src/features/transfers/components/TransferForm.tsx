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

function getCurrentLocalDate() {
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

export default function TransferForm({
  onCancel,
  onSuccess,
}: TransferFormProps) {
  const accountsQuery = useAccounts('ACTIVE')
  const createTransfer = useCreateTransfer()

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      sourceAccountId: '',
      destinationAccountId: '',
      amount: 0,
      transactionDate: getCurrentLocalDate(),
      description: '',
    },
  })

  const sourceAccountId = useWatch({
    control,
    name: 'sourceAccountId',
  })

  const destinationAccountId = useWatch({
    control,
    name: 'destinationAccountId',
  })

  const accounts = accountsQuery.data ?? []

  const sourceAccount = accounts.find(
    (account) =>
      account.id === sourceAccountId,
  )

  const destinationAccounts = sourceAccount
    ? accounts.filter(
        (account) =>
          account.id !== sourceAccount.id &&
          account.currencyCode ===
            sourceAccount.currencyCode,
      )
    : []

  const hasEnoughAccounts = accounts.length >= 2

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
        sourceAccountId: values.sourceAccountId,
        destinationAccountId:
          values.destinationAccountId,
        amount: values.amount,
        transactionDate: values.transactionDate,
        description:
          values.description.length > 0
            ? values.description
            : undefined,
      })

      onSuccess()
    } catch {
      // The mutation exposes the API error below.
    }
  }

  const mutationError =
    createTransfer.error instanceof Error
      ? createTransfer.error.message
      : createTransfer.error
        ? 'The transfer could not be created.'
        : null

  if (accountsQuery.isPending) {
    return (
      <div className="grid min-h-64 place-items-center text-sm text-[#657972]">
        Loading your accounts…
      </div>
    )
  }

  if (accountsQuery.isError) {
    return (
      <div className="rounded-2xl border border-[#e8c8bf] bg-[#fff4f1] px-5 py-4">
        <p className="font-semibold text-[#8f3f30]">
          We couldn’t load your accounts.
        </p>

        <button
          type="button"
          onClick={() => {
            void accountsQuery.refetch()
          }}
          className="mt-3 cursor-pointer text-sm font-semibold text-[#174f43] underline underline-offset-4"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!hasEnoughAccounts) {
    return (
      <div className="rounded-2xl border border-[#e5d4b8] bg-[#fff8eb] px-5 py-5">
        <p className="font-semibold text-[#76551f]">
          Two active accounts are required
        </p>

        <p className="mt-2 text-sm leading-6 text-[#856b41]">
          Add another account before creating a
          transfer.
        </p>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-full border border-[#d4c6ac] px-5 py-2.5 text-sm font-semibold text-[#76551f] hover:bg-[#f8ecd7]"
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
        void handleSubmit(onSubmit)(event)
      }}
      className="space-y-5"
    >
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <div>
          <label
            htmlFor="transfer-source-account"
            className="mb-2 block text-sm font-semibold text-[#173c32]"
          >
            From
          </label>

          <select
            id="transfer-source-account"
            {...register('sourceAccountId', {
              onChange: () => {
                setValue(
                  'destinationAccountId',
                  '',
                  {
                    shouldValidate: false,
                  },
                )
              },
            })}
            className="w-full cursor-pointer rounded-xl border border-[#d8d4c9] bg-white px-4 py-3 text-[#173c32] outline-none transition focus:border-[#2b7d67] focus:ring-2 focus:ring-[#2b7d67]/15"
          >
            <option value="">
              Select source account
            </option>

            {accounts.map((account) => (
              <option
                key={account.id}
                value={account.id}
              >
                {account.name} ·{' '}
                {account.currencyCode}
              </option>
            ))}
          </select>

          {errors.sourceAccountId && (
            <p className="mt-2 text-sm text-[#a94d3c]">
              {errors.sourceAccountId.message}
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
          className="mb-1 grid size-10 cursor-pointer place-items-center justify-self-center rounded-full border border-[#d8d4c9] text-[#174f43] transition hover:bg-[#e5eee8] disabled:cursor-not-allowed disabled:opacity-40"
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
            className="mb-2 block text-sm font-semibold text-[#173c32]"
          >
            To
          </label>

          <select
            id="transfer-destination-account"
            disabled={!sourceAccount}
            {...register('destinationAccountId')}
            className="w-full cursor-pointer rounded-xl border border-[#d8d4c9] bg-white px-4 py-3 text-[#173c32] outline-none transition focus:border-[#2b7d67] focus:ring-2 focus:ring-[#2b7d67]/15 disabled:cursor-not-allowed disabled:bg-[#f1efe8] disabled:text-[#8b928e]"
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
                  {account.currencyCode}
                </option>
              ),
            )}
          </select>

          {errors.destinationAccountId && (
            <p className="mt-2 text-sm text-[#a94d3c]">
              {
                errors.destinationAccountId
                  .message
              }
            </p>
          )}
        </div>
      </div>

      {sourceAccount &&
        destinationAccounts.length === 0 && (
          <div className="rounded-xl bg-[#fff8eb] px-4 py-3 text-sm text-[#76551f]">
            No other active{' '}
            {sourceAccount.currencyCode} account is
            available. Transfers require matching
            currencies.
          </div>
        )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="transfer-amount"
            className="mb-2 block text-sm font-semibold text-[#173c32]"
          >
            Amount
            {sourceAccount && (
              <span className="ml-1 font-normal text-[#657972]">
                ({sourceAccount.currencyCode})
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
            {...register('amount', {
              valueAsNumber: true,
            })}
            className="w-full rounded-xl border border-[#d8d4c9] bg-white px-4 py-3 text-[#173c32] outline-none transition focus:border-[#2b7d67] focus:ring-2 focus:ring-[#2b7d67]/15"
          />

          {errors.amount && (
            <p className="mt-2 text-sm text-[#a94d3c]">
              {errors.amount.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="transfer-date"
            className="mb-2 block text-sm font-semibold text-[#173c32]"
          >
            Transfer date
          </label>

          <input
            id="transfer-date"
            type="date"
            {...register('transactionDate')}
            className="w-full rounded-xl border border-[#d8d4c9] bg-white px-4 py-3 text-[#173c32] outline-none transition focus:border-[#2b7d67] focus:ring-2 focus:ring-[#2b7d67]/15"
          />

          {errors.transactionDate && (
            <p className="mt-2 text-sm text-[#a94d3c]">
              {errors.transactionDate.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="transfer-description"
          className="mb-2 block text-sm font-semibold text-[#173c32]"
        >
          Description
          <span className="ml-1 font-normal text-[#657972]">
            (optional)
          </span>
        </label>

        <textarea
          id="transfer-description"
          rows={3}
          maxLength={500}
          placeholder="Add a note about this transfer"
          {...register('description')}
          className="w-full resize-none rounded-xl border border-[#d8d4c9] bg-white px-4 py-3 text-[#173c32] outline-none transition focus:border-[#2b7d67] focus:ring-2 focus:ring-[#2b7d67]/15"
        />

        {errors.description && (
          <p className="mt-2 text-sm text-[#a94d3c]">
            {errors.description.message}
          </p>
        )}
      </div>

      {mutationError && (
        <div
          role="alert"
          className="rounded-xl border border-[#e8c8bf] bg-[#fff4f1] px-4 py-3 text-sm text-[#8f3f30]"
        >
          {mutationError}
        </div>
      )}

      <div className="flex justify-end gap-3 border-t border-[#e2ded4] pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={createTransfer.isPending}
          className="cursor-pointer rounded-full border border-[#cbc7bc] px-5 py-2.5 text-sm font-semibold text-[#173c32] transition hover:bg-[#efede6] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            createTransfer.isPending ||
            !sourceAccount ||
            destinationAccounts.length === 0
          }
          className="cursor-pointer rounded-full bg-[#174f43] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#216555] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createTransfer.isPending
            ? 'Transferring…'
            : 'Create transfer'}
        </button>
      </div>
    </form>
  )
}