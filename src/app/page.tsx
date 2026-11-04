import { Suspense } from 'react'
import { Message } from '@/components/message'
import { BooksPage } from './_components/books-page'

export default function HomePage() {
  return (
    // BooksPage reads the URL with useSearchParams; the boundary lets the rest of the page prerender
    <Suspense fallback={<Message>Loading books…</Message>}>
      <BooksPage />
    </Suspense>
  )
}
