import { act, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteBook, fetchBook, fetchBooks, updateBook } from '@/features/books/api'
import type { Book } from '@/features/books/schema'
import { makeBook } from '@/test/fixtures'
import { renderRoute } from '@/test/renderRoute'

vi.mock('@/features/books/api')

const dune = makeBook({ id: '1', title: 'Dune', status: 'reading' })
const emma = makeBook({ id: '2', title: 'Emma', author: 'Jane Austen', status: 'done', pages: 474 })

// A tiny in-memory backend, so refetches after a mutation see the saved data
let db: Book[]

beforeEach(() => {
  db = [dune, emma]
  vi.mocked(fetchBooks).mockImplementation(async () => db)
  vi.mocked(fetchBook).mockImplementation(async (id) => {
    const book = db.find((b) => b.id === id)
    if (!book) throw new Error(`GET /api/books/${id} failed: 404`)
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
  it('opens from the list and shows the book in the edit form', async () => {
    const { router, user } = renderRoute('/')

    await user.click(await screen.findByRole('link', { name: 'Dune' }))

    expect(router.state.location.pathname).toBe('/books/1')
    expect(await screen.findByRole('heading', { name: 'Dune' })).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toHaveValue('Dune')
    expect(screen.getByLabelText('Pages')).toHaveValue(412)
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveTextContent('Reading')
  })

  it('shows the error for an unknown book', async () => {
    renderRoute('/books/99')

    expect(await screen.findByRole('alert')).toHaveTextContent('GET /api/books/99 failed: 404')
  })

  it('saves edits and shows the new title right away', async () => {
    const { user } = renderRoute('/books/1')
    const title = await screen.findByLabelText('Title')

    await user.clear(title)
    await user.type(title, 'Dune Messiah')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByRole('heading', { name: 'Dune Messiah' })).toBeInTheDocument()
    expect(vi.mocked(updateBook).mock.calls[0][0]).toEqual({ ...dune, title: 'Dune Messiah' })
  })

  it('asks for confirmation before deleting, then returns to the list', async () => {
    const { router, user } = renderRoute('/books/1')

    await user.click(await screen.findByRole('button', { name: 'Delete book' }))

    expect(deleteBook).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Confirm delete' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(vi.mocked(deleteBook).mock.calls[0][0]).toBe('1')
    expect(await screen.findByRole('link', { name: 'Emma' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Dune' })).not.toBeInTheDocument()
  })

  it('resets the form when switching to a book that is already cached', async () => {
    const { router } = renderRoute('/books/2')
    expect(await screen.findByLabelText('Title')).toHaveValue('Emma')

    await act(() => router.navigate('/books/1'))
    expect(await screen.findByRole('heading', { name: 'Dune' })).toBeInTheDocument()

    // Book 2 is cached, so the page renders it without a loading state in between
    await act(() => router.navigate('/books/2'))

    expect(await screen.findByRole('heading', { name: 'Emma' })).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toHaveValue('Emma')
  })
})
