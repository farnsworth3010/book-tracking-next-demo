import { z } from 'zod'
import { request } from '@/lib/api-client'
import { bookSchema, type Book, type BookInput, type BookStatus } from '@/features/books/schemas/book'

const BASE = '/api/books'

// Responses are parsed with zod: the backend is a trust boundary, types alone don't check it at runtime
export async function fetchBooks(status?: BookStatus): Promise<Book[]> {
  return z.array(bookSchema).parse(await request(status ? `${BASE}?status=${status}` : BASE))
}

export async function fetchBook(id: string): Promise<Book> {
  return bookSchema.parse(await request(`${BASE}/${id}`))
}

export async function createBook(input: BookInput): Promise<Book> {
  return bookSchema.parse(await request(BASE, { method: 'POST', body: JSON.stringify(input) }))
}

export async function updateBook({ id, ...input }: Book): Promise<Book> {
  return bookSchema.parse(await request(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(input) }))
}

export async function deleteBook(id: string): Promise<void> {
  await request(`${BASE}/${id}`, { method: 'DELETE' })
}
