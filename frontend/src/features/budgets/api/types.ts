export type BudgetStatus =
  | 'ACTIVE'
  | 'ARCHIVED'

export interface BudgetSummary {
  id: string
  name: string
  budgetMonth: string
  currencyCode: string
  status: BudgetStatus
  archivedAt: string | null
  createdAt: string
  updatedAt: string
  version: number
}

export interface BudgetCategoryLimit {
  id: string
  categoryId: string
  limitAmount: number
  createdAt: string
  updatedAt: string
  version: number
}

export interface Budget
  extends BudgetSummary {
  limits: BudgetCategoryLimit[]
}

export interface BudgetCategoryPerformance {
  budgetLimitId: string
  categoryId: string
  categoryName: string
  limitAmount: number
  spentAmount: number
  remainingAmount: number
  utilizationPercentage: number
  exceeded: boolean
}

export interface BudgetPerformance {
  budgetId: string
  budgetName: string | null
  budgetMonth: string | null
  currencyCode: string | null
  status: BudgetStatus | null
  totalLimitAmount: number
  totalSpentAmount: number
  totalRemainingAmount: number
  utilizationPercentage: number
  anyCategoryExceeded: boolean
  categories: BudgetCategoryPerformance[]
}

export interface CreateBudgetRequest {
  name: string
  budgetMonth: string
  currencyCode: string
}

export interface UpdateBudgetRequest {
  version: number
  name: string
}

export interface BudgetVersionRequest {
  version: number
}

export interface CreateBudgetLimitRequest {
  categoryId: string
  limitAmount: number
}

export interface UpdateBudgetLimitRequest {
  version: number
  categoryId?: string
  limitAmount?: number
}