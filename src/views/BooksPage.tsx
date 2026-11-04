'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { StatusFilter } from '@/components/molecules/StatusFilter'
import { BookList } from '@/components/organisms/BookList'
import { QuickAddForm } from '@/components/organisms/QuickAddForm'
import { ListPageTemplate } from '@/components/templates/ListPageTemplate'
import { bookStatusSchema } from '@/services/books/schema'

export function BooksPage() {
  // The filter lives in the URL: it survives a reload and can be shared as a link
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const status = bookStatusSchema.safeParse(searchParams.get('status')).data

  return (
    <ListPageTemplate
      title="Books"
      toolbar={
        <StatusFilter
          value={status}
          onChange={(next) => router.push(next ? `${pathname}?status=${next}` : pathname, { scroll: false })}
        />
      }
    >
      <QuickAddForm />
      <BookList status={status} />
    </ListPageTemplate>
  )
}
