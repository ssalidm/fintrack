import FormDrawer from '@/components/ui/FormDrawer'
import type { Account } from '@/features/accounts/api/types'
import AccountForm from './AccountForm'

interface AccountModalProps {
  account?: Account
  onClose: () => void
}

export default function AccountModal({
  account,
  onClose,
}: AccountModalProps) {
  return (
    <FormDrawer
      eyebrow={account ? 'ACCOUNT DETAILS' : 'A NEW BEGINNING'}
      title={account ? 'Edit account' : 'Add an account'}
      description={
        account
          ? 'Update how this account appears and contributes to your financial picture.'
          : 'Tell Salif where this money lives.'
      }
      onClose={onClose}
    >
      <AccountForm
        account={account}
        onCancel={onClose}
        onSuccess={onClose}
      />
    </FormDrawer>
  )
}