export type TransferStatus = 'POSTED' | 'VOIDED'

export interface Transfer {
  id: string
  sourceAccountId: string
  destinationAccountId: string
  amount: number
  transactionDate: string
  description: string | null
  status: TransferStatus
  voidedAt: string | null
  voidReason: string | null
  createdAt: string
  updatedAt: string
  version: number
}

export interface TransferFilters {
  sourceAccountId?: string
  destinationAccountId?: string
  status: TransferStatus
  fromDate?: string
  toDate?: string
  page: number
  size: number
}

export interface CreateTransferRequest {
  sourceAccountId: string
  destinationAccountId: string
  amount: number
  transactionDate: string
  description?: string
}

export interface VoidTransferRequest {
  version: number
  reason: string
}