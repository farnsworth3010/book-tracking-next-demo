import { afterEach, describe, expect, it, vi } from 'vitest'
import { createBook, fetchBooks } from './api'

const book = { id: '1', title: 'Dune', author: 'Frank Herbert', status: 'want', pages: 412, notes: '' }

function mockFetch(body: unknown, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify(body), { status }))
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('books api', () => {
  it('fetches all books, or only the given status', async () => {
    const fetch = mockFetch([book])

    await expect(fetchBooks()).resolves.toEqual([book])
    await fetchBooks('reading')

    expect(fetch.mock.calls.map(([url]) => url)).toEqual(['/api/books', '/api/books?status=reading'])
  })

  it('rejects a response that does not match the schema', async () => {
    mockFetch([{ ...book, pages: 'many' }])

    await expect(fetchBooks()).rejects.toThrow()
  })

  it('throws on a non-2xx response', async () => {
    mockFetch({}, 500)

    await expect(fetchBooks()).rejects.toThrow('GET /api/books failed: 500')
  })

  it('posts a new book as JSON', async () => {
    const fetch = mockFetch(book, 201)
    const { id: _, ...input } = book

    await createBook({ ...input, status: 'want' })

    expect(fetch).toHaveBeenCalledWith('/api/books', expect.objectContaining({ method: 'POST', body: JSON.stringify(input) }))
  })
})
