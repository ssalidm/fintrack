import { useState } from 'react'
import {
  Archive,
  Landmark,
  Pencil,
  Plus,
  WalletCards,
} from 'lucide-react'

import { ApiClientError } from '@/api/ApiClientError'
import RefreshButton from '@/components/actions/RefreshButton'
import PageHeader from '@/components/layout/PageHeader'
import PageShell from '@/components/layout/PageShell'
import StatusTabs from '@/components/navigation/StatusTabs'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog'
import EmptyState from '@/components/ui/EmptyState'
import ErrorPanel from '@/components/ui/ErrorPanel'
import { formatMoney } from '@/utils/formatters'
import type {
  Account,
  AccountStatus,
  AccountType,
} from '@/features/accounts/api/types'
import AccountModal from '@/features/accounts/components/AccountModal'
import {
  useAccountBalances,
  useAccounts,
  useArchiveAccount,
} from '@/features/accounts/hooks/useAccounts'

const accountTypeLabels = {
  CASH: 'Cash',
  CURRENT: 'Current account',
  SAVINGS: 'Savings',
  CREDIT_CARD: 'Credit card',
  INVESTMENT: 'Investment',
  OTHER: 'Other',
} satisfies Record<AccountType, string>

const accountTypeColours = {
  CASH: 'bg-success-soft text-success',
  CURRENT: 'bg-accent-soft text-accent',
  SAVINGS: 'bg-warning-soft text-warning',
  CREDIT_CARD: 'bg-danger-soft text-danger',
  INVESTMENT: 'bg-surface-strong text-primary',
  OTHER: 'bg-surface-muted text-muted',
} satisfies Record<AccountType, string>

const accountStatusOptions = [
  {
    value: 'ACTIVE',
    label: 'Active accounts',
  },
  {
    value: 'ARCHIVED',
    label: 'Archived',
  },
] satisfies Array<{
  value: AccountStatus
  label: string
}>

export default function AccountsPage() {
  const [status, setStatus] =
    useState<AccountStatus>('ACTIVE')

  const [
    isFormOpen,
    setIsFormOpen,
  ] = useState(false)

  const [
    editingAccount,
    setEditingAccount,
  ] = useState<Account | null>(null)

  const [
    archiveTarget,
    setArchiveTarget,
  ] = useState<Account | null>(null)

  const [
    archiveError,
    setArchiveError,
  ] = useState<string | null>(null)

  const accountsQuery =
    useAccounts(status)

  const balancesQuery =
    useAccountBalances()

  const archiveAccount =
    useArchiveAccount()

  const accounts =
    accountsQuery.data ?? []

  const balances =
    balancesQuery.data ?? []

  const balancesByAccountId =
    new Map(
      balances.map((balance) => [
        balance.accountId,
        balance,
      ]),
    )

  const loadError =
    accountsQuery.error ??
    balancesQuery.error

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

  function openEditForm(
    account: Account,
  ) {
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
        accountId:
          archiveTarget.id,
        payload: {
          version:
            archiveTarget.version,
        },
      })

      setArchiveTarget(null)
    } catch (error) {
      setArchiveError(
        error instanceof
        ApiClientError
          ? error.message
          : 'Unable to archive this account.',
      )
    }
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="The full picture"
        title="Your accounts"
        description="See where your money lives and how each account contributes to your overall position."
        actions={
          <>
            <RefreshButton
              isRefreshing={
                isRefreshing
              }
              onRefresh={
                refreshAccounts
              }
              label="Refresh accounts"
              iconOnly
            />

            <button
              type="button"
              onClick={openCreateForm}
              className="
                inline-flex
                cursor-pointer
                items-center
                gap-2
                rounded-full
                bg-primary
                px-5 py-3
                text-sm font-semibold
                text-inverse
                transition
                hover:bg-primary-hover
              "
            >
              <Plus
                size={18}
                aria-hidden
              />
              Add account
            </button>
          </>
        }
      />

      <div className="feature-reveal feature-reveal-delay-1 mt-10">
        <StatusTabs
          value={status}
          options={
            accountStatusOptions
          }
          onChange={setStatus}
          ariaLabel="Account status"
        />
      </div>

      {isPending && (
        <div
          className="
            feature-reveal
            feature-reveal-delay-2
            mt-8
            overflow-hidden
            rounded-2xl
            border border-line/50
            bg-surface
          "
        >
          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="
                  h-[84px]
                  animate-pulse
                  border-b border-line/50
                  bg-surface-muted/40
                  last:border-0
                "
              />
            ),
          )}
        </div>
      )}

      {loadError && (
        <ErrorPanel
          title="We couldn’t load your accounts"
          message={
            loadError instanceof
            ApiClientError
              ? loadError.message
              : 'Please try again.'
          }
          onRetry={() =>
            void refreshAccounts()
          }
          className="feature-reveal feature-reveal-delay-2 mt-8"
        />
      )}

      {!isPending &&
        !loadError &&
        accounts.length === 0 && (
          <EmptyState
            icon={
              <WalletCards
                size={22}
                aria-hidden
              />
            }
            title={
              status === 'ACTIVE'
                ? 'Your accounts will live here'
                : 'No archived accounts'
            }
            description={
              status === 'ACTIVE'
                ? 'Add your first account to begin tracking balances and building your net worth.'
                : 'Accounts you archive will remain available here for historical reporting.'
            }
            action={
              status ===
              'ACTIVE' ? (
                <button
                  type="button"
                  onClick={
                    openCreateForm
                  }
                  className="
                    mt-5
                    inline-flex
                    cursor-pointer
                    items-center
                    gap-2
                    rounded-full
                    bg-primary
                    px-5 py-2.5
                    text-sm font-semibold
                    text-inverse
                    transition
                    hover:bg-primary-hover
                  "
                >
                  <Plus
                    size={16}
                    aria-hidden
                  />
                  Add your first account
                </button>
              ) : undefined
            }
            variant="solid"
            className="feature-reveal feature-reveal-delay-2 mt-8"
          />
        )}

      {!isPending &&
        !loadError &&
        accounts.length > 0 && (
          <section
            className="
              feature-reveal
              feature-reveal-delay-2
              mt-8
              overflow-hidden
              rounded-2xl
              border border-line/50
              bg-surface
              shadow-[0_10px_30px_rgba(23,60,50,0.04)]
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-4
                border-b border-line/50
                px-5 py-4
                sm:px-6
              "
            >
              <div>
                <h2 className="text-sm font-semibold text-ink">
                  {status ===
                  'ACTIVE'
                    ? 'Active accounts'
                    : 'Archived accounts'}
                </h2>

                <p className="mt-0.5 text-xs text-subtle">
                  {accounts.length}{' '}
                  {accounts.length ===
                  1
                    ? 'account'
                    : 'accounts'}
                </p>
              </div>

              {isRefreshing && (
                <span className="text-xs font-medium text-muted">
                  Updating…
                </span>
              )}
            </div>

            <div>
              {accounts.map(
                (
                  account,
                  index,
                ) => {
                  const balance =
                    balancesByAccountId.get(
                      account.id,
                    )

                  const currentBalance =
                    balance
                      ?.currentBalance ??
                    account.openingBalance

                  return (
                    <article
                      key={account.id}
                      className={`
                        grid
                        gap-3
                        px-5 py-4
                        transition
                        hover:bg-surface-muted/35
                        sm:grid-cols-[minmax(0,1fr)_auto]
                        sm:items-center
                        sm:px-6
                        ${
                          index > 0
                            ? 'border-t border-line/50'
                            : ''
                        }
                      `}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`
                            grid size-10
                            shrink-0
                            place-items-center
                            rounded-xl
                            ${
                              accountTypeColours[
                                account
                                  .accountType
                              ]
                            }
                          `}
                        >
                          <Landmark
                            size={17}
                            aria-hidden
                          />
                        </span>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-sm font-semibold text-ink">
                              {
                                account.name
                              }
                            </h3>

                            {!account.includeInNetWorth && (
                              <span
                                className="
                                  rounded-full
                                  bg-surface-strong
                                  px-2 py-0.5
                                  text-[9px]
                                  font-semibold
                                  uppercase
                                  tracking-[0.08em]
                                  text-muted
                                "
                              >
                                Excluded from
                                net worth
                              </span>
                            )}
                          </div>

                          <p className="mt-1 truncate text-xs text-subtle">
                            {
                              accountTypeLabels[
                                account
                                  .accountType
                              ]
                            }
                            {' · '}
                            {
                              account.currencyCode
                            }
                            {' · '}
                            {balance
                              ?.postedTransactionCount ??
                              0}{' '}
                            transactions
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 pl-[52px] sm:justify-end sm:pl-0">
                        <div className="text-left sm:text-right">
                          <p className="text-sm font-semibold text-ink">
                            {formatMoney(
                              currentBalance,
                              account.currencyCode,
                            )}
                          </p>

                          <p className="mt-0.5 text-xs text-subtle">
                            Current balance
                          </p>
                        </div>

                        {status ===
                          'ACTIVE' && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(
                                  account,
                                )
                              }
                              className="
                                grid size-8
                                cursor-pointer
                                place-items-center
                                rounded-full
                                text-muted
                                transition
                                hover:bg-accent-soft
                                hover:text-accent
                              "
                              aria-label={`Edit ${account.name}`}
                              title={`Edit ${account.name}`}
                            >
                              <Pencil
                                size={15}
                                aria-hidden
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setArchiveError(
                                  null,
                                )

                                setArchiveTarget(
                                  account,
                                )
                              }}
                              className="
                                grid size-8
                                cursor-pointer
                                place-items-center
                                rounded-full
                                text-muted
                                transition
                                hover:bg-danger-soft
                                hover:text-danger
                              "
                              aria-label={`Archive ${account.name}`}
                              title={`Archive ${account.name}`}
                            >
                              <Archive
                                size={15}
                                aria-hidden
                              />
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  )
                },
              )}
            </div>
          </section>
        )}

      {isFormOpen && (
        <AccountModal
          key={
            editingAccount?.id ??
            'new-account'
          }
          account={
            editingAccount ??
            undefined
          }
          onClose={closeForm}
        />
      )}

      {archiveTarget && (
        <ConfirmationDialog
          title="Archive this account?"
          description={
            <>
              <strong className="text-ink">
                {archiveTarget.name}
              </strong>{' '}
              will be removed from
              your active accounts but
              retained for historical
              reporting.
            </>
          }
          icon={
            <Archive
              size={18}
              aria-hidden
            />
          }
          confirmLabel="Archive account"
          pendingLabel="Archiving…"
          cancelLabel="Cancel"
          isPending={
            archiveAccount.isPending
          }
          onConfirm={() =>
            void confirmArchive()
          }
          onClose={() =>
            setArchiveTarget(null)
          }
          variant="plain"
        >
          {archiveError && (
            <p
              className="
                mt-4
                rounded-xl
                bg-danger-soft
                p-3
                text-sm
                text-danger
              "
              role="alert"
            >
              {archiveError}
            </p>
          )}
        </ConfirmationDialog>
      )}
    </PageShell>
  )
}
