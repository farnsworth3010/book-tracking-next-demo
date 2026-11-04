import { useSearchParams } from 'react-router'
import { Message } from '@/components/Message'
import { BookCard } from '@/features/books/BookCard'
import { useBooks } from '@/features/books/queries'
import { bookStatusSchema, type BookStatus } from '@/features/books/schema'
import { StatusFilter } from '@/features/books/StatusFilter'
import { useAppSelector } from '@/store/store'
import { selectBooksView } from '@/store/uiSlice'

export function BooksPage() {
  // The filter lives in the URL: it survives a reload and can be shared as a link
  const [searchParams, setSearchParams] = useSearchParams()
  const status = bookStatusSchema.safeParse(searchParams.get('status')).data

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Books</h1>
        <StatusFilter value={status} onChange={(next) => setSearchParams(next ? { status: next } : {})} />
      </div>
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
      data-view={view}
      className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 data-[view=list]:grid-cols-1"
    >
      {books.data.map((book) => (
        <li key={book.id}>
          <BookCard book={book} />
        </li>
      ))}
    </ul>
  )
}
