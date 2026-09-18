import FormDrawer from '../../../components/ui/FormDrawer'
import type { Transaction } from '../api/types'
import TransactionForm from './TransactionForm'

interface TransactionModalProps {
  transaction?: Transaction
  onClose: () => void
}

export default function TransactionModal({
  transaction,
  onClose,
}: TransactionModalProps) {
  return (
    <FormDrawer
      eyebrow={transaction ? 'MONEY MOVEMENT' : 'A NEW ENTRY'}
      title={transaction ? 'Edit transaction' : 'Record a transaction'}
      description="Keep your financial picture accurate and current."
      onClose={onClose}
    >
      <TransactionForm
        transaction={transaction}
        onCancel={onClose}
        onSuccess={onClose}
      />
    </FormDrawer>
  )
}