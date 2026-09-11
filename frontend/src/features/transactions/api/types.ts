export type ManualTransactionType = 'INCOME' | 'EXPENSE'

export type TransactionType =
  | ManualTransactionType
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'

export type TransactionStatus = 'POSTED' | 'VOIDED'

export interface Transaction {
  id: string
  accountId: string
  categoryId: string | null
  transferId: string | null
  transactionType: TransactionType
  amount: number
  transactionDate: string
  description: string | null
  merchantName: string | null
  status: TransactionStatus
  voidedAt: string | null
  voidReason: string | null
  recurringTransactionId: string | null
  recurrenceDueDate: string | null
  createdAt: string
  updatedAt: string
  version: number
}

export interface TransactionFilters {
  accountId?: string
  categoryId?: string
  type?: TransactionType
  status: TransactionStatus
  fromDate?: string
  toDate?: string
  page: number
  size: number
}

export interface CreateTransactionRequest {
  accountId: string
  categoryId: string
  transactionType: ManualTransactionType
  amount: number
  transactionDate: string
  description?: string
  merchantName?: string
}

export interface UpdateTransactionRequest {
  version: number
  accountId?: string
  categoryId?: string
  transactionType?: ManualTransactionType
  amount?: number
  transactionDate?: string
  description?: string
  merchantName?: string
}

export interface VoidTransactionRequest {
  version: number
  reason: string
}
