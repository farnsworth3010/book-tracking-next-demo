import { z } from 'zod'
import { bookSchema, type Book, type BookInput, type BookStatus } from './schema'

const BASE = '/api/books'

async function request(url: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...init })

  if (!res.ok) throw new Error(`${init?.method ?? 'GET'} ${url} failed: ${res.status}`)

  return res.json()
}

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
