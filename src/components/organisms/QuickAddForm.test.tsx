import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createBook, fetchBooks } from '@/services/books/api'
import { makeBook } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'
import { BooksPage } from '@/views/BooksPage'

vi.mock('@/services/books/api')

beforeEach(() => {
  vi.mocked(fetchBooks).mockResolvedValue([])
  vi.mocked(createBook).mockImplementation(async (input) => ({ ...input, id: '42' }))
})

describe('QuickAddForm (TanStack Form)', () => {
  it('validates with the zod schema before submitting', async () => {
    const { user } = renderWithProviders(<BooksPage />)

    await user.click(screen.getByRole('button', { name: 'Quick add' }))

    expect(await screen.findByText('Title is required')).toBeInTheDocument()
    expect(screen.getByText('Author is required')).toBeInTheDocument()
    expect(screen.getByText('Must be greater than 0')).toBeInTheDocument()
    expect(createBook).not.toHaveBeenCalled()
  })

  it('adds a book, clears the form and refreshes the list', async () => {
    vi.mocked(fetchBooks).mockResolvedValueOnce([]).mockResolvedValue([makeBook({ id: '42', title: 'Dune' })])
    const { user } = renderWithProviders(<BooksPage />)
    await screen.findByText('No books here yet.')

    await user.type(screen.getByLabelText('Title'), 'Dune')
    await user.type(screen.getByLabelText('Author'), 'Frank Herbert')
    await user.type(screen.getByLabelText('Pages'), '412')
    await user.click(screen.getByRole('button', { name: 'Quick add' }))

    expect(await screen.findByRole('link', { name: /Dune/ })).toBeInTheDocument()
    expect(vi.mocked(createBook).mock.calls[0][0]).toEqual({
      title: 'Dune',
      author: 'Frank Herbert',
      pages: 412,
      status: 'want',
      notes: '',
    })
    expect(fetchBooks).toHaveBeenCalledTimes(2)
    expect(screen.getByLabelText('Title')).toHaveValue('')
  })
})
