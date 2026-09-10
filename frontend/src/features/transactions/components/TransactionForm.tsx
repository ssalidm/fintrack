import {
  useEffect,
  useRef,
  useState,
} from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { ApiClientError } from '../../../api/ApiClientError'
import { useAccounts } from '../../accounts/hooks/useAccounts'
import { useCategories } from '../../categories/hooks/useCategories'
import type {
  ManualTransactionType,
  Transaction,
} from '../api/types'
import {
  useCreateTransaction,
  useUpdateTransaction,
} from '../hooks/useTransactions'
import {
  transactionFormSchema,
  type TransactionFormValues,
} from '../validation/transactionSchema'

interface TransactionFormProps {
  transaction?: Transaction
  onCancel: () => void
  onSuccess: () => void
}

const fieldClasses =
  'mt-2 block w-full rounded-xl border border-[#d8d6ce] bg-[#fffdf8] px-4 py-3 text-[#173c32] outline-none transition placeholder:text-[#98a39f] focus:border-[#39725d] focus:ring-2 focus:ring-[#39725d]/15 disabled:bg-[#efede7]'

const transactionFields = new Set<
  keyof TransactionFormValues
>([
  'accountId',
  'categoryId',
  'transactionType',
  'amount',
  'transactionDate',
  'merchantName',
  'description',
])

function isTransactionField(
  field: string,
): field is keyof TransactionFormValues {
  return transactionFields.has(
    field as keyof TransactionFormValues,
  )
}

function todayAsInputValue() {
  const now = new Date()
  const localTime = new Date(
    now.getTime() - now.getTimezoneOffset() * 60_000,
  )

  return localTime.toISOString().slice(0, 10)
}

function editableTransactionType(
  transaction?: Transaction,
): ManualTransactionType {
  return transaction?.transactionType === 'INCOME'
    ? 'INCOME'
    : 'EXPENSE'
}

export default function TransactionForm({
                                          transaction,
                                          onCancel,
                                          onSuccess,
                                        }: TransactionFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(
    null,
  )

  const createTransaction = useCreateTransaction()
  const updateTransaction = useUpdateTransaction()

  const isEditing = transaction !== undefined

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
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      accountId: transaction?.accountId ?? '',
      categoryId: transaction?.categoryId ?? '',
      transactionType:
        editableTransactionType(transaction),
      amount: transaction?.amount ?? 0,
      transactionDate:
        transaction?.transactionDate ??
        todayAsInputValue(),
      merchantName: transaction?.merchantName ?? '',
      description: transaction?.description ?? '',
    },
  })

  const transactionType = useWatch({
    control,
    name: 'transactionType'
  })
  const previousTransactionType =
    useRef(transactionType)

  const accountsQuery = useAccounts('ACTIVE')
  const categoriesQuery =
    useCategories(transactionType)

  const accounts = accountsQuery.data ?? []
  const categories = categoriesQuery.data ?? []

  useEffect(() => {
    if (
      previousTransactionType.current !==
      transactionType
    ) {
      setValue('categoryId', '', {
        shouldValidate: false,
      })

      previousTransactionType.current =
        transactionType
    }
  }, [setValue, transactionType])

  async function onSubmit(
    values: TransactionFormValues,
  ) {
    setSubmitError(null)

    const commonValues = {
      accountId: values.accountId,
      categoryId: values.categoryId,
      transactionType: values.transactionType,
      amount: values.amount,
      transactionDate: values.transactionDate,
      merchantName: values.merchantName.trim(),
      description: values.description.trim(),
    }

    try {
      if (transaction) {
        await updateTransaction.mutateAsync({
          transactionId: transaction.id,
          payload: {
            version: transaction.version,
            ...commonValues,
          },
        })
      } else {
        await createTransaction.mutateAsync(
          commonValues,
        )
      }

      onSuccess()
    } catch (error) {
      if (!(error instanceof ApiClientError)) {
        setSubmitError(
          'Something went wrong. Please try again.',
        )
        return
      }

      let hasFieldError = false

      if (error.validationErrors) {
        Object.entries(error.validationErrors).forEach(
          ([field, message]) => {
            if (isTransactionField(field)) {
              setError(field, {
                type: 'server',
                message,
              })

              hasFieldError = true
            }
          },
        )
      }

      if (!hasFieldError) {
        setSubmitError(
          error.isNetworkError
            ? 'We couldn’t connect to Salif right now. Please try again in a moment.'
            : error.message,
        )
      }
    }
  }

  const cannotSubmit =
    isSubmitting ||
    accounts.length === 0 ||
    categories.length === 0

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div>
        <p className="text-sm font-semibold text-[#173c32]">
          Type
        </p>

        <input
          type="hidden"
          {...register('transactionType')}
        />

        <div className="mt-2 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() =>
              setValue('transactionType', 'INCOME', {
                shouldValidate: true,
              })
            }
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              transactionType === 'INCOME'
                ? 'border-[#39725d] bg-[#dfece3] text-[#285f4a]'
                : 'border-[#d8d6ce] bg-[#fffdf8] text-[#657972] hover:border-[#9db5a8]'
            }`}
          >
            <ArrowDownLeft size={18} aria-hidden />
            Income
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() =>
              setValue('transactionType', 'EXPENSE', {
                shouldValidate: true,
              })
            }
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              transactionType === 'EXPENSE'
                ? 'border-[#a96752] bg-[#f2e3de] text-[#934f3d]'
                : 'border-[#d8d6ce] bg-[#fffdf8] text-[#657972] hover:border-[#c5a498]'
            }`}
          >
            <ArrowUpRight size={18} aria-hidden />
            Expense
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="transaction-account"
          className="text-sm font-semibold text-[#173c32]"
        >
          Account
        </label>

        <select
          id="transaction-account"
          disabled={isSubmitting || accountsQuery.isPending}
          aria-invalid={errors.accountId ? 'true' : 'false'}
          className={fieldClasses}
          {...register('accountId')}
        >
          <option value="">
            {accountsQuery.isPending
              ? 'Loading accounts…'
              : 'Choose an account'}
          </option>

          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} · {account.currencyCode}
            </option>
          ))}
        </select>

        {errors.accountId && (
          <p className="mt-2 text-sm text-red-700" role="alert">
            {errors.accountId.message}
          </p>
        )}

        {!accountsQuery.isPending &&
          accounts.length === 0 && (
            <p className="mt-2 text-sm text-amber-700">
              Add an active account before recording a
              transaction.
            </p>
          )}
      </div>

      <div>
        <label
          htmlFor="transaction-category"
          className="text-sm font-semibold text-[#173c32]"
        >
          Category
        </label>

        <select
          id="transaction-category"
          disabled={
            isSubmitting ||
            categoriesQuery.isPending
          }
          aria-invalid={
            errors.categoryId ? 'true' : 'false'
          }
          className={fieldClasses}
          {...register('categoryId')}
        >
          <option value="">
            {categoriesQuery.isPending
              ? 'Loading categories…'
              : `Choose an ${transactionType.toLowerCase()} category`}
          </option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>

        {errors.categoryId && (
          <p className="mt-2 text-sm text-red-700" role="alert">
            {errors.categoryId.message}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="transaction-amount"
            className="text-sm font-semibold text-[#173c32]"
          >
            Amount
          </label>

          <input
            id="transaction-amount"
            type="number"
            inputMode="decimal"
            min="0.0001"
            step="0.0001"
            disabled={isSubmitting}
            aria-invalid={errors.amount ? 'true' : 'false'}
            className={fieldClasses}
            {...register('amount', {
              setValueAs: (value: string) =>
                value === ''
                  ? Number.NaN
                  : Number(value),
            })}
          />

          {errors.amount && (
            <p className="mt-2 text-sm text-red-700" role="alert">
              {errors.amount.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="transaction-date"
            className="text-sm font-semibold text-[#173c32]"
          >
            Date
          </label>

          <input
            id="transaction-date"
            type="date"
            disabled={isSubmitting}
            aria-invalid={
              errors.transactionDate ? 'true' : 'false'
            }
            className={fieldClasses}
            {...register('transactionDate')}
          />

          {errors.transactionDate && (
            <p className="mt-2 text-sm text-red-700" role="alert">
              {errors.transactionDate.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="transaction-merchant"
          className="text-sm font-semibold text-[#173c32]"
        >
          Merchant or source
          <span className="ml-1 font-normal text-[#7a8984]">
            optional
          </span>
        </label>

        <input
          id="transaction-merchant"
          type="text"
          maxLength={200}
          disabled={isSubmitting}
          placeholder={
            transactionType === 'INCOME'
              ? 'For example, Employer'
              : 'For example, Woolworths'
          }
          aria-invalid={
            errors.merchantName ? 'true' : 'false'
          }
          className={fieldClasses}
          {...register('merchantName')}
        />

        {errors.merchantName && (
          <p className="mt-2 text-sm text-red-700" role="alert">
            {errors.merchantName.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="transaction-description"
          className="text-sm font-semibold text-[#173c32]"
        >
          Note
          <span className="ml-1 font-normal text-[#7a8984]">
            optional
          </span>
        </label>

        <textarea
          id="transaction-description"
          rows={3}
          maxLength={500}
          disabled={isSubmitting}
          placeholder="Add any useful context"
          aria-invalid={
            errors.description ? 'true' : 'false'
          }
          className={`${fieldClasses} resize-none`}
          {...register('description')}
        />

        {errors.description && (
          <p className="mt-2 text-sm text-red-700" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      {submitError && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {submitError}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-[#dedbd2] pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
          className="rounded-full border border-[#d8d6ce] px-5 py-2.5 text-sm font-semibold text-[#173c32] hover:bg-[#efede7] disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={cannotSubmit}
          className="rounded-full bg-[#174f43] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#236a58] disabled:opacity-60"
        >
          {isSubmitting
            ? isEditing
              ? 'Saving…'
              : 'Recording…'
            : isEditing
              ? 'Save changes'
              : 'Record transaction'}
        </button>
      </div>
    </form>
  )
}
