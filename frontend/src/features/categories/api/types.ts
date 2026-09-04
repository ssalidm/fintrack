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
