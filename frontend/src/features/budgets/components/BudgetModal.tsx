import FormDrawer from '@/components/ui/FormDrawer'
import type { BudgetSummary } from '@/features/budgets/api/types'
import BudgetForm from './BudgetForm'

interface BudgetModalProps {
  budget?: BudgetSummary
  onClose: () => void
}

export default function BudgetModal({
  budget,
  onClose,
}: BudgetModalProps) {
  return (
    <FormDrawer
      eyebrow={budget ? 'REFINE THE PLAN' : 'SPEND WITH INTENTION'}
      title={budget ? 'Rename your budget' : 'Create a budget'}
      description={
        budget
          ? 'Give this monthly plan a name that still feels useful.'
          : 'Choose the month and currency first. Category limits come next.'
      }
      onClose={onClose}
    >
      <BudgetForm
        budget={budget}
        onCancel={onClose}
        onSuccess={onClose}
      />
    </FormDrawer>
  )
}