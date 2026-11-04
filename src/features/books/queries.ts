import { useQuery } from '@tanstack/react-query'
import { fetchBooks } from './api'
import type { BookStatus } from './schema'

// One place for cache keys: ['books', ...] lets a mutation invalidate every books query by prefix
export const bookKeys = {
  all: ['books'] as const,
  list: (status?: BookStatus) => [...bookKeys.all, 'list', status ?? 'all'] as const,
}

export function useBooks(status?: BookStatus) {
  return useQuery({ queryKey: bookKeys.list(status), queryFn: () => fetchBooks(status) })
}
