import { Suspense } from 'react'
import { BooksPage } from '@/pages/books'
import { Message } from '@/shared/ui/Message'

export default function HomePage() {
  return (
    // BooksPage reads the URL with useSearchParams; the boundary lets the rest of the page prerender
    <Suspense fallback={<Message>Loading books…</Message>}>
      <BooksPage />
    </Suspense>
  )
}
