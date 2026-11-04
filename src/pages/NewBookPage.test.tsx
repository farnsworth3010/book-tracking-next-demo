import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createBook, fetchBooks } from '@/features/books/api'
import { renderRoute } from '@/test/renderRoute'

vi.mock('@/features/books/api')

beforeEach(() => {
  vi.mocked(fetchBooks).mockResolvedValue([])
  vi.mocked(createBook).mockImplementation(async (input) => ({ ...input, id: '42' }))
})

async function fillValidBook(user: ReturnType<typeof renderRoute>['user']) {
  await user.type(await screen.findByLabelText('Title'), '  Dune ')
  await user.type(screen.getByLabelText('Author'), 'Frank Herbert')
  await user.type(screen.getByLabelText('Pages'), '412')
  await user.type(screen.getByLabelText('Notes'), 'Classic')
}

describe('NewBookPage', () => {
  it('is reachable from the header', async () => {
    const { router, user } = renderRoute('/')

    await user.click(screen.getByRole('link', { name: 'Add book' }))

    expect(router.state.location.pathname).toBe('/books/new')
    expect(await screen.findByRole('heading', { name: 'Add a book' })).toBeInTheDocument()
  })

  it('shows field errors and does not submit invalid input', async () => {
    const { user } = renderRoute('/books/new')

    await user.click(await screen.findByRole('button', { name: 'Save book' }))

    expect(await screen.findByText('Title is required')).toBeInTheDocument()
    expect(screen.getByText('Author is required')).toBeInTheDocument()
    expect(screen.getByText('Enter a number')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toHaveAttribute('aria-invalid', 'true')
    expect(createBook).not.toHaveBeenCalled()
  })

  it('creates the book with the default status and goes back to the list', async () => {
    const { router, user } = renderRoute('/books/new')

    expect(await screen.findByRole('combobox', { name: 'Status' })).toHaveTextContent('Want to read')

    await fillValidBook(user)
    await user.click(screen.getByRole('button', { name: 'Save book' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(vi.mocked(createBook).mock.calls[0][0]).toEqual({
      title: 'Dune',
      author: 'Frank Herbert',
      status: 'want',
      pages: 412,
      notes: 'Classic',
    })
  })

  it('shows the server error and stays on the form', async () => {
    vi.mocked(createBook).mockRejectedValue(new Error('POST /api/books failed: 500'))
    const { router, user } = renderRoute('/books/new')

    await fillValidBook(user)
    await user.click(screen.getByRole('button', { name: 'Save book' }))

    expect(await screen.findByText('POST /api/books failed: 500')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/books/new')
  })
})
