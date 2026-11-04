import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function NotFoundPage({ title = 'Page not found' }: { title?: string }) {
  return (
    <div className="grid justify-items-center gap-4 py-12">
      <h1 className="text-2xl font-bold">{title}</h1>
      <Button asChild variant="outline">
        <Link to="/">Back to books</Link>
      </Button>
    </div>
  )
}
