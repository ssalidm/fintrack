import FormDrawer from '../../../components/ui/FormDrawer'
import type { BudgetCategoryLimit } from '../api/types'
import BudgetLimitForm from './BudgetLimitForm'

interface BudgetLimitModalProps {
  budgetId: string
  currencyCode: string
  limit?: BudgetCategoryLimit
  categoryName?: string
  unavailableCategoryIds?: string[]
  onClose: () => void
}

export default function BudgetLimitModal({
  budgetId,
  currencyCode,
  limit,
  categoryName,
  unavailableCategoryIds,
  onClose,
}: BudgetLimitModalProps) {
  return (
    <FormDrawer
      eyebrow={
        limit
          ? 'ADJUST THE BOUNDARY'
          : 'GIVE EACH RAND A ROLE'
      }
      title={
        limit
          ? 'Edit category limit'
          : 'Add a category limit'
      }
      description={
        limit
          ? 'Adjust the amount as the month changes.'
          : 'Set a useful guide—not a punishment—for one spending category.'
      }
      onClose={onClose}
    >
      <BudgetLimitForm
        budgetId={budgetId}
        currencyCode={
          currencyCode
        }
        limit={limit}
        categoryName={
          categoryName
        }
        unavailableCategoryIds={
          unavailableCategoryIds
        }
        onCancel={onClose}
        onSuccess={onClose}
      />
    </FormDrawer>
  )
}
