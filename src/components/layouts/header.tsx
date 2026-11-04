import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ViewToggle } from '@/components/view-toggle'

// Server Component: static markup; only ViewToggle (store + clicks) ships as client code
export function Header() {
  return (
    <header className="mb-6 flex items-center justify-between gap-4 border-b pb-4">
      <Link href="/" className="text-xl font-bold">
        Book Tracker
      </Link>
      <div className="flex items-center gap-3">
        <ViewToggle />
        <Button asChild size="sm">
          <Link href="/books/new">Add book</Link>
        </Button>
      </div>
    </header>
  )
}
