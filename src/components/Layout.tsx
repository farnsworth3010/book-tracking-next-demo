import { Link, Outlet } from 'react-router'
import { Button } from '@/components/ui/button'
import { ViewToggle } from '@/components/ViewToggle'

export function Layout() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between gap-4 border-b pb-4">
        <Link to="/" className="text-xl font-bold">
          Book Tracker
        </Link>
        <div className="flex items-center gap-3">
          <ViewToggle />
          <Button asChild size="sm">
            <Link to="/books/new">Add book</Link>
          </Button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
