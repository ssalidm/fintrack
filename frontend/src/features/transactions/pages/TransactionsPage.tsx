import { useState } from 'react'
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CircleSlash2,
  Pencil,
  Plus,
  RefreshCw,
} from 'lucide-react'
import { ApiClientError } from '../../../api/ApiClientError'
import { useAccounts } from '../../accounts/hooks/useAccounts'
import { useCategories } from '../../categories/hooks/useCategories'
import type {
  Transaction,
  TransactionFilters,
  TransactionType,
} from '../api/types'
import TransactionModal from '../components/TransactionModal'
import {
  defaultTransactionFilters,
  useTransactions,
  useVoidTransaction,
} from '../hooks/useTransactions'

const transactionTypeLabels = {
  INCOME: 'Income',
  EXPENSE: 'Expense',
  TRANSFER_IN: 'Transfer received',
  TRANSFER_OUT: 'Transfer sent',
} satisfies Record<TransactionType, string>

function parseLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)

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
    return amount.toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(amount)
}

function TransactionIcon({
                           type,
                         }: {
  type: TransactionType
}) {
  const classes =
    type === 'INCOME'
      ? 'bg-[#dfece3] text-[#39725d]'
      : type === 'EXPENSE'
        ? 'bg-[#f2e3de] text-[#9b5845]'
        : 'bg-[#e1e9ed] text-[#486b78]'

  return (
    <span
      className={`grid size-11 shrink-0 place-items-center rounded-xl ${classes}`}
    >
      {type === 'INCOME' && (
        <ArrowDownLeft size={19} aria-hidden />
      )}

      {type === 'EXPENSE' && (
        <ArrowUpRight size={19} aria-hidden />
      )}

      {(type === 'TRANSFER_IN' ||
        type === 'TRANSFER_OUT') && (
        <ArrowLeftRight size={19} aria-hidden />
      )}
    </span>
  )
}

export default function TransactionsPage() {
  const [filters, setFilters] =
    useState<TransactionFilters>({
      ...defaultTransactionFilters,
    })

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)

  const [voidTarget, setVoidTarget] =
    useState<Transaction | null>(null)

  const [voidReason, setVoidReason] = useState('')
  const [voidError, setVoidError] =
    useState<string | null>(null)

  const transactionsQuery = useTransactions(filters)
  const activeAccountsQuery = useAccounts('ACTIVE')
  const archivedAccountsQuery = useAccounts('ARCHIVED')
  const activeCategoriesQuery = useCategories()
  const archivedCategoriesQuery = useCategories(
    undefined,
    'ARCHIVED',
  )

  const voidTransaction = useVoidTransaction()

  const transactions =
    transactionsQuery.data?.items ?? []

  const accounts = [
    ...(activeAccountsQuery.data ?? []),
    ...(archivedAccountsQuery.data ?? []),
  ]

  const categories = [
    ...(activeCategoriesQuery.data ?? []),
    ...(archivedCategoriesQuery.data ?? []),
  ]

  const accountsById = new Map(
    accounts.map((account) => [account.id, account]),
  )

  const categoriesById = new Map(
    categories.map((category) => [
      category.id,
      category,
    ]),
  )

  function updateFilters(
    update: Partial<TransactionFilters>,
  ) {
    setFilters((current) => ({
      ...current,
      ...update,
      page: update.page ?? 0,
    }))
  }

  function clearFilters() {
    setFilters({
      ...defaultTransactionFilters,
    })
  }

  function openCreateForm() {
    setEditingTransaction(null)
    setIsFormOpen(true)
  }

  function openEditForm(transaction: Transaction) {
    setEditingTransaction(transaction)
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingTransaction(null)
  }

  function openVoidDialog(transaction: Transaction) {
    setVoidTarget(transaction)
    setVoidReason('')
    setVoidError(null)
  }

  function closeVoidDialog() {
    setVoidTarget(null)
    setVoidReason('')
    setVoidError(null)
  }

  async function confirmVoid() {
    if (!voidTarget) {
      return
    }

    const reason = voidReason.trim()

    if (!reason) {
      setVoidError('A reason is required.')
      return
    }

    if (reason.length > 255) {
      setVoidError(
        'Reason must not exceed 255 characters.',
      )
      return
    }

    setVoidError(null)

    try {
      await voidTransaction.mutateAsync({
        transactionId: voidTarget.id,
        payload: {
          version: voidTarget.version,
          reason,
        },
      })

      closeVoidDialog()
    } catch (error) {
      setVoidError(
        error instanceof ApiClientError
          ? error.message
          : 'Unable to void this transaction.',
      )
    }
  }

  const hasFilters =
    Boolean(filters.accountId) ||
    Boolean(filters.categoryId) ||
    Boolean(filters.type) ||
    Boolean(filters.fromDate) ||
    Boolean(filters.toDate) ||
    filters.status !== 'POSTED'

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12 lg:py-12 xl:px-16">
      <div className="mx-auto max-w-[1280px]">
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#657972]">
              EVERYDAY ACTIVITY
            </p>

            <h1 className="mt-4 font-serif text-5xl tracking-[-0.03em] text-[#173c32]">
              Money in motion
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#657972]">
              Follow every income, expense and transfer across
              your accounts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={transactionsQuery.isFetching}
              onClick={() =>
                void transactionsQuery.refetch()
              }
              className="rounded-full border border-[#d8d6ce] bg-[#fffdf8] p-3 text-[#657972] hover:border-[#bd9460] hover:text-[#9a6828] disabled:opacity-60"
              aria-label="Refresh transactions"
            >
              <RefreshCw
                size={18}
                className={
                  transactionsQuery.isFetching
                    ? 'animate-spin'
                    : ''
                }
              />
            </button>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 rounded-full bg-[#174f43] px-5 py-3 text-sm font-semibold text-white hover:bg-[#236a58]"
            >
              <Plus size={18} aria-hidden />
              Add transaction
            </button>
          </div>
        </header>

        <section className="mt-10 rounded-3xl border border-[#dedbd2] bg-[#fffdf8] p-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="text-xs font-semibold text-[#657972]">
              Type
              <select
                value={filters.type ?? ''}
                onChange={(event) =>
                  updateFilters({
                    type:
                      (event.target.value ||
                        undefined) as
                        | TransactionType
                        | undefined,
                  })
                }
                className="mt-2 block w-full rounded-xl border border-[#d8d6ce] bg-white px-3 py-2.5 text-sm text-[#173c32]"
              >
                <option value="">All types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
                <option value="TRANSFER_IN">
                  Transfer received
                </option>
                <option value="TRANSFER_OUT">
                  Transfer sent
                </option>
              </select>
            </label>

            <label className="text-xs font-semibold text-[#657972]">
              Account
              <select
                value={filters.accountId ?? ''}
                onChange={(event) =>
                  updateFilters({
                    accountId:
                      event.target.value || undefined,
                  })
                }
                className="mt-2 block w-full rounded-xl border border-[#d8d6ce] bg-white px-3 py-2.5 text-sm text-[#173c32]"
              >
                <option value="">All accounts</option>

                {accounts.map((account) => (
                  <option
                    key={account.id}
                    value={account.id}
                  >
                    {account.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-semibold text-[#657972]">
              Status
              <select
                value={filters.status}
                onChange={(event) =>
                  updateFilters({
                    status: event.target
                      .value as TransactionFilters['status'],
                  })
                }
                className="mt-2 block w-full rounded-xl border border-[#d8d6ce] bg-white px-3 py-2.5 text-sm text-[#173c32]"
              >
                <option value="POSTED">Posted</option>
                <option value="VOIDED">Voided</option>
              </select>
            </label>

            <label className="text-xs font-semibold text-[#657972]">
              From
              <input
                type="date"
                value={filters.fromDate ?? ''}
                onChange={(event) =>
                  updateFilters({
                    fromDate:
                      event.target.value || undefined,
                  })
                }
                className="mt-2 block w-full rounded-xl border border-[#d8d6ce] bg-white px-3 py-2.5 text-sm text-[#173c32]"
              />
            </label>

            <label className="text-xs font-semibold text-[#657972]">
              To
              <input
                type="date"
                value={filters.toDate ?? ''}
                onChange={(event) =>
                  updateFilters({
                    toDate:
                      event.target.value || undefined,
                  })
                }
                className="mt-2 block w-full rounded-xl border border-[#d8d6ce] bg-white px-3 py-2.5 text-sm text-[#173c32]"
              />
            </label>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 text-sm font-semibold text-[#9a6828] underline underline-offset-4"
            >
              Clear filters
            </button>
          )}
        </section>

        {transactionsQuery.isPending && (
          <div className="mt-8 animate-pulse overflow-hidden rounded-3xl border border-[#dedbd2]">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-24 border-b border-[#dedbd2] bg-[#e7e8e2] last:border-0"
              />
            ))}
          </div>
        )}

        {transactionsQuery.error && (
          <section
            className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6"
            role="alert"
          >
            <h2 className="font-serif text-2xl text-red-950">
              We couldn’t load your transactions
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {transactionsQuery.error instanceof
              ApiClientError
                ? transactionsQuery.error.message
                : 'Please try again.'}
            </p>
          </section>
        )}

        {!transactionsQuery.isPending &&
          !transactionsQuery.error &&
          transactions.length === 0 && (
            <section className="mt-8 rounded-3xl border border-[#dedbd2] bg-[#fffdf8] px-6 py-16 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#dfece3] text-[#39725d]">
                <ArrowLeftRight size={25} />
              </span>

              <h2 className="mt-5 font-serif text-3xl text-[#173c32]">
                No transactions found
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#657972]">
                {hasFilters
                  ? 'Try adjusting your filters.'
                  : 'Record your first income or expense to begin tracking your activity.'}
              </p>
            </section>
          )}

        {!transactionsQuery.isPending &&
          !transactionsQuery.error &&
          transactions.length > 0 && (
            <section className="mt-8 overflow-hidden rounded-3xl border border-[#dedbd2] bg-[#fffdf8]">
              {transactions.map((transaction, index) => {
                const account = accountsById.get(
                  transaction.accountId,
                )

                const category = transaction.categoryId
                  ? categoriesById.get(
                    transaction.categoryId,
                  )
                  : undefined

                const isIncoming =
                  transaction.transactionType ===
                  'INCOME' ||
                  transaction.transactionType ===
                  'TRANSFER_IN'

                const canModify =
                  transaction.status === 'POSTED' &&
                  transaction.transferId === null

                return (
                  <article
                    key={transaction.id}
                    className={`grid gap-4 px-5 py-5 sm:grid-cols-[1fr_auto] sm:items-center sm:px-7 ${
                      index > 0
                        ? 'border-t border-[#dedbd2]'
                        : ''
                    }`}
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <TransactionIcon
                        type={transaction.transactionType}
                      />

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate font-semibold text-[#173c32]">
                            {transaction.merchantName ||
                              transaction.description ||
                              transactionTypeLabels[
                                transaction.transactionType
                                ]}
                          </h2>

                          {transaction.status ===
                            'VOIDED' && (
                              <span className="rounded-full bg-[#eceae4] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#657972]">
                              Voided
                            </span>
                            )}
                        </div>

                        <p className="mt-1 text-sm text-[#657972]">
                          {category?.name ??
                            transactionTypeLabels[
                              transaction.transactionType
                              ]}
                          {' · '}
                          {account?.name ??
                            'Unknown account'}
                          {' · '}
                          {formatDate(
                            transaction.transactionDate,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-5 pl-15 sm:justify-end sm:pl-0">
                      <p
                        className={`font-semibold ${
                          transaction.status === 'VOIDED'
                            ? 'text-[#8b9692] line-through'
                            : isIncoming
                              ? 'text-[#39725d]'
                              : 'text-[#9b5845]'
                        }`}
                      >
                        {isIncoming ? '+' : '−'}
                        {formatMoney(
                          transaction.amount,
                          account?.currencyCode,
                        )}
                      </p>

                      {canModify && (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(transaction)
                            }
                            className="rounded-full p-2 text-[#657972] hover:bg-[#e5ece7] hover:text-[#39725d]"
                            aria-label="Edit transaction"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openVoidDialog(transaction)
                            }
                            className="rounded-full p-2 text-[#657972] hover:bg-[#f2e3de] hover:text-[#9b5845]"
                            aria-label="Void transaction"
                          >
                            <CircleSlash2 size={17} />
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </section>
          )}

        {transactionsQuery.data &&
          transactionsQuery.data.totalPages > 1 && (
            <nav
              className="mt-6 flex items-center justify-between"
              aria-label="Transaction pages"
            >
              <button
                type="button"
                disabled={
                  !transactionsQuery.data.hasPrevious
                }
                onClick={() =>
                  updateFilters({
                    page: filters.page - 1,
                  })
                }
                className="inline-flex items-center gap-2 rounded-full border border-[#d8d6ce] px-4 py-2 text-sm font-semibold text-[#173c32] disabled:opacity-40"
              >
                <ChevronLeft size={17} />
                Previous
              </button>

              <p className="text-sm text-[#657972]">
                Page {transactionsQuery.data.page + 1} of{' '}
                {transactionsQuery.data.totalPages}
              </p>

              <button
                type="button"
                disabled={!transactionsQuery.data.hasNext}
                onClick={() =>
                  updateFilters({
                    page: filters.page + 1,
                  })
                }
                className="inline-flex items-center gap-2 rounded-full border border-[#d8d6ce] px-4 py-2 text-sm font-semibold text-[#173c32] disabled:opacity-40"
              >
                Next
                <ChevronRight size={17} />
              </button>
            </nav>
          )}
      </div>

      {isFormOpen && (
        <TransactionModal
          key={editingTransaction?.id ?? 'new'}
          transaction={editingTransaction ?? undefined}
          onClose={closeForm}
        />
      )}

      {voidTarget && (
        <div className="fixed inset-0 z-[80] grid place-items-center p-5">
          <button
            type="button"
            className="absolute inset-0 bg-[#102e27]/45 backdrop-blur-[2px]"
            onClick={closeVoidDialog}
            aria-label="Cancel voiding"
          />

          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="void-title"
            className="relative w-full max-w-md rounded-3xl bg-[#fffdf8] p-7 shadow-2xl"
          >
            <span className="grid size-11 place-items-center rounded-full bg-[#f2e3de] text-[#9b5845]">
              <CircleSlash2 size={20} />
            </span>

            <h2
              id="void-title"
              className="mt-5 font-serif text-3xl text-[#173c32]"
            >
              Void this transaction?
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#657972]">
              The transaction will remain in your history but will
              no longer affect the account balance.
            </p>

            <label className="mt-5 block text-sm font-semibold text-[#173c32]">
              Reason
              <textarea
                rows={3}
                maxLength={255}
                value={voidReason}
                onChange={(event) =>
                  setVoidReason(event.target.value)
                }
                className="mt-2 block w-full resize-none rounded-xl border border-[#d8d6ce] bg-white px-4 py-3 font-normal outline-none focus:border-[#9b5845] focus:ring-2 focus:ring-[#9b5845]/15"
                placeholder="Why is this transaction being voided?"
              />
            </label>

            {voidError && (
              <p
                className="mt-3 text-sm text-red-700"
                role="alert"
              >
                {voidError}
              </p>
            )}

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                disabled={voidTransaction.isPending}
                onClick={closeVoidDialog}
                className="rounded-full border border-[#d8d6ce] px-5 py-2.5 text-sm font-semibold text-[#173c32] hover:bg-[#efede7] disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={voidTransaction.isPending}
                onClick={() => void confirmVoid()}
                className="rounded-full bg-[#9b5845] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#834937] disabled:opacity-60"
              >
                {voidTransaction.isPending
                  ? 'Voiding…'
                  : 'Void transaction'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
