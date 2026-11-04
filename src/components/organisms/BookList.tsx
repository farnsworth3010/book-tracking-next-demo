import { Message } from '@/components/molecules/Message'
import { BookCard } from '@/components/organisms/BookCard'
import { useBooks } from '@/services/books/queries'
import type { BookStatus } from '@/services/books/schema'
import { useAppSelector } from '@/state/store'
import { selectBooksView } from '@/state/uiSlice'

export function BookList({ status }: { status?: BookStatus }) {
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
