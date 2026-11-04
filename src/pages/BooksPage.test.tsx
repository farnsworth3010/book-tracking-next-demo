import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchBooks } from '@/features/books/api'
import { selectBooksView } from '@/store/uiSlice'
import { makeBook } from '@/test/fixtures'
import { renderRoute } from '@/test/renderRoute'

vi.mock('@/features/books/api')

const books = [
  makeBook({ id: '1', title: 'Dune', author: 'Frank Herbert', status: 'reading' }),
  makeBook({ id: '2', title: 'Emma', author: 'Jane Austen', status: 'done', pages: 474 }),
]

beforeEach(() => {
  vi.mocked(fetchBooks).mockResolvedValue(books)
})

describe('BooksPage', () => {
  it('shows a loading state, then the books as links to their pages', async () => {
    renderRoute('/')

    expect(screen.getByText('Loading books…')).toBeInTheDocument()

    const dune = await screen.findByRole('link', { name: /Dune/ })

    expect(dune).toHaveAttribute('href', '/books/1')
    expect(dune).toHaveTextContent('Frank Herbert')
    expect(dune).toHaveTextContent('Reading')
    expect(screen.getByRole('link', { name: /Emma/ })).toHaveTextContent('474 pages')
    expect(fetchBooks).toHaveBeenCalledWith(undefined)
  })

  it('loads the status from the URL and marks its filter as pressed', async () => {
    renderRoute('/?status=done')

    await screen.findByText('Dune')

    expect(fetchBooks).toHaveBeenCalledWith('done')
    expect(screen.getByRole('button', { name: 'Done' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('ignores an unknown status in the URL', async () => {
    renderRoute('/?status=lost')

    await screen.findByText('Dune')

    expect(fetchBooks).toHaveBeenCalledWith(undefined)
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('writes the chosen filter to the URL and refetches', async () => {
    const { router, user } = renderRoute('/')
    await screen.findByText('Dune')

    await user.click(screen.getByRole('button', { name: 'Reading' }))

    expect(router.state.location.search).toBe('?status=reading')
    await waitFor(() => expect(fetchBooks).toHaveBeenLastCalledWith('reading'))

    await user.click(screen.getByRole('button', { name: 'All' }))

    expect(router.state.location.search).toBe('')
  })

  it('shows an empty state', async () => {
    vi.mocked(fetchBooks).mockResolvedValue([])

    renderRoute('/')

    expect(await screen.findByText('No books here yet.')).toBeInTheDocument()
  })

  it('shows the error when loading fails', async () => {
    vi.mocked(fetchBooks).mockRejectedValue(new Error('GET /api/books failed: 500'))

    renderRoute('/')

    expect(await screen.findByRole('alert')).toHaveTextContent('GET /api/books failed: 500')
  })

  it('switches between grid and list through the store', async () => {
    const { store, user } = renderRoute('/')
    const list = await screen.findByRole('list', { name: 'Books' })

    expect(list).toHaveAttribute('data-view', 'grid')

    await user.click(screen.getByRole('button', { name: 'List view' }))

    expect(selectBooksView(store.getState())).toBe('list')
    expect(list).toHaveAttribute('data-view', 'list')
    expect(screen.getByRole('button', { name: 'List view' })).toHaveAttribute('aria-pressed', 'true')
  })
})
