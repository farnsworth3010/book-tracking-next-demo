'use client'

import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/atoms/card'
import { Message } from '@/components/molecules/Message'
import { BookForm } from '@/components/organisms/BookForm'
import { DeleteBookCard } from '@/components/organisms/DeleteBookCard'
import { ReadingSession } from '@/components/organisms/ReadingSession'
import { DetailPageTemplate } from '@/components/templates/DetailPageTemplate'
import { HttpError } from '@/lib/http'
import { useBook, useUpdateBook } from '@/services/books/queries'
import type { Book } from '@/services/books/schema'
import { NotFoundPage } from '@/views/NotFoundPage'

export function BookPage() {
  const { id } = useParams<{ id: string }>()
  const book = useBook(id)

  if (book.isPending) return <Message>Loading book…</Message>
  if (book.error instanceof HttpError && book.error.status === 404) return <NotFoundPage title="Book not found" />
  if (book.isError) return <Message role="alert" className="text-destructive">{book.error.message}</Message>

  // key: a different book is a different component instance, so the form, the delete
  // confirmation and the reading session start fresh instead of keeping the previous book's state
  return <BookDetails key={book.data.id} book={book.data} />
}

function BookDetails({ book }: { book: Book }) {
  const updateBook = useUpdateBook()

  return (
    <DetailPageTemplate
      title={book.title}
      aside={
        <>
          <ReadingSession />
          <DeleteBookCard book={book} />
        </>
      }
    >
      <Card>
        <CardContent>
          <BookForm
            defaultValues={book}
            submitLabel="Save changes"
            pending={updateBook.isPending}
            onSubmit={(values) => updateBook.mutate({ ...values, id: book.id })}
          />
        </CardContent>
      </Card>
      {updateBook.isError && (
        <Message role="alert" className="text-destructive">
          {updateBook.error.message}
        </Message>
      )}
    </DetailPageTemplate>
  )
}
