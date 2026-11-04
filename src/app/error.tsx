'use client' // error boundaries catch render errors with React state, so they must be Client Components

import Link from 'next/link'
import { Button } from '@/components/ui/button'

type ErrorPageProps = {
  error: unknown
  retry: () => void
}

// A crash while rendering a page lands here; the root layout (header) stays on screen
export default function ErrorPage({ error, retry }: ErrorPageProps) {
  return (
    <div role="alert" className="grid justify-items-center gap-4 py-12 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
      <div className="flex gap-2">
        <Button onClick={() => retry()}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/">Back to books</Link>
        </Button>
      </div>
    </div>
  )
}
