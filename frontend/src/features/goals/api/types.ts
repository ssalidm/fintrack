export type SavingsGoalStatus =
  | 'ACTIVE'
  | 'COMPLETED'
  | 'ARCHIVED'

export type GoalContributionStatus =
  | 'POSTED'
  | 'VOIDED'

export interface SavingsGoal {
  id: string
  name: string
  description: string | null
  currencyCode: string
  targetAmount: number
  currentAmount: number
  remainingAmount: number
  progressPercentage: number
  targetDate: string | null
  status: SavingsGoalStatus
  completedAt: string | null
  archivedAt: string | null
  createdAt: string
  updatedAt: string
  version: number
}

export interface GoalContribution {
  id: string
  goalId: string
  amount: number
  contributionDate: string
  note: string | null
  status: GoalContributionStatus
  voidedAt: string | null
  voidReason: string | null
  createdAt: string
  updatedAt: string
  version: number
}

export interface CreateSavingsGoalRequest {
  name: string
  description?: string
  currencyCode: string
  targetAmount: number
  targetDate?: string
}

export interface UpdateSavingsGoalRequest {
  version: number
  name: string
  description?: string
  targetAmount: number
  targetDate?: string
  clearTargetDate?: boolean
}

export interface GoalVersionRequest {
  version: number
}

export interface CreateGoalContributionRequest {
  amount: number
  contributionDate: string
  note?: string
}

export interface UpdateGoalContributionRequest {
  version: number
  amount?: number
  contributionDate?: string
  note?: string
}

export interface VoidGoalContributionRequest {
  version: number
  reason: string
}