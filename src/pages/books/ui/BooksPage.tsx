'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { bookStatusSchema } from '@/entities/book'
import { QuickAddForm } from '@/features/create-book'
import { StatusFilter } from '@/features/filter-books'
import { BookList } from '@/widgets/book-list'

export function BooksPage() {
  // The filter lives in the URL: it survives a reload and can be shared as a link
  // `!`: the root pages/ folder (see pages/README.md) adds Pages Router types where these may be null; not in App Router
  const searchParams = useSearchParams()!
  const router = useRouter()
  const pathname = usePathname()!
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
