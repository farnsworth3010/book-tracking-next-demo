'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { NotFoundPage } from '@/components/errors/not-found-page'
import { Message } from '@/components/message'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BookForm } from '@/features/books/components/book-form'
import { useBook, useDeleteBook, useUpdateBook } from '@/features/books/api/queries'
import type { Book } from '@/features/books/schemas/book'
import { ReadingSession } from '@/features/reading-session/components/reading-session'
import { HttpError } from '@/lib/api-client'

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
  const router = useRouter()
  const updateBook = useUpdateBook()
  const deleteBook = useDeleteBook()
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <section className="grid content-start gap-6">
        <h1 className="text-2xl font-bold">{book.title}</h1>
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
      </section>

      <aside className="grid content-start gap-6">
        <ReadingSession />
        <Card>
          <CardContent className="grid gap-3">
            {confirmingDelete ? (
              <>
                <p className="text-sm">Delete “{book.title}”? This cannot be undone.</p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    disabled={deleteBook.isPending}
                    onClick={() => deleteBook.mutate(book.id, { onSuccess: () => router.replace('/') })}
                  >
                    Confirm delete
                  </Button>
                  <Button variant="outline" onClick={() => setConfirmingDelete(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <Button variant="outline" onClick={() => setConfirmingDelete(true)}>
                Delete book
              </Button>
            )}
            {deleteBook.isError && <p className="text-sm text-destructive">{deleteBook.error.message}</p>}
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}
