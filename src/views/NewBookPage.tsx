'use client'

import { useRouter } from 'next/navigation'
import { Message } from '@/components/Message'
import { Card, CardContent } from '@/components/ui/card'
import { BookForm } from '@/features/books/BookForm'
import { useCreateBook } from '@/features/books/queries'

export function NewBookPage() {
  const router = useRouter()
  const createBook = useCreateBook()

  return (
    <div className="mx-auto grid max-w-xl gap-6">
      <h1 className="text-2xl font-bold">Add a book</h1>
      <Card>
        <CardContent>
          <BookForm
            submitLabel="Save book"
            pending={createBook.isPending}
            onSubmit={(values) => createBook.mutate(values, { onSuccess: () => router.push('/') })}
          />
        </CardContent>
      </Card>
      {createBook.isError && (
        <Message role="alert" className="text-destructive">
          {createBook.error.message}
        </Message>
      )}
    </div>
  )
}
