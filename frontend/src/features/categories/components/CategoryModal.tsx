import FormDrawer from '@/components/ui/FormDrawer'
import type { Category } from '@/features/categories/api/types'
import CategoryForm from './CategoryForm'

interface CategoryModalProps {
  category?: Category | null
  isOpen: boolean
  onClose: () => void
}

export default function CategoryModal({
  category,
  isOpen,
  onClose,
}: CategoryModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <FormDrawer
      eyebrow="MONEY ORGANISATION"
      title={
        category
          ? 'Edit category'
          : 'New category'
      }
      description={
        category
          ? 'Update how this category appears across Salif.'
          : 'Create a category that reflects how you use your money.'
      }
      onClose={onClose}
    >
      <CategoryForm
        category={category}
        onCancel={onClose}
        onSuccess={onClose}
      />
    </FormDrawer>
  )
}
