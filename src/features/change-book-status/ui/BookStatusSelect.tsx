import { BOOK_STATUSES, bookStatusSchema, STATUS_LABELS, useUpdateBook, type Book } from '@/entities/book'
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select'

// Rendered into BookCard's statusSlot, inside the card's flex row
export function BookStatusSelect({ book }: { book: Book }) {
  const updateBook = useUpdateBook()

  return (
    <>
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
      {updateBook.isError && (
        // basis-full + order-last: its own line under the row, as when it sat below the row
        <p role="alert" className="order-last basis-full text-destructive">
          {updateBook.error.message}
        </p>
      )}
    </>
  )
}
