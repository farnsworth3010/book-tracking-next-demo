'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/atoms/card'
import { Message } from '@/components/molecules/Message'
import { BookForm } from '@/components/organisms/BookForm'
import { FormPageTemplate } from '@/components/templates/FormPageTemplate'
import { useCreateBook } from '@/services/books/queries'

export function NewBookPage() {
  const router = useRouter()
  const createBook = useCreateBook()

  return (
    <FormPageTemplate title="Add a book">
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
    </FormPageTemplate>
  )
}
