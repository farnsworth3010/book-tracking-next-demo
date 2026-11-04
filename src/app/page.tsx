import { Suspense } from 'react'
import { Message } from '@/components/Message'
import { BooksPage } from '@/views/BooksPage'

export default function HomePage() {
  return (
    // BooksPage reads the URL with useSearchParams; the boundary lets the rest of the page prerender
    <Suspense fallback={<Message>Loading books…</Message>}>
      <BooksPage />
    </Suspense>
  )
}
