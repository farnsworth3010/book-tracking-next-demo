import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card'
import { NativeSelect, NativeSelectOption } from '@/components/atoms/native-select'
import { useUpdateBook } from '@/services/books/queries'
import { BOOK_STATUSES, bookStatusSchema, STATUS_LABELS, type Book } from '@/services/books/schema'

export function BookCard({ book }: { book: Book }) {
  const updateBook = useUpdateBook()

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <Link href={`/books/${book.id}`} className="hover:underline">
            {book.title}
          </Link>
        </CardTitle>
        <CardDescription>{book.author}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto grid gap-2 text-sm text-muted-foreground">
        <div className="flex items-center justify-between gap-2">
          {/* Controlled by the cached book: the optimistic cache write is what moves this value */}
          <NativeSelect
            size="sm"
            aria-label={`Status of ${book.title}`}
            value={book.status}
            onChange={(event) => updateBook.mutate({ ...book, status: bookStatusSchema.parse(event.target.value) })}
          >
            {BOOK_STATUSES.map((status) => (
              <NativeSelectOption key={status} value={status}>
                {STATUS_LABELS[status]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <span>{book.pages} pages</span>
        </div>
        {updateBook.isError && (
          <p role="alert" className="text-destructive">
            {updateBook.error.message}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
