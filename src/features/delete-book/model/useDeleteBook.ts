import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bookKeys, deleteBook } from '@/entities/book'

export function useDeleteBook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookKeys.lists() }),
  })
}
