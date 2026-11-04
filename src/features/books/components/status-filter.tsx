import { Button } from '@/components/ui/button'
import { BOOK_STATUSES, STATUS_LABELS, type BookStatus } from '@/features/books/schemas/book'

type StatusFilterProps = {
  value?: BookStatus
  onChange: (value?: BookStatus) => void
}

const OPTIONS = [undefined, ...BOOK_STATUSES]

// Controlled component: no state of its own, the parent owns `value` (like @Input + @Output in Angular)
export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
      {OPTIONS.map((option) => (
        <Button
          key={option ?? 'all'}
          size="sm"
          variant={option === value ? 'default' : 'outline'}
          aria-pressed={option === value}
          onClick={() => onChange(option)}
        >
          {option ? STATUS_LABELS[option] : 'All'}
        </Button>
      ))}
    </div>
  )
}
