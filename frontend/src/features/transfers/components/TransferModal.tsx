import FormDrawer from '../../../components/ui/FormDrawer'
import TransferForm from './TransferForm'

interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TransferModal({
  isOpen,
  onClose,
}: TransferModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <FormDrawer
      eyebrow="MOVE MONEY"
      title="New transfer"
      description="Move money between two accounts using the same currency."
      onClose={onClose}
    >
      <TransferForm
        onSuccess={onClose}
        onCancel={onClose}
      />
    </FormDrawer>
  )
}
