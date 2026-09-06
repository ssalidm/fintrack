import {useMemo} from 'react'
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  ReceiptText,
  Repeat2,
} from 'lucide-react'
import {Link} from 'react-router'
import {ApiClientError} from '../../../api/ApiClientError'
import {useAccounts} from '../../accounts/hooks/useAccounts'
import {useCategories} from '../../categories/hooks/useCategories'
import type {Transaction} from '../../transactions/api/types'
import {useTransactions} from '../../transactions/hooks/useTransactions'

const recentTransactionFilters = {
  status: 'POSTED' as const,
  page: 0,
  size: 5,
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

function getTransactionTitle(
  transaction: Transaction,
) {
  if (transaction.merchantName?.trim()) {
    return transaction.merchantName
  }

  if (transaction.description?.trim()) {
    return transaction.description
  }

  switch (transaction.transactionType) {
    case 'INCOME':
      return 'Income'
    case 'EXPENSE':
      return 'Expense'
    case 'TRANSFER_IN':
      return 'Transfer received'
    case 'TRANSFER_OUT':
      return 'Transfer sent'
  }
}

function transactionAppearance(
  transaction: Transaction,
) {
  switch (transaction.transactionType) {
    case 'INCOME':
      return {
        Icon: ArrowDownLeft,
        iconClassName:
          'bg-[#dfece3] text-[#2d684f]',
        amountClassName: 'text-[#2d684f]',
        prefix: '+',
      }

    case 'EXPENSE':
      return {
        Icon: ArrowUpRight,
        iconClassName:
          'bg-[#f4e7df] text-[#a85e49]',
        amountClassName: 'text-[#a85e49]',
        prefix: '−',
      }

    case 'TRANSFER_IN':
      return {
        Icon: Repeat2,
        iconClassName:
          'bg-[#e3e9ed] text-[#557587]',
        amountClassName: 'text-[#557587]',
        prefix: '+',
      }

    case 'TRANSFER_OUT':
      return {
        Icon: Repeat2,
        iconClassName:
          'bg-[#f1e7d3] text-[#9a6828]',
        amountClassName: 'text-[#9a6828]',
        prefix: '−',
      }
  }
}

export default function RecentTransactionsCard() {
  const transactionsQuery = useTransactions(
    recentTransactionFilters,
  )

  const accountsQuery = useAccounts('ACTIVE')

  const incomeCategoriesQuery = useCategories(
    'INCOME',
    'ACTIVE',
  )

  const expenseCategoriesQuery = useCategories(
    'EXPENSE',
    'ACTIVE',
  )

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

  const transactions =
    transactionsQuery.data?.items ?? []

  const errorMessage =
    transactionsQuery.error instanceof ApiClientError
      ? transactionsQuery.error.message
      : 'Unable to load recent transactions.'

  return (
    <section className="mt-11">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] text-[#657972]">
            LATEST ACTIVITY
          </p>

          <h2 className="mt-3 font-serif text-3xl tracking-[-0.02em] text-[#173c32]">
            Recent transactions
          </h2>
        </div>

        <Link
          to="/transactions"
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#9a6828] hover:underline hover:underline-offset-4"
        >
          View all
          <ArrowRight size={15} aria-hidden/>
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-[#dedbd2] bg-[#fffdf8]">
        {transactionsQuery.isPending && (
          <div className="animate-pulse divide-y divide-[#e5e1d8]">
            {Array.from({length: 5}).map(
              (_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 px-6 py-5"
                >
                  <div className="size-10 rounded-xl bg-[#e5e8e1]"/>

                  <div className="flex-1">
                    <div className="h-4 w-40 rounded bg-[#e5e8e1]"/>
                    <div className="mt-2 h-3 w-56 rounded bg-[#eceee9]"/>
                  </div>

                  <div className="h-4 w-24 rounded bg-[#e5e8e1]"/>
                </div>
              ),
            )}
          </div>
        )}

        {transactionsQuery.error && (
          <div
            role="alert"
            className="px-6 py-8 text-center"
          >
            <p className="text-sm text-red-700">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() =>
                void transactionsQuery.refetch()
              }
              className="mt-3 cursor-pointer text-sm font-semibold text-red-800 underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {transactionsQuery.data &&
          transactions.length === 0 && (
          <div className="px-6 py-10 text-center">
            <span className="mx-auto grid size-11 place-items-center rounded-full bg-[#e0ece4] text-[#2d684f]">
              <ReceiptText size={19} aria-hidden/>
            </span>

            <p className="mt-4 font-serif text-2xl text-[#173c32]">
              No transactions yet
            </p>

            <p className="mt-2 text-sm text-[#657972]">
              Your latest financial activity will appear
              here.
            </p>

            <Link
              to="/transactions"
              className="mt-5 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#2d684f] hover:underline hover:underline-offset-4"
            >
              Add a transaction
              <ArrowRight size={15} aria-hidden/>
            </Link>
          </div>
        )}

        {transactions.map((transaction, index) => {
          const account = accountById.get(
            transaction.accountId,
          )

          const category = transaction.categoryId
            ? categoryById.get(transaction.categoryId)
            : undefined

          const appearance =
            transactionAppearance(transaction)

          const Icon = appearance.Icon

          return (
            <article
              key={transaction.id}
              className={`grid gap-4 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-7 ${
                index > 0
                  ? 'border-t border-[#e5e1d8]'
                  : ''
              }`}
            >
              <div className="flex min-w-0 items-center gap-4">
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-xl ${appearance.iconClassName}`}
                >
                  <Icon size={17} aria-hidden/>
                </span>

                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#173c32]">
                    {getTransactionTitle(transaction)}
                  </p>

                  <p className="mt-1 truncate text-xs text-[#657972]">
                    {category?.name ??
                      (
                        transaction.transferId
                          ? 'Transfer'
                          : 'Uncategorised'
                      )}
                    {' · '}
                    {account?.name ??
                      'Unavailable account'}
                    {' · '}
                    {formatDate(
                      transaction.transactionDate,
                    )}
                  </p>
                </div>
              </div>

              <p
                className={`font-semibold ${appearance.amountClassName}`}
              >
                {appearance.prefix}
                {formatMoney(
                  transaction.amount,
                  account?.currencyCode,
                )}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}