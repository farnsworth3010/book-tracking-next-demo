import { useSelector } from 'react-redux'
import { BookCard, useBooks, type BookStatus } from '@/entities/book'
import { BookStatusSelect } from '@/features/change-book-status'
import { selectBooksView } from '@/features/toggle-books-view'
import { Message } from '@/shared/ui/Message'

export function BookList({ status }: { status?: BookStatus }) {
  const books = useBooks(status)
  const view = useSelector(selectBooksView)

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
          {/* Composition: the widget joins the entity card and the feature, neither knows the other */}
          <BookCard book={book} statusSlot={<BookStatusSelect book={book} />} />
        </li>
      ))}
    </ul>
  )
}
