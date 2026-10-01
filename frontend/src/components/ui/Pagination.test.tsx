import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Pagination from './Pagination'

describe('Pagination', () => {
  it('does not render controls for an empty result', () => {
    render(
      <Pagination page={0} totalPages={0} onPageChange={vi.fn()} />,
    )

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('disables both directions for a single page', () => {
    render(
      <Pagination page={0} totalPages={1} onPageChange={vi.fn()} />,
    )

    expect(screen.getByText('Page 1 of 1')).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Previous page' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Next page' }),
    ).toBeDisabled()
  })

  it('displays one-based pages but sends zero-based page indexes', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    render(
      <Pagination page={2} totalPages={8} onPageChange={onPageChange} />,
    )

    expect(screen.getByText('Page 3 of 8')).toBeVisible()

    await user.click(
      screen.getByRole('button', { name: 'Previous page' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Next page' }),
    )

    expect(onPageChange.mock.calls).toEqual([[1], [3]])
  })

  it.each([
    { page: 0, labels: ['1', '2', '3', '4', '5'] },
    { page: 4, labels: ['3', '4', '5', '6', '7'] },
    { page: 9, labels: ['6', '7', '8', '9', '10'] },
  ])('shows a bounded page window at index $page', ({ page, labels }) => {
    render(
      <Pagination
        page={page}
        totalPages={10}
        onPageChange={vi.fn()}
        showPageNumbers
      />,
    )

    const buttons = screen.getAllByRole('button', {
      name: /^Page \d+$/,
    })

    expect(buttons.map((button) => button.textContent)).toEqual(labels)

    expect(
      screen.getByRole('button', { name: `Page ${page + 1}` }),
    ).toHaveAttribute('aria-current', 'page')

    if (page === 0) {
      expect(
        screen.getByRole('button', { name: 'Previous page' }),
      ).toBeDisabled()
    }

    if (page === 9) {
      expect(
        screen.getByRole('button', { name: 'Next page' }),
      ).toBeDisabled()
    }
  })

  it('supports direct page selection without reselecting the current page', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    render(
      <Pagination
        page={0}
        totalPages={3}
        onPageChange={onPageChange}
        showPageNumbers
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Page 1' }))
    expect(onPageChange).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Page 3' }))
    expect(onPageChange).toHaveBeenCalledExactlyOnceWith(2)
  })

  it('blocks navigation while fetching and enables it afterward', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    const props = {
      page: 1,
      totalPages: 3,
      onPageChange,
      showPageNumbers: true,
    }

    const { rerender } = render(
      <Pagination {...props} isFetching />,
    )

    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled()
      await user.click(button)
    }

    expect(onPageChange).not.toHaveBeenCalled()

    rerender(<Pagination {...props} />)

    await user.click(
      screen.getByRole('button', { name: 'Next page' }),
    )

    expect(onPageChange).toHaveBeenCalledExactlyOnceWith(2)
  })

  it('can return to a valid page if the result shrinks', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    render(
      <Pagination page={4} totalPages={2} onPageChange={onPageChange} />,
    )

    expect(screen.getByText('Choose an available page')).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Next page' }),
    ).toBeDisabled()

    await user.click(
      screen.getByRole('button', { name: 'Previous page' }),
    )

    expect(onPageChange).toHaveBeenCalledExactlyOnceWith(1)
  })

  it('uses the feature-specific label and result summary', () => {
    render(
      <Pagination
        page={1}
        totalPages={3}
        onPageChange={vi.fn()}
        label="Contribution history pages"
        summary="Showing 6–10 of 12"
      />,
    )

    expect(
      screen.getByRole('navigation', {
        name: 'Contribution history pages',
      }),
    ).toHaveTextContent('Showing 6–10 of 12')
  })
})