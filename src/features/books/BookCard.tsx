import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { STATUS_LABELS, type Book } from './schema'

export function BookCard({ book }: { book: Book }) {
  return (
    // `group` on the link lets the card react to hovering the whole link (group-hover:)
    <Link
      to={`/books/${book.id}`}
      className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <Card className="h-full transition-colors group-hover:border-ring">
        <CardHeader>
          <CardTitle>{book.title}</CardTitle>
          <CardDescription>{book.author}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">{STATUS_LABELS[book.status]}</Badge>
          <span>{book.pages} pages</span>
        </CardContent>
      </Card>
    </Link>
  )
}
