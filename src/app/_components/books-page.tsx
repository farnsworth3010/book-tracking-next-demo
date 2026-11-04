'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { BookList } from '@/features/books/components/books-list'
import { QuickAddForm } from '@/features/books/components/quick-add-form'
import { StatusFilter } from '@/features/books/components/status-filter'
import { bookStatusSchema } from '@/features/books/schemas/book'

export function BooksPage() {
  // The filter lives in the URL: it survives a reload and can be shared as a link
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const status = bookStatusSchema.safeParse(searchParams.get('status')).data

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Books</h1>
        <StatusFilter
          value={status}
          onChange={(next) => router.push(next ? `${pathname}?status=${next}` : pathname, { scroll: false })}
        />
      </div>
      <QuickAddForm />
      <BookList status={status} />
    </>
  )
}
