import { Link, Outlet } from 'react-router'
import { ViewToggle } from '@/components/ViewToggle'

export function Layout() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between gap-4 border-b pb-4">
        <Link to="/" className="text-xl font-bold">
          Book Tracker
        </Link>
        <ViewToggle />
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
