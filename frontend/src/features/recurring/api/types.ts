import type {Transaction} from '../../transactions/api/types'

export type RecurringTransactionType =
  | 'INCOME'
  | 'EXPENSE'

export type RecurringFrequency =
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'YEARLY'

export type RecurringTransactionStatus =
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'ARCHIVED'

export type RecurringCatchUpMode =
  | 'GENERATE_MISSED'
  | 'START_FROM_CURRENT'

export interface RecurringTransaction {
  id: string
  accountId: string
  categoryId: string
  name: string
  transactionType: RecurringTransactionType
  amount: number
  description: string | null
  merchantName: string | null
  frequency: RecurringFrequency
  intervalCount: number
  startDate: string
  nextDueDate: string | null
  endDate: string | null
  lastGeneratedDate: string | null
  autoPost: boolean
  status: RecurringTransactionStatus
  completedAt: string | null
  archivedAt: string | null
  createdAt: string
  updatedAt: string
  version: number
}

export interface CreateRecurringTransactionRequest {
  accountId: string
  categoryId: string
  name: string
  transactionType: RecurringTransactionType
  amount: number
  description?: string
  merchantName?: string
  frequency: RecurringFrequency
  intervalCount: number
  startDate: string
  endDate?: string
  autoPost: boolean
  catchUpMode: RecurringCatchUpMode
}

export interface UpdateRecurringTransactionRequest {
  version: number
  accountId?: string
  categoryId?: string
  name?: string
  transactionType?: RecurringTransactionType
  amount?: number
  description?: string
  merchantName?: string
  frequency?: RecurringFrequency
  intervalCount?: number
  endDate?: string
  clearEndDate?: boolean
  autoPost?: boolean
}

export interface RecurringTransactionVersionRequest {
  version: number
}

export interface RecurringTransactionOccurrence {
  schedule: RecurringTransaction
  transaction: Transaction
}