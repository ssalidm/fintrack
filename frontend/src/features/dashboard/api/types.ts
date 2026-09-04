export type RecurringTransactionType = 'INCOME' | 'EXPENSE'

export type RecurringFrequency =
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'YEARLY'

export interface NetWorthSummary {
  currencyCode: string
  netWorth: number
  includeAccountCount: number
  activeAccountCount: number
  archiveAccountCount: number
}

export interface MonthlyCashFlow {
  currencyCode: string
  monthStart: string
  totalIncome: number
  totalExpenses: number
  netCashFlow: number
}

export interface RecurringTransactionDue {
  recurringTransactionId: string
  name: string
  transactionType: RecurringTransactionType
  amount: number
  frequency: RecurringFrequency
  intervalCount: number
  nextDueDate: string
  daysOverdue: number
  autoPost: boolean
  accountId: string
  accountName: string
  currencyCode: string
  categoryId: string | null
  categoryName: string | null
}

export interface DashboardSummary {
  asOfDate: string
  totalAccountCount: number
  activeAccountCount: number
  archivedAccountCount: number
  netWorthByCurrency: NetWorthSummary[]
  currentMonthCashFlow: MonthlyCashFlow[]
  dueRecurringTransactionCount: number
  dueRecurringTransactions: RecurringTransactionDue[]
}
