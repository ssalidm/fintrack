import FormDrawer from '@/components/ui/FormDrawer'
import type { RecurringTransaction } from '@/features/recurring/api/types'
import RecurringTransactionForm from './RecurringTransactionForm'

interface RecurringTransactionModalProps {
  isOpen: boolean
  schedule?: RecurringTransaction | null
  onClose: () => void
}

export default function RecurringTransactionModal({
  isOpen,
  schedule,
  onClose,
}: RecurringTransactionModalProps) {
  if (!isOpen) {
    return null
  }

  const isEditMode =
    Boolean(schedule)

  return (
    <FormDrawer
      eyebrow={
        isEditMode
          ? 'UPDATE SCHEDULE'
          : 'PLAN AHEAD'
      }
      title={
        isEditMode
          ? 'Edit recurring transaction'
          : 'New recurring transaction'
      }
      description={
        isEditMode
          ? 'Update how and when this activity repeats.'
          : 'Create a repeating income or expense schedule.'
      }
      onClose={onClose}
    >
      <RecurringTransactionForm
        schedule={schedule}
        onSuccess={onClose}
        onCancel={onClose}
      />
    </FormDrawer>
  )
}
