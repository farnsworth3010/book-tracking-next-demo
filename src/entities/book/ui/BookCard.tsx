import Link from 'next/link'
import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import type { Book } from '../model/schema'

// statusSlot: an entity must not import features, so the page/widget passes the status control in
export function BookCard({ book, statusSlot }: { book: Book; statusSlot?: ReactNode }) {
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
        {/* flex-wrap lets the slot drop a full-width line (an error) below the row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {statusSlot}
          <span>{book.pages} pages</span>
        </div>
      </CardContent>
    </Card>
  )
}
