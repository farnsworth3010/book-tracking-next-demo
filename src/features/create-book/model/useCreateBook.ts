import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bookKeys, createBook } from '@/entities/book'

export function useCreateBook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBook,
    // Returning the promise keeps the mutation pending until visible lists have refetched
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookKeys.all }),
  })
}
