import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { BOOK_STATUSES, bookInputSchema, STATUS_LABELS, type BookInput } from '@/features/books/schemas/book'

type BookFormProps = {
  defaultValues?: Partial<BookInput>
  submitLabel: string
  pending: boolean
  onSubmit: (values: BookInput) => void
}

const EMPTY_BOOK: Partial<BookInput> = { title: '', author: '', status: 'want', notes: '' }

export function BookForm({ defaultValues = EMPTY_BOOK, submitLabel, pending, onSubmit }: BookFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BookInput>({ resolver: zodResolver(bookInputSchema), defaultValues })

  return (
    // handleSubmit validates first and passes the schema *output* (trimmed strings, numbers) to onSubmit
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input id="title" aria-invalid={!!errors.title} {...register('title')} />
          <FieldError errors={[errors.title]} />
        </Field>

        <Field data-invalid={!!errors.author}>
          <FieldLabel htmlFor="author">Author</FieldLabel>
          <Input id="author" aria-invalid={!!errors.author} {...register('author')} />
          <FieldError errors={[errors.author]} />
        </Field>

        <Field data-invalid={!!errors.status}>
          <FieldLabel htmlFor="status">Status</FieldLabel>
          {/* Radix Select is controlled (value + onValueChange) and has no native input to register */}
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="status" className="w-full" onBlur={field.onBlur}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BOOK_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.status]} />
        </Field>

        <Field data-invalid={!!errors.pages}>
          <FieldLabel htmlFor="pages">Pages</FieldLabel>
          <Input
            id="pages"
            type="number"
            inputMode="numeric"
            aria-invalid={!!errors.pages}
            {...register('pages', { valueAsNumber: true })}
          />
          <FieldError errors={[errors.pages]} />
        </Field>

        <Field data-invalid={!!errors.notes}>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea id="notes" aria-invalid={!!errors.notes} {...register('notes')} />
          <FieldError errors={[errors.notes]} />
        </Field>

        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  )
}
