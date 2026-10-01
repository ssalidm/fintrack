import { StrictMode } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import FormDrawer from './FormDrawer'

// jsdom does not implement modal focus handling or the browser's top layer.
// These mocks let us test our event handling and lifecycle separately.
const originalMethods = Object.getOwnPropertyDescriptors(
  HTMLDialogElement.prototype,
)

beforeEach(() => {
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.setAttribute('open', '')
      },
    },
    close: {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.removeAttribute('open')
      },
    },
  })
})

afterEach(() => {
  cleanup()

  for (const method of ['showModal', 'close']) {
    const original = originalMethods[method]

    if (original) {
      Object.defineProperty(HTMLDialogElement.prototype, method, original)
    } else {
      Reflect.deleteProperty(HTMLDialogElement.prototype, method)
    }
  }
})

function drawer(onClose = vi.fn()) {
  return (
    <FormDrawer
      eyebrow="A NEW ENTRY"
      title="Record a transaction"
      description="Keep your financial picture accurate and current."
      onClose={onClose}
    >
      <label>
        Description
        <input name="description" />
      </label>
    </FormDrawer>
  )
}

describe('FormDrawer', () => {
  it('renders a named dialog outside its page container', () => {
    const { container } = render(drawer())
    const dialog = screen.getByRole('dialog', {
      name: 'Record a transaction',
    })

    expect(dialog).toHaveAccessibleDescription(
      'Keep your financial picture accurate and current.',
    )
    expect(dialog.parentElement).toBe(document.body)
    expect(container).not.toContainElement(dialog)
    expect(
      screen.getByRole('textbox', { name: 'Description' }),
    ).toBeVisible()
  })

  it('closes through the close button and a backdrop click', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(drawer(onClose))

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('dialog'))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('keeps the drawer open for form interactions and drags from the form', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(drawer(onClose))
    const input = screen.getByRole('textbox')

    await user.type(input, 'Groceries')
    fireEvent.pointerDown(input)
    fireEvent.click(screen.getByRole('dialog'))

    expect(input).toHaveValue('Groceries')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('delegates native Escape cancellation to the current close callback', () => {
    const oldClose = vi.fn()
    const onClose = vi.fn()
    const { rerender } = render(drawer(oldClose))
    rerender(drawer(onClose))

    const event = new Event('cancel', { cancelable: true })
    fireEvent(screen.getByRole('dialog'), event)

    expect(event.defaultPrevented).toBe(true)
    expect(onClose).toHaveBeenCalledOnce()
    expect(oldClose).not.toHaveBeenCalled()
  })

  it('restores the previous scroll setting when unmounted in StrictMode', () => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'auto'

    try {
      const { unmount } = render(
        <StrictMode>{drawer()}</StrictMode>,
      )
      const dialog = screen.getByRole('dialog')

      expect(dialog).toHaveAttribute('open')
      expect(document.body.style.overflow).toBe('hidden')

      unmount()

      expect(dialog).not.toHaveAttribute('open')
      expect(document.body.style.overflow).toBe('auto')
    } finally {
      document.body.style.overflow = previousOverflow
    }
  })
})