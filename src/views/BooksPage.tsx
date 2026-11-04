'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Message } from '@/components/Message'
import { BookCard } from '@/components/BookCard'
import { QuickAddForm } from '@/components/QuickAddForm'
import { useBooks } from '@/hooks/books'
import { bookStatusSchema, type BookStatus } from '@/schemas/book'
import { StatusFilter } from '@/components/StatusFilter'
import { useAppSelector } from '@/hooks/redux'
import { selectBooksView } from '@/stores/uiSlice'

export function BooksPage() {
  // The filter lives in the URL: it survives a reload and can be shared as a link
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const status = bookStatusSchema.safeParse(searchParams.get('status')).data

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Books</h1>
        <StatusFilter
          value={status}
          onChange={(next) => router.push(next ? `${pathname}?status=${next}` : pathname, { scroll: false })}
        />
      </div>
      <QuickAddForm />
      <BookList status={status} />
    </>
  )
}

function BookList({ status }: { status?: BookStatus }) {
  const books = useBooks(status)
  const view = useAppSelector(selectBooksView)

  if (books.isPending) return <Message>Loading books…</Message>
  if (books.isError) return <Message role="alert" className="text-destructive">{books.error.message}</Message>
  if (books.data.length === 0) return <Message>No books here yet.</Message>

  return (
    <ul
      aria-label="Books"
      aria-busy={books.isPlaceholderData}
      data-view={view}
      className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 transition-opacity data-[view=list]:grid-cols-1 aria-busy:opacity-60"
    >
      {books.data.map((book) => (
        <li key={book.id}>
          <BookCard book={book} />
        </li>
      ))}
    </ul>
  )
}
