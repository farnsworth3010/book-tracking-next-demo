import { z } from 'zod'
import { describe, expect, it } from 'vitest'
import { HttpError } from './api-client'
import { shouldRetry } from './react-query'

describe('shouldRetry', () => {
  it('retries network errors and 5xx up to three times', () => {
    expect(shouldRetry(0, new TypeError('Failed to fetch'))).toBe(true)
    expect(shouldRetry(2, new HttpError(503, 'unavailable'))).toBe(true)
    expect(shouldRetry(3, new HttpError(503, 'unavailable'))).toBe(false)
  })

  it('never retries what a retry cannot fix: 4xx and a response of the wrong shape', () => {
    expect(shouldRetry(0, new HttpError(404, 'not found'))).toBe(false)
    expect(shouldRetry(0, z.string().safeParse(1).error!)).toBe(false)
  })
})
