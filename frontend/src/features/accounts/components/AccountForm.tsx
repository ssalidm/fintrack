import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ApiClientError } from '../../../api/ApiClientError'
import type { Account } from '../api/types'
import {
  useCreateAccount,
  useUpdateAccount,
} from '../hooks/useAccounts'
import {
  accountFormSchema,
  type AccountFormValues,
  accountTypes,
  supportedCurrencies,
} from '../validation/accountSchema'

interface AccountFormProps {
  account?: Account
  onCancel: () => void
  onSuccess: () => void
}

const accountTypeLabels = {
  CASH: 'Cash',
  CURRENT: 'Current account',
  SAVINGS: 'Savings',
  CREDIT_CARD: 'Credit card',
  INVESTMENT: 'Investment',
  OTHER: 'Other',
} satisfies Record<
  (typeof accountTypes)[number],
  string
>

const currencyLabels = {
  ZAR: 'ZAR — South African Rand',
  USD: 'USD — United States Dollar',
  EUR: 'EUR — Euro',
  GBP: 'GBP — British Pound',
} satisfies Record<
  (typeof supportedCurrencies)[number],
  string
>

const fieldClasses =
  'mt-2 block w-full rounded-xl border border-[#d8d6ce] bg-[#fffdf8] px-4 py-3 text-[#173c32] outline-none' + '' +
  'transition placeholder:text-[#98a39f] focus:border-[#39725d] focus:ring-2 focus:ring-[#39725d]/15 disabled:bg-[#efede7]'

const accountFormFields = new Set<
  keyof AccountFormValues
>([
  'name',
  'accountType',
  'currencyCode',
  'openingBalance',
  'includeInNetWorth',
])

function isAccountFormField(
  field: string,
): field is keyof AccountFormValues {
  return accountFormFields.has(
    field as keyof AccountFormValues,
  )
}

export default function AccountForm({
                                      account,
                                      onCancel,
                                      onSuccess,
                                    }: AccountFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(
    null,
  )

  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()

  const isEditing = account !== undefined

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: account?.name ?? '',
      accountType: account?.accountType ?? 'CURRENT',
      currencyCode:
        (account?.currencyCode as AccountFormValues['currencyCode']) ??
        'ZAR',
      openingBalance: account?.openingBalance ?? 0,
      includeInNetWorth:
        account?.includeInNetWorth ?? true,
    },
  })

  useEffect(() => {
    reset({
      name: account?.name ?? '',
      accountType: account?.accountType ?? 'CURRENT',
      currencyCode:
        (account?.currencyCode as AccountFormValues['currencyCode']) ??
        'ZAR',
      openingBalance: account?.openingBalance ?? 0,
      includeInNetWorth:
        account?.includeInNetWorth ?? true,
    })
  }, [account, reset])

  async function onSubmit(values: AccountFormValues) {
    setSubmitError(null)

    try {
      if (account) {
        await updateAccount.mutateAsync({
          accountId: account.id,
          payload: {
            version: account.version,
            name: values.name.trim(),
            accountType: values.accountType,
            openingBalance: values.openingBalance,
            includeInNetWorth: values.includeInNetWorth,
          },
        })
      } else {
        await createAccount.mutateAsync({
          name: values.name.trim(),
          accountType: values.accountType,
          currencyCode: values.currencyCode,
          openingBalance: values.openingBalance,
          includeInNetWorth: values.includeInNetWorth,
        })
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
            if (isAccountFormField(field)) {
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
            ? 'Unable to reach Salif. Check that the backend is running.'
            : error.message,
        )
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      noValidate
    >
      <div>
        <label
          htmlFor="account-name"
          className="text-sm font-semibold text-[#173c32]"
        >
          Account name
        </label>

        <input
          id="account-name"
          type="text"
          autoComplete="off"
          placeholder="For example, Everyday spending"
          disabled={isSubmitting}
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={
            errors.name ? 'account-name-error' : undefined
          }
          className={fieldClasses}
          {...register('name')}
        />

        {errors.name && (
          <p
            id="account-name-error"
            className="mt-2 text-sm text-red-700"
            role="alert"
          >
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="account-type"
          className="text-sm font-semibold text-[#173c32]"
        >
          Account type
        </label>

        <select
          id="account-type"
          disabled={isSubmitting}
          aria-invalid={errors.accountType ? 'true' : 'false'}
          className={fieldClasses}
          {...register('accountType')}
        >
          {accountTypes.map((accountType) => (
            <option key={accountType} value={accountType}>
              {accountTypeLabels[accountType]}
            </option>
          ))}
        </select>

        {errors.accountType && (
          <p className="mt-2 text-sm text-red-700" role="alert">
            {errors.accountType.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="currency-code"
          className="text-sm font-semibold text-[#173c32]"
        >
          Currency
        </label>

        {isEditing ? (
          <>
            <input
              type="hidden"
              {...register('currencyCode')}
            />

            <div className={`${fieldClasses} bg-[#efede7]`}>
              {currencyLabels[
                account.currencyCode as AccountFormValues['currencyCode']
                ] ?? account.currencyCode}
            </div>

            <p className="mt-2 text-xs leading-5 text-[#657972]">
              Currency cannot be changed after an account is
              created.
            </p>
          </>
        ) : (
          <select
            id="currency-code"
            disabled={isSubmitting}
            aria-invalid={
              errors.currencyCode ? 'true' : 'false'
            }
            className={fieldClasses}
            {...register('currencyCode')}
          >
            {supportedCurrencies.map((currencyCode) => (
              <option
                key={currencyCode}
                value={currencyCode}
              >
                {currencyLabels[currencyCode]}
              </option>
            ))}
          </select>
        )}

        {errors.currencyCode && (
          <p className="mt-2 text-sm text-red-700" role="alert">
            {errors.currencyCode.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="opening-balance"
          className="text-sm font-semibold text-[#173c32]"
        >
          Opening balance
        </label>

        <input
          id="opening-balance"
          type="number"
          inputMode="decimal"
          step="0.0001"
          disabled={isSubmitting}
          aria-invalid={
            errors.openingBalance ? 'true' : 'false'
          }
          aria-describedby="opening-balance-help"
          className={fieldClasses}
          {...register('openingBalance', {
            setValueAs: (value: string) =>
              value === '' ? Number.NaN : Number(value),
          })}
        />

        {errors.openingBalance ? (
          <p
            className="mt-2 text-sm text-red-700"
            role="alert"
          >
            {errors.openingBalance.message}
          </p>
        ) : (
          <p
            id="opening-balance-help"
            className="mt-2 text-xs leading-5 text-[#657972]"
          >
            Use a negative value when the account begins with debt
            or an overdraft.
          </p>
        )}
      </div>

      <label className="flex items-start gap-3 rounded-2xl bg-[#eef3ed] p-4">
        <input
          type="checkbox"
          disabled={isSubmitting}
          className="mt-0.5 size-4 accent-[#39725d]"
          {...register('includeInNetWorth')}
        />

        <span>
          <span className="block text-sm font-semibold text-[#173c32]">
            Include in net worth
          </span>

          <span className="mt-1 block text-xs leading-5 text-[#657972]">
            Salif will include this account when calculating your
            overall financial position.
          </span>
        </span>
      </label>

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
          className="rounded-full border border-[#d8d6ce] px-5 py-2.5 text-sm font-semibold text-[#173c32] transition hover:bg-[#efede7] disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-[#174f43] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#236a58] disabled:opacity-60"
        >
          {isSubmitting
            ? isEditing
              ? 'Saving…'
              : 'Creating…'
            : isEditing
              ? 'Save changes'
              : 'Create account'}
        </button>
      </div>
    </form>
  )
}
