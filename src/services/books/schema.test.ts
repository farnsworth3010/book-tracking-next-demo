import { describe, expect, it } from 'vitest'
import { bookInputSchema, bookStatusSchema } from './schema'

const valid = { title: 'Dune', author: 'Frank Herbert', status: 'want', pages: 412, notes: '' }

describe('bookInputSchema', () => {
  it('accepts a valid book and trims text fields', () => {
    expect(bookInputSchema.parse({ ...valid, title: '  Dune ' })).toEqual(valid)
  })

  it('rejects blank title and author', () => {
    const result = bookInputSchema.safeParse({ ...valid, title: ' ', author: '' })

    expect(result.success).toBe(false)
    expect(result.error?.issues.map((i) => i.path[0])).toEqual(['title', 'author'])
  })

  it('rejects NaN and non-positive page counts', () => {
    expect(bookInputSchema.safeParse({ ...valid, pages: Number.NaN }).success).toBe(false)
    expect(bookInputSchema.safeParse({ ...valid, pages: 0 }).success).toBe(false)
  })
})

describe('bookStatusSchema', () => {
  it('parses a known status and rejects anything else', () => {
    expect(bookStatusSchema.safeParse('reading').data).toBe('reading')
    expect(bookStatusSchema.safeParse('lost').data).toBeUndefined()
    expect(bookStatusSchema.safeParse(null).data).toBeUndefined()
  })
})
