import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Button } from '@/components/atoms/button'
import { Card, CardContent } from '@/components/atoms/card'
import { Field, FieldError, FieldLabel } from '@/components/atoms/field'
import { Input } from '@/components/atoms/input'
import { useCreateBook } from '@/services/books/queries'
import { bookInputSchema } from '@/services/books/schema'

// Inputs hold strings; pages is coerced to a number and then checked by the shared book rules
const quickAddSchema = bookInputSchema.pick({ title: true, author: true }).extend({
  pages: z.coerce.number<string>().pipe(bookInputSchema.shape.pages),
})

export function QuickAddForm() {
  const createBook = useCreateBook()

  const form = useForm({
    defaultValues: { title: '', author: '', pages: '' },
    validators: { onChange: quickAddSchema, onSubmit: quickAddSchema },
    onSubmit: ({ value, formApi }) => {
      // TanStack Form hands over raw field values, so the schema output is parsed here
      const input = quickAddSchema.parse(value)

      createBook.mutate({ ...input, status: 'want', notes: '' }, { onSuccess: () => formApi.reset() })
    },
  })

  return (
    <Card className="mb-6">
      <CardContent>
        <form
          noValidate
          className="grid items-start gap-3 sm:grid-cols-[1fr_1fr_7rem_auto]"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          {(['title', 'author', 'pages'] as const).map((name) => (
            <form.Field key={name} name={name}>
              {(field) => {
                const errors = field.state.meta.isTouched ? field.state.meta.errors : []

                return (
                  <Field data-invalid={errors.length > 0}>
                    <FieldLabel htmlFor={`quick-${name}`}>{QUICK_LABELS[name]}</FieldLabel>
                    <Input
                      id={`quick-${name}`}
                      type={name === 'pages' ? 'number' : 'text'}
                      value={field.state.value}
                      aria-invalid={errors.length > 0}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                    <FieldError errors={errors} />
                  </Field>
                )
              }}
            </form.Field>
          ))}

          {/* Subscribe re-renders only this button when canSubmit changes, not the whole form */}
          <form.Subscribe selector={(state) => state.canSubmit}>
            {(canSubmit) => (
              <Button type="submit" className="sm:mt-6" disabled={!canSubmit || createBook.isPending}>
                Quick add
              </Button>
            )}
          </form.Subscribe>
        </form>
        {createBook.isError && <p className="mt-3 text-sm text-destructive">{createBook.error.message}</p>}
      </CardContent>
    </Card>
  )
}

const QUICK_LABELS = { title: 'Title', author: 'Author', pages: 'Pages' }
