import { useState } from 'react'
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CircleSlash2,
  Pencil,
  Plus,
} from 'lucide-react'

import { ApiClientError } from '../../../api/ApiClientError'
import RefreshButton from '../../../components/actions/RefreshButton'
import PageHeader from '../../../components/layout/PageHeader'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorPanel from '../../../components/ui/ErrorPanel'
import Pagination from '../../../components/ui/Pagination'
import { formatDateOnly, formatMoney } from '../../../utils/formatters'
import { useAccounts } from '../../accounts/hooks/useAccounts'
import { useCategories } from '../../categories/hooks/useCategories'
import type {
  Transaction,
  TransactionFilters,
  TransactionType,
} from '../api/types'
import TransactionModal from '../components/TransactionModal'
import VoidTransactionModal from '../components/VoidTransactionModal'
import {
  defaultTransactionFilters,
  useTransactions,
} from '../hooks/useTransactions'

const transactionTypeLabels = {
  INCOME: 'Income',
  EXPENSE: 'Expense',
  TRANSFER_IN: 'Transfer received',
  TRANSFER_OUT: 'Transfer sent',
} satisfies Record<TransactionType, string>

function TransactionIcon({ type }: { type: TransactionType }) {
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

      {(type === 'TRANSFER_IN' || type === 'TRANSFER_OUT') && (
        <ArrowLeftRight size={19} aria-hidden />
      )}
    </span>
  )
}

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({
    ...defaultTransactionFilters,
  })
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)
  const [voidTarget, setVoidTarget] = useState<Transaction | null>(null)

  const transactionsQuery = useTransactions(filters)
  const activeAccountsQuery = useAccounts('ACTIVE')
  const archivedAccountsQuery = useAccounts('ARCHIVED')
  const activeCategoriesQuery = useCategories()
  const archivedCategoriesQuery = useCategories(undefined, 'ARCHIVED')

  const transactions = transactionsQuery.data?.items ?? []

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
    categories.map((category) => [category.id, category]),
  )

  function updateFilters(update: Partial<TransactionFilters>) {
    setFilters((current) => ({
      ...current,
      ...update,
      page: update.page ?? 0,
    }))
  }

  function clearFilters() {
    setFilters({ ...defaultTransactionFilters })
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
        <PageHeader
          eyebrow="Money in motion"
          title="Transactions"
          description="Follow every income, expense and transfer across your accounts."
          actions={
            <>
              <RefreshButton
                isRefreshing={transactionsQuery.isFetching}
                onRefresh={transactionsQuery.refetch}
                label="Refresh transactions"
                iconOnly
              />

              <button
                type="button"
                onClick={openCreateForm}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#174f43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#236a58]"
              >
                <Plus size={18} aria-hidden />
                Add transaction
              </button>
            </>
          }
        />

        <section className="feature-reveal feature-reveal-delay-1 mt-10 rounded-3xl border border-[#dedbd2] bg-[#fffdf8] p-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="text-xs font-semibold text-[#657972]">
              Type
              <select
                value={filters.type ?? ''}
                onChange={(event) =>
                  updateFilters({
                    type: (event.target.value || undefined) as
                      | TransactionType
                      | undefined,
                  })
                }
                className="mt-2 block w-full cursor-pointer rounded-xl border border-[#d8d6ce] bg-white px-3 py-2.5 pr-10 text-sm text-[#173c32]"
              >
                <option value="">All types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
                <option value="TRANSFER_IN">Transfer received</option>
                <option value="TRANSFER_OUT">Transfer sent</option>
              </select>
            </label>

            <label className="text-xs font-semibold text-[#657972]">
              Account
              <select
                value={filters.accountId ?? ''}
                onChange={(event) =>
                  updateFilters({
                    accountId: event.target.value || undefined,
                  })
                }
                className="mt-2 block w-full cursor-pointer rounded-xl border border-[#d8d6ce] bg-white px-3 py-2.5 pr-10 text-sm text-[#173c32]"
              >
                <option value="">All accounts</option>

                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
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
                    status: event.target.value as TransactionFilters['status'],
                  })
                }
                className="mt-2 block w-full cursor-pointer rounded-xl border border-[#d8d6ce] bg-white px-3 py-2.5 pr-10 text-sm text-[#173c32]"
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
                    fromDate: event.target.value || undefined,
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
                    toDate: event.target.value || undefined,
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
              className="mt-4 cursor-pointer text-sm font-semibold text-[#9a6828] underline underline-offset-4"
            >
              Clear filters
            </button>
          )}
        </section>

        {transactionsQuery.isPending && (
          <div className="feature-reveal feature-reveal-delay-2 mt-8 animate-pulse overflow-hidden rounded-3xl border border-[#dedbd2]">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-24 border-b border-[#dedbd2] bg-[#e7e8e2] last:border-0"
              />
            ))}
          </div>
        )}

        {transactionsQuery.error && (
          <ErrorPanel
            title="We couldn’t load your transactions"
            message={
              transactionsQuery.error instanceof ApiClientError
                ? transactionsQuery.error.message
                : 'Please try again.'
            }
            className="feature-reveal feature-reveal-delay-2 mt-8"
          />
        )}

        {transactionsQuery.isSuccess && transactions.length === 0 && (
          <EmptyState
            icon={<ArrowLeftRight size={25} aria-hidden />}
            title="No transactions found"
            description={
              hasFilters
                ? 'Try adjusting your filters.'
                : 'Record your first income or expense to begin tracking your activity.'
            }
            variant="solid"
            iconClassName="bg-[#dfece3] text-[#39725d]"
            className="feature-reveal feature-reveal-delay-2 mt-8"
          />
        )}

        {!transactionsQuery.isPending &&
          !transactionsQuery.error &&
          transactions.length > 0 && (
            <section className="feature-reveal feature-reveal-delay-2 mt-8 overflow-hidden rounded-3xl border border-[#dedbd2] bg-[#fffdf8]">
              {transactions.map((transaction, index) => {
                const account = accountsById.get(transaction.accountId)
                const category = transaction.categoryId
                  ? categoriesById.get(transaction.categoryId)
                  : undefined

                const isIncoming =
                  transaction.transactionType === 'INCOME' ||
                  transaction.transactionType === 'TRANSFER_IN'

                const canModify =
                  transaction.status === 'POSTED' &&
                  transaction.transferId === null

                return (
                  <article
                    key={transaction.id}
                    className={`grid gap-4 px-5 py-5 sm:grid-cols-[1fr_auto] sm:items-center sm:px-7 ${
                      index > 0 ? 'border-t border-[#dedbd2]' : ''
                    }`}
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <TransactionIcon type={transaction.transactionType} />

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate font-semibold text-[#173c32]">
                            {transaction.merchantName ||
                              transaction.description ||
                              transactionTypeLabels[transaction.transactionType]}
                          </h2>

                          {transaction.status === 'VOIDED' && (
                            <span className="rounded-full bg-[#eceae4] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#657972]">
                              Voided
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-[#657972]">
                          {category?.name ??
                            transactionTypeLabels[transaction.transactionType]}
                          {' · '}
                          {account?.name ?? 'Unknown account'}
                          {' · '}
                          {formatDateOnly(transaction.transactionDate)}
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
                        {formatMoney(transaction.amount, account?.currencyCode)}
                      </p>

                      {canModify && (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => openEditForm(transaction)}
                            className="cursor-pointer rounded-full p-2 text-[#657972] transition hover:bg-[#e5ece7] hover:text-[#39725d]"
                            aria-label="Edit transaction"
                            title="Edit transaction"
                          >
                            <Pencil size={17} aria-hidden />
                          </button>

                          <button
                            type="button"
                            onClick={() => setVoidTarget(transaction)}
                            className="cursor-pointer rounded-full p-2 text-[#657972] transition hover:bg-[#f2e3de] hover:text-[#9b5845]"
                            aria-label="Void transaction"
                            title="Void transaction"
                          >
                            <CircleSlash2 size={17} aria-hidden />
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
          !transactionsQuery.error &&
          transactionsQuery.data.totalPages > 1 && (
            <div className="feature-reveal feature-reveal-delay-3 mt-6">
              <Pagination
                label="Transaction pages"
                page={transactionsQuery.data.page}
                totalPages={transactionsQuery.data.totalPages}
                onPageChange={(page) => updateFilters({ page })}
                isFetching={transactionsQuery.isFetching}
              />
            </div>
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
        <VoidTransactionModal
          key={voidTarget.id}
          transaction={voidTarget}
          onClose={() => setVoidTarget(null)}
        />
      )}
    </main>
  )
}