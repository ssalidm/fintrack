import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { Category } from '../api/types'
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
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#0d2e27]/45 px-4 py-8 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-modal-title"
        className="w-full max-w-xl rounded-[1.75rem] border border-[#dedbd2] bg-[#fbfaf6] shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-[#e2ded4] px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d7974]">
              Money organisation
            </p>

            <h2
              id="category-modal-title"
              className="mt-2 font-serif text-3xl text-[#173c32]"
            >
              {category ? 'Edit category' : 'New category'}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#69756f]">
              {category
                ? 'Update how this category appears across Salif.'
                : 'Create a category that reflects how you use your money.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-2 text-[#5f706a] transition hover:bg-[#ece9e0] hover:text-[#173c32]"
            aria-label="Close category form"
          >
            <X size={21} />
          </button>
        </header>

        <div className="px-6 py-6 sm:px-8">
          <CategoryForm
            category={category}
            onCancel={onClose}
            onSuccess={onClose}
          />
        </div>
      </section>
    </div>
  )
}
