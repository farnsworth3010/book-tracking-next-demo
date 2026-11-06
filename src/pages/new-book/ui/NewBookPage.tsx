'use client'

import { CreateBookForm } from '@/features/create-book'

export function NewBookPage() {
  return (
    <div className="mx-auto grid max-w-xl gap-6">
      <h1 className="text-2xl font-bold">Add a book</h1>
      <CreateBookForm />
    </div>
  )
}
