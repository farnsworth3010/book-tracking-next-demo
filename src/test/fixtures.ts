import type { Book } from '@/features/books/schema'

export function makeBook(overrides: Partial<Book> = {}): Book {
  return { id: '1', title: 'Dune', author: 'Frank Herbert', status: 'want', pages: 412, notes: '', ...overrides }
}
