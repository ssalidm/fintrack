import { useState } from 'react'
import {
  Archive,
  Landmark,
  Pencil,
  Plus,
  RefreshCw,
  WalletCards,
} from 'lucide-react'
import { ApiClientError } from '../../../api/ApiClientError'
import type {
  Account,
  AccountStatus,
  AccountType,
} from '../api/types'
import AccountModal from '../components/AccountModal'
import {
  useAccountBalances,
  useAccounts,
  useArchiveAccount,
} from '../hooks/useAccounts'

const accountTypeLabels = {
  CASH: 'Cash',
  CURRENT: 'Current account',
  SAVINGS: 'Savings',
  CREDIT_CARD: 'Credit card',
  INVESTMENT: 'Investment',
  OTHER: 'Other',
} satisfies Record<AccountType, string>

const accountTypeColours = {
  CASH: 'bg-[#dfece3] text-[#39725d]',
  CURRENT: 'bg-[#dce9eb] text-[#39717a]',
  SAVINGS: 'bg-[#f2e7ca] text-[#9a6828]',
  CREDIT_CARD: 'bg-[#f0dfda] text-[#9b5845]',
  INVESTMENT: 'bg-[#e5e0ed] text-[#6f5d83]',
  OTHER: 'bg-[#e8e7e2] text-[#657972]',
} satisfies Record<AccountType, string>

function formatMoney(amount: number, currencyCode: string) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(amount)
}

export default function AccountsPage() {
  const [status, setStatus] =
    useState<AccountStatus>('ACTIVE')

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] =
    useState<Account | null>(null)

  const [archiveTarget, setArchiveTarget] =
    useState<Account | null>(null)

  const [archiveError, setArchiveError] =
    useState<string | null>(null)

  const accountsQuery = useAccounts(status)
  const balancesQuery = useAccountBalances()
  const archiveAccount = useArchiveAccount()

  const accounts = accountsQuery.data ?? []
  const balances = balancesQuery.data ?? []

  const balancesByAccountId = new Map(
    balances.map((balance) => [
      balance.accountId,
      balance,
    ]),
  )

  const loadError =
    accountsQuery.error ?? balancesQuery.error

  const isPending =
    accountsQuery.isPending ||
    balancesQuery.isPending

  const isRefreshing =
    accountsQuery.isFetching ||
    balancesQuery.isFetching

  function openCreateForm() {
    setEditingAccount(null)
    setIsFormOpen(true)
  }

  function openEditForm(account: Account) {
    setEditingAccount(account)
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingAccount(null)
  }

  async function refreshAccounts() {
    await Promise.all([
      accountsQuery.refetch(),
      balancesQuery.refetch(),
    ])
  }

  async function confirmArchive() {
    if (!archiveTarget) {
      return
    }

    setArchiveError(null)

    try {
      await archiveAccount.mutateAsync({
        accountId: archiveTarget.id,
        payload: {
          version: archiveTarget.version,
        },
      })

      setArchiveTarget(null)
    } catch (error) {
      setArchiveError(
        error instanceof ApiClientError
          ? error.message
          : 'Unable to archive this account.',
      )
    }
  }

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12 lg:py-12 xl:px-16">
      <div className="mx-auto max-w-[1280px]">
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#657972]">
              THE FULL PICTURE
            </p>

            <h1 className="mt-4 font-serif text-5xl tracking-[-0.03em] text-[#173c32]">
              Your accounts
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#657972]">
              See where your money lives and how each account
              contributes to your overall position.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isRefreshing}
              onClick={() => void refreshAccounts()}
              className="rounded-full border border-[#d8d6ce] bg-[#fffdf8] p-3 text-[#657972] transition hover:border-[#bd9460] hover:text-[#9a6828] disabled:opacity-60"
              aria-label="Refresh accounts"
            >
              <RefreshCw
                size={18}
                className={
                  isRefreshing ? 'animate-spin' : ''
                }
              />
            </button>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 rounded-full bg-[#174f43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#236a58]"
            >
              <Plus size={18} aria-hidden />
              Add account
            </button>
          </div>
        </header>

        <div className="mt-10 flex gap-7 border-b border-[#dedbd2]">
          {(['ACTIVE', 'ARCHIVED'] as const).map(
            (accountStatus) => (
              <button
                key={accountStatus}
                type="button"
                onClick={() => setStatus(accountStatus)}
                className={`border-b-2 px-1 pb-4 text-sm font-semibold transition ${
                  status === accountStatus
                    ? 'border-[#39725d] text-[#173c32]'
                    : 'border-transparent text-[#7a8984] hover:text-[#173c32]'
                }`}
              >
                {accountStatus === 'ACTIVE'
                  ? 'Active accounts'
                  : 'Archived'}
              </button>
            ),
          )}
        </div>

        {isPending && (
          <div className="mt-8 animate-pulse overflow-hidden rounded-3xl border border-[#dedbd2]">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 border-b border-[#dedbd2] bg-[#e7e8e2] last:border-0"
              />
            ))}
          </div>
        )}

        {loadError && (
          <section
            className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6"
            role="alert"
          >
            <h2 className="font-serif text-2xl text-red-950">
              We couldn’t load your accounts
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {loadError instanceof ApiClientError
                ? loadError.message
                : 'Please try again.'}
            </p>

            <button
              type="button"
              onClick={() => void refreshAccounts()}
              className="mt-4 text-sm font-semibold text-red-800 underline underline-offset-4"
            >
              Try again
            </button>
          </section>
        )}

        {!isPending && !loadError && accounts.length === 0 && (
          <section className="mt-8 rounded-3xl border border-[#dedbd2] bg-[#fffdf8] px-6 py-16 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#dfece3] text-[#39725d]">
              <WalletCards size={25} />
            </span>

            <h2 className="mt-5 font-serif text-3xl text-[#173c32]">
              {status === 'ACTIVE'
                ? 'Your accounts will live here'
                : 'No archived accounts'}
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#657972]">
              {status === 'ACTIVE'
                ? 'Add your first account to begin tracking balances and building your net worth.'
                : 'Accounts you archive will remain available here for historical reporting.'}
            </p>

            {status === 'ACTIVE' && (
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#174f43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#236a58]"
              >
                <Plus size={18} aria-hidden />
                Add your first account
              </button>
            )}
          </section>
        )}

        {!isPending && !loadError && accounts.length > 0 && (
          <section className="mt-8 overflow-hidden rounded-3xl border border-[#dedbd2] bg-[#fffdf8]">
            {accounts.map((account, index) => {
              const balance =
                balancesByAccountId.get(account.id)

              const currentBalance =
                balance?.currentBalance ??
                account.openingBalance

              return (
                <article
                  key={account.id}
                  className={`grid gap-5 px-5 py-6 sm:grid-cols-[1fr_auto] sm:items-center sm:px-7 ${
                    index > 0
                      ? 'border-t border-[#dedbd2]'
                      : ''
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <span
                      className={`grid size-11 shrink-0 place-items-center rounded-xl ${
                        accountTypeColours[
                          account.accountType
                          ]
                      }`}
                    >
                      <Landmark size={19} aria-hidden />
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate font-semibold text-[#173c32]">
                          {account.name}
                        </h2>

                        {!account.includeInNetWorth && (
                          <span className="rounded-full bg-[#eceae4] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#657972]">
                            Excluded from net worth
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-[#657972]">
                        {
                          accountTypeLabels[
                            account.accountType
                            ]
                        }
                        {' · '}
                        {account.currencyCode}
                        {' · '}
                        {balance?.postedTransactionCount ?? 0}{' '}
                        transactions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-5 pl-15 sm:justify-end sm:pl-0">
                    <div className="text-left sm:text-right">
                      <p className="font-semibold text-[#173c32]">
                        {formatMoney(
                          currentBalance,
                          account.currencyCode,
                        )}
                      </p>

                      <p className="mt-1 text-xs text-[#657972]">
                        Current balance
                      </p>
                    </div>

                    {status === 'ACTIVE' && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(account)
                          }
                          className="rounded-full p-2 text-[#657972] transition hover:bg-[#e5ece7] hover:text-[#39725d]"
                          aria-label={`Edit ${account.name}`}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setArchiveError(null)
                            setArchiveTarget(account)
                          }}
                          className="rounded-full p-2 text-[#657972] transition hover:bg-[#f2e7df] hover:text-[#9b5845]"
                          aria-label={`Archive ${account.name}`}
                        >
                          <Archive size={17} />
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

      {isFormOpen && (
        <AccountModal
          key={editingAccount?.id ?? 'new-account'}
          account={editingAccount ?? undefined}
          onClose={closeForm}
        />
      )}

      {archiveTarget && (
        <div className="fixed inset-0 z-[80] grid place-items-center p-5">
          <button
            type="button"
            className="absolute inset-0 bg-[#102e27]/45 backdrop-blur-[2px]"
            onClick={() => setArchiveTarget(null)}
            aria-label="Cancel archiving"
          />

          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="archive-title"
            className="relative w-full max-w-md rounded-3xl bg-[#fffdf8] p-7 shadow-2xl"
          >
            <span className="grid size-11 place-items-center rounded-full bg-[#f2e7df] text-[#9b5845]">
              <Archive size={20} />
            </span>

            <h2
              id="archive-title"
              className="mt-5 font-serif text-3xl text-[#173c32]"
            >
              Archive this account?
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#657972]">
              <strong className="text-[#173c32]">
                {archiveTarget.name}
              </strong>{' '}
              will be removed from your active accounts but
              retained for historical reporting.
            </p>

            {archiveError && (
              <p
                className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
                role="alert"
              >
                {archiveError}
              </p>
            )}

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                disabled={archiveAccount.isPending}
                onClick={() => setArchiveTarget(null)}
                className="rounded-full border border-[#d8d6ce] px-5 py-2.5 text-sm font-semibold text-[#173c32] hover:bg-[#efede7] disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={archiveAccount.isPending}
                onClick={() => void confirmArchive()}
                className="rounded-full bg-[#9b5845] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#834937] disabled:opacity-60"
              >
                {archiveAccount.isPending
                  ? 'Archiving…'
                  : 'Archive account'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
