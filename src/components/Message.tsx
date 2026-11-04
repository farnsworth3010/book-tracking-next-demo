import { cn } from '@/lib/utils'

// cn lets a caller override the tone: text-destructive replaces text-muted-foreground instead of fighting it
export function Message({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('py-8 text-center text-muted-foreground', className)} {...props} />
}
