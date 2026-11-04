'use client'

import { useParams } from 'next/navigation'
import { useBook, type Book } from '@/entities/book'
import { DeleteBookCard } from '@/features/delete-book'
import { EditBookForm } from '@/features/edit-book'
import { ReadingSession } from '@/features/reading-session'
import { HttpError } from '@/shared/api'
import { Message } from '@/shared/ui/Message'
import { NotFound } from '@/shared/ui/NotFound'

export function BookPage() {
  // `!`: never null in the App Router; the root pages/ folder only widens the type (see pages/README.md)
  const { id } = useParams<{ id: string }>()!
  const book = useBook(id)

  if (book.isPending) return <Message>Loading book…</Message>
  if (book.error instanceof HttpError && book.error.status === 404) return <NotFound title="Book not found" />
  if (book.isError) return <Message role="alert" className="text-destructive">{book.error.message}</Message>

  // key: a different book is a different component instance, so the form, the delete
  // confirmation and the reading session start fresh instead of keeping the previous book's state
  return <BookDetails key={book.data.id} book={book.data} />
}

function BookDetails({ book }: { book: Book }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <section className="grid content-start gap-6">
        <h1 className="text-2xl font-bold">{book.title}</h1>
        <EditBookForm book={book} />
      </section>

      <aside className="grid content-start gap-6">
        <ReadingSession />
        <DeleteBookCard book={book} />
      </aside>
    </div>
  )
}
