import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createBook, fetchBooks } from './api'
import type { BookStatus } from './schema'

// One place for cache keys: ['books', ...] lets a mutation invalidate every books query by prefix
export const bookKeys = {
  all: ['books'] as const,
  list: (status?: BookStatus) => [...bookKeys.all, 'list', status ?? 'all'] as const,
}

export function useBooks(status?: BookStatus) {
  return useQuery({ queryKey: bookKeys.list(status), queryFn: () => fetchBooks(status) })
}

export function useCreateBook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBook,
    // Returning the promise keeps the mutation pending until visible lists have refetched
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookKeys.all }),
  })
}
