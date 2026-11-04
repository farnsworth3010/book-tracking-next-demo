import { z } from 'zod'

export const BOOK_STATUSES = ['want', 'reading', 'done'] as const

export const bookStatusSchema = z.enum(BOOK_STATUSES)

export const bookInputSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  author: z.string().trim().min(1, 'Author is required'),
  status: bookStatusSchema,
  pages: z.number({ error: 'Enter a number' }).int('Whole pages only').positive('Must be greater than 0'),
  notes: z.string().max(500, 'Keep notes under 500 characters'),
})

export const bookSchema = bookInputSchema.extend({ id: z.string() })

export type BookStatus = z.infer<typeof bookStatusSchema>
export type BookInput = z.infer<typeof bookInputSchema>
export type Book = z.infer<typeof bookSchema>

export const STATUS_LABELS: Record<BookStatus, string> = {
  want: 'Want to read',
  reading: 'Reading',
  done: 'Done',
}
