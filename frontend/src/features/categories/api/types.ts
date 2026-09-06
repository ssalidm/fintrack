export type CategoryType = 'INCOME' | 'EXPENSE'

export type CategoryStatus = 'ACTIVE' | 'ARCHIVED'

export interface Category {
  id: string
  templateCode: string | null
  name: string
  categoryType: CategoryType
  status: CategoryStatus
  displayOrder: number
  archivedAt: string | null
  createdAt: string
  updatedAt: string
  version: number
}

export interface CreateCategoryRequest {
  name: string
  categoryType: CategoryType
  displayOrder?: number
}

export interface UpdateCategoryRequest {
  version: number
  name?: string
  categoryType?: CategoryType
  displayOrder?: number
}

export interface ArchiveCategoryRequest {
  version: number
}

export interface MonthlyCategorySpending {
  currencyCode: string
  monthStart: string
  categoryId: string
  categoryName: string
  spentAmount: number
  transactionCount: number
}
