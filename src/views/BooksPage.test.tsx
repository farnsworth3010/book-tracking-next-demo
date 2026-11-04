import { screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchBooks, updateBook } from '@/services/booksApi'
import type { Book } from '@/schemas/book'
import { selectBooksView } from '@/stores/uiSlice'
import { deferred, makeBook } from '@/test/fixtures'
import { ViewToggle } from '@/components/ViewToggle'
import { currentUrl } from '@/test/next-navigation'
import { renderWithProviders } from '@/test/render'
import { BooksPage } from './BooksPage'

vi.mock('@/services/booksApi')

const books = [
  makeBook({ id: '1', title: 'Dune', author: 'Frank Herbert', status: 'reading' }),
  makeBook({ id: '2', title: 'Emma', author: 'Jane Austen', status: 'done', pages: 474 }),
]

beforeEach(() => {
  vi.mocked(fetchBooks).mockResolvedValue(books)
})

describe('BooksPage', () => {
  it('shows a loading state, then a card per book with a link to its page', async () => {
    renderWithProviders(<BooksPage />, { url: '/' })

    expect(screen.getByText('Loading books…')).toBeInTheDocument()

    const dune = await screen.findByRole('link', { name: 'Dune' })
    const card = within(dune.closest('li')!)

    expect(dune).toHaveAttribute('href', '/books/1')
    expect(card.getByText('Frank Herbert')).toBeInTheDocument()
    expect(card.getByRole('combobox', { name: 'Status of Dune' })).toHaveValue('reading')
    expect(screen.getByText('474 pages')).toBeInTheDocument()
    expect(fetchBooks).toHaveBeenCalledWith(undefined)
  })

  it('loads the status from the URL and marks its filter as pressed', async () => {
    renderWithProviders(<BooksPage />, { url: '/?status=done' })

    await screen.findByText('Dune')

    expect(fetchBooks).toHaveBeenCalledWith('done')
    expect(screen.getByRole('button', { name: 'Done' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('ignores an unknown status in the URL', async () => {
    renderWithProviders(<BooksPage />, { url: '/?status=lost' })

    await screen.findByText('Dune')

    expect(fetchBooks).toHaveBeenCalledWith(undefined)
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('writes the chosen filter to the URL and refetches', async () => {
    const { user } = renderWithProviders(<BooksPage />, { url: '/' })
    await screen.findByText('Dune')

    await user.click(screen.getByRole('button', { name: 'Reading' }))

    expect(currentUrl().search).toBe('?status=reading')
    await waitFor(() => expect(fetchBooks).toHaveBeenLastCalledWith('reading'))

    await user.click(screen.getByRole('button', { name: 'All' }))

    expect(currentUrl().search).toBe('')
  })

  it('shows an empty state', async () => {
    vi.mocked(fetchBooks).mockResolvedValue([])

    renderWithProviders(<BooksPage />, { url: '/' })

    expect(await screen.findByText('No books here yet.')).toBeInTheDocument()
  })

  it('shows the error when loading fails', async () => {
    vi.mocked(fetchBooks).mockRejectedValue(new Error('GET /api/books failed: 500'))

    renderWithProviders(<BooksPage />, { url: '/' })

    expect(await screen.findByRole('alert')).toHaveTextContent('GET /api/books failed: 500')
  })

  it('switches between grid and list through the store', async () => {
    const { store, user } = renderWithProviders(
      <>
        <ViewToggle />
        <BooksPage />
      </>,
    )
    const list = await screen.findByRole('list', { name: 'Books' })

    expect(list).toHaveAttribute('data-view', 'grid')

    await user.click(screen.getByRole('button', { name: 'List view' }))

    expect(selectBooksView(store.getState())).toBe('list')
    expect(list).toHaveAttribute('data-view', 'list')
    expect(screen.getByRole('button', { name: 'List view' })).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('status change on a card (optimistic update)', () => {
  it('shows the new status before the server answers, then refetches', async () => {
    const save = deferred<Book>()
    vi.mocked(updateBook).mockReturnValue(save.promise)
    const { user } = renderWithProviders(<BooksPage />, { url: '/' })
    const status = await screen.findByRole('combobox', { name: 'Status of Dune' })

    await user.selectOptions(status, 'done')

    // The request is still pending: the new value can only come from the optimistic cache write
    await waitFor(() => expect(status).toHaveValue('done'))
    expect(vi.mocked(updateBook).mock.calls[0][0]).toEqual({ ...books[0], status: 'done' })

    vi.mocked(fetchBooks).mockResolvedValue([{ ...books[0], status: 'done' }, books[1]])
    save.resolve({ ...books[0], status: 'done' })

    await waitFor(() => expect(fetchBooks).toHaveBeenCalledTimes(2))
    expect(status).toHaveValue('done')
  })

  it('rolls back and explains when the server rejects', async () => {
    const save = deferred<Book>()
    vi.mocked(updateBook).mockReturnValue(save.promise)
    const { user } = renderWithProviders(<BooksPage />, { url: '/' })
    const status = await screen.findByRole('combobox', { name: 'Status of Dune' })

    await user.selectOptions(status, 'done')
    await waitFor(() => expect(status).toHaveValue('done'))

    // Hold the follow-up refetch: while it is pending, only the rollback can restore the old value
    const refetch = deferred<Book[]>()
    vi.mocked(fetchBooks).mockReturnValue(refetch.promise)
    save.reject(new Error('PUT /api/books/1 failed: 500'))

    await waitFor(() => expect(status).toHaveValue('reading'))

    // onSettled returns the invalidation, so the mutation reports its error once the refetch is done
    refetch.resolve(books)

    expect(await screen.findByRole('alert')).toHaveTextContent('PUT /api/books/1 failed: 500')
    expect(status).toHaveValue('reading')
  })
})

describe('loading and errors', () => {
  it('keeps the previous list on screen, marked busy, while another filter loads', async () => {
    const { user } = renderWithProviders(<BooksPage />, { url: '/' })
    await screen.findByText('Dune')
    const next = deferred<Book[]>()
    vi.mocked(fetchBooks).mockReturnValue(next.promise)

    await user.click(screen.getByRole('button', { name: 'Done' }))

    expect(screen.queryByText('Loading books…')).not.toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Books' })).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByText('Dune')).toBeInTheDocument()

    next.resolve([books[1]])

    await waitFor(() => expect(screen.queryByText('Dune')).not.toBeInTheDocument())
    expect(screen.getByRole('list', { name: 'Books' })).toHaveAttribute('aria-busy', 'false')
  })
})
