export type AccountType =
  | 'CASH'
  | 'CURRENT'
  | 'SAVINGS'
  | 'CREDIT_CARD'
  | 'INVESTMENT'
  | 'OTHER'

export type AccountStatus = 'ACTIVE' | 'ARCHIVED'

export interface Account {
  id: string
  name: string
  accountType: AccountType
  currencyCode: string
  openingBalance: number
  status: AccountStatus
  includeInNetWorth: boolean
  archivedAt: string | null
  createdAt: string
  updatedAt: string
  version: number
}

export interface AccountBalance {
  accountId: string
  accountName: string
  accountType: AccountType
  currencyCode: string
  openingBalance: number
  transactionTotal: number
  currentBalance: number
  postedTransactionCount: number
  includeInNetWorth: boolean
  status: AccountStatus
  createdAt: string
  updatedAt: string
}

export interface CreateAccountRequest {
  name: string
  accountType: AccountType
  currencyCode: string
  openingBalance?: number
  includeInNetWorth?: boolean
}

export interface UpdateAccountRequest {
  version: number
  name?: string
  accountType?: AccountType
  openingBalance?: number
  includeInNetWorth?: boolean
}

export interface ArchiveAccountRequest {
  version: number
}
