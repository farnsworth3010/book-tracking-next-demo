import { BookForm, useUpdateBook, type Book } from '@/entities/book'
import { Card, CardContent } from '@/shared/ui/card'
import { Message } from '@/shared/ui/Message'

export function EditBookForm({ book }: { book: Book }) {
  const updateBook = useUpdateBook()

  return (
    <>
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
    </>
  )
}
