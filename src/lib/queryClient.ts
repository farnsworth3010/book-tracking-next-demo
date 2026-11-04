import { z } from 'zod'
import { HttpError } from './http'

// Only failures that can change on their own are worth retrying: network errors and 5xx
export function shouldRetry(failureCount: number, error: Error) {
  if (error instanceof HttpError && error.status < 500) return false
  if (error instanceof z.ZodError) return false

  return failureCount < 3
}
