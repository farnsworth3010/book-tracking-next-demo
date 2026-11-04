import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createBook, deleteBook, fetchBook, fetchBooks, updateBook } from './api'
import type { Book, BookStatus } from './schema'

// One place for cache keys: ['books', ...] lets a mutation invalidate every books query by prefix
export const bookKeys = {
  all: ['books'] as const,
  lists: () => [...bookKeys.all, 'list'] as const,
  list: (status?: BookStatus) => [...bookKeys.lists(), status ?? 'all'] as const,
  detail: (id: string) => [...bookKeys.all, 'detail', id] as const,
}

export function useBooks(status?: BookStatus) {
  return useQuery({ queryKey: bookKeys.list(status), queryFn: () => fetchBooks(status) })
}

export function useBook(id: string) {
  return useQuery({ queryKey: bookKeys.detail(id), queryFn: () => fetchBook(id) })
}

export function useCreateBook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBook,
    // Returning the promise keeps the mutation pending until visible lists have refetched
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookKeys.all }),
  })
}

// Optimistic: the cache shows the edit at once, rolls back if the server rejects, then resyncs either way
export function useUpdateBook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateBook,
    onMutate: async (book: Book) => {
      // A refetch already in flight would land after our write and overwrite it with old data
      await queryClient.cancelQueries({ queryKey: bookKeys.all })

      const previous = queryClient.getQueriesData<Book | Book[]>({ queryKey: bookKeys.all })

      queryClient.setQueryData(bookKeys.detail(book.id), book)
      queryClient.setQueriesData<Book[]>({ queryKey: bookKeys.lists() }, (list) =>
        list?.map((item) => (item.id === book.id ? book : item)),
      )

      return { previous }
    },
    onError: (_error, _book, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data))
    },
    // Filtered lists may need the book added or removed, so the server answer decides
    onSettled: () => queryClient.invalidateQueries({ queryKey: bookKeys.all }),
  })
}

export function useDeleteBook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookKeys.lists() }),
  })
}
