import type { Book } from '@/features/books/schemas/book'

export function makeBook(overrides: Partial<Book> = {}): Book {
  return { id: '1', title: 'Dune', author: 'Frank Herbert', status: 'want', pages: 412, notes: '', ...overrides }
}

// A promise the test settles by hand, to observe the UI while a request is still in flight
export function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}
