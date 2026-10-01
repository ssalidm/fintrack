import FormDrawer from '@/components/ui/FormDrawer'
import type { SavingsGoal } from '@/features/goals/api/types'
import GoalForm from './GoalForm'

interface GoalModalProps {
  goal?: SavingsGoal
  onClose: () => void
}

export default function GoalModal({
  goal,
  onClose,
}: GoalModalProps) {
  return (
    <FormDrawer
      eyebrow={goal ? 'SHAPE THE PLAN' : 'A FUTURE WORTH FUNDING'}
      title={goal ? 'Edit your goal' : 'Create a goal'}
      description={
        goal
          ? 'Adjust the destination while keeping your progress intact.'
          : 'Give your savings a purpose and a finish line.'
      }
      onClose={onClose}
    >
      <GoalForm
        goal={goal}
        onCancel={onClose}
        onSuccess={onClose}
      />
    </FormDrawer>
  )
}