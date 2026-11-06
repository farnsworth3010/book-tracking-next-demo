import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Book } from '@/entities/book'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { useDeleteBook } from '../model/useDeleteBook'

export function DeleteBookCard({ book }: { book: Book }) {
  const router = useRouter()
  const deleteBook = useDeleteBook()
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  return (
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
  )
}
