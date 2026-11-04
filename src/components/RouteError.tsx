import { Link, useRouteError } from 'react-router'
import { Button } from '@/components/ui/button'

// Route error boundary: a crash while rendering a page lands here instead of unmounting the whole app
export function RouteError() {
  const error = useRouteError()

  return (
    <div role="alert" className="grid justify-items-center gap-4 py-12 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
      <Button asChild variant="outline">
        <Link to="/">Back to books</Link>
      </Button>
    </div>
  )
}
