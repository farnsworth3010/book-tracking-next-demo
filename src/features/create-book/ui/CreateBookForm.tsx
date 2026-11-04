import { useRouter } from 'next/navigation'
import { BookForm } from '@/entities/book'
import { Card, CardContent } from '@/shared/ui/card'
import { Message } from '@/shared/ui/Message'
import { useCreateBook } from '../model/useCreateBook'

export function CreateBookForm() {
  const router = useRouter()
  const createBook = useCreateBook()

  return (
    <>
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
    </>
  )
}
