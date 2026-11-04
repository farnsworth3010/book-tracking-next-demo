import { act, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteBook, fetchBook, fetchBooks, updateBook, type Book } from '@/entities/book'
import { HttpError } from '@/shared/api'
import { makeBook } from '@/test/fixtures'
import { currentUrl, mockRouter, navigate } from '@/test/next-navigation'
import { renderWithProviders } from '@/test/render'
import { BookPage } from './BookPage'

vi.mock('@/entities/book/api/bookApi') // the fetch module only; the rest of the entity stays real

const dune = makeBook({ id: '1', title: 'Dune', status: 'reading' })
const emma = makeBook({ id: '2', title: 'Emma', author: 'Jane Austen', status: 'done', pages: 474 })

// A tiny in-memory backend, so refetches after a mutation see the saved data
let db: Book[]

beforeEach(() => {
  db = [dune, emma]
  vi.mocked(fetchBooks).mockImplementation(async () => db)
  vi.mocked(fetchBook).mockImplementation(async (id) => {
    const book = db.find((b) => b.id === id)
    if (!book) throw new HttpError(404, `GET /api/books/${id} failed: 404`)
    return book
  })
  vi.mocked(updateBook).mockImplementation(async (book) => {
    db = db.map((b) => (b.id === book.id ? book : b))
    return book
  })
  vi.mocked(deleteBook).mockImplementation(async (id) => {
    db = db.filter((b) => b.id !== id)
  })
})

describe('BookPage', () => {
  it('shows the book from the URL in the edit form', async () => {
    renderWithProviders(<BookPage />, { url: '/books/1', params: { id: '1' } })

    expect(await screen.findByRole('heading', { name: 'Dune' })).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toHaveValue('Dune')
    expect(screen.getByLabelText('Pages')).toHaveValue(412)
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveTextContent('Reading')
  })

  it('shows a not-found page for an unknown book', async () => {
    renderWithProviders(<BookPage />, { url: '/books/99', params: { id: '99' } })

    expect(await screen.findByRole('heading', { name: 'Book not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to books' })).toHaveAttribute('href', '/')
  })

  it('shows other errors as they are', async () => {
    vi.mocked(fetchBook).mockRejectedValue(new HttpError(500, 'GET /api/books/1 failed: 500'))

    renderWithProviders(<BookPage />, { url: '/books/1', params: { id: '1' } })

    expect(await screen.findByRole('alert')).toHaveTextContent('GET /api/books/1 failed: 500')
  })

  it('saves edits and shows the new title right away', async () => {
    const { user } = renderWithProviders(<BookPage />, { url: '/books/1', params: { id: '1' } })
    const title = await screen.findByLabelText('Title')

    await user.clear(title)
    await user.type(title, 'Dune Messiah')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByRole('heading', { name: 'Dune Messiah' })).toBeInTheDocument()
    expect(vi.mocked(updateBook).mock.calls[0][0]).toEqual({ ...dune, title: 'Dune Messiah' })
  })

  it('asks for confirmation before deleting, then returns to the list', async () => {
    const { user } = renderWithProviders(<BookPage />, { url: '/books/1', params: { id: '1' } })

    await user.click(await screen.findByRole('button', { name: 'Delete book' }))

    expect(deleteBook).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Confirm delete' }))

    await waitFor(() => expect(currentUrl().pathname).toBe('/'))
    expect(vi.mocked(deleteBook).mock.calls[0][0]).toBe('1')
    // replace, not push: the deleted book's page must not stay in history
    expect(mockRouter.replace).toHaveBeenCalledWith('/')
  })

  it('resets the form when switching to a book that is already cached', async () => {
    renderWithProviders(<BookPage />, { url: '/books/2', params: { id: '2' } })
    expect(await screen.findByLabelText('Title')).toHaveValue('Emma')

    act(() => navigate('/books/1', { id: '1' }))
    expect(await screen.findByRole('heading', { name: 'Dune' })).toBeInTheDocument()

    // Book 2 is cached, so the page renders it without a loading state in between
    act(() => navigate('/books/2', { id: '2' }))

    expect(await screen.findByRole('heading', { name: 'Emma' })).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toHaveValue('Emma')
  })
})
