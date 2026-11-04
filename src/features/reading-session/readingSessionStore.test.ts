import { autorun } from 'mobx'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ReadingSessionStore } from './readingSessionStore'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ReadingSessionStore', () => {
  it('counts seconds only while running', () => {
    const store = new ReadingSessionStore()

    store.start()
    vi.advanceTimersByTime(3000)
    store.pause()
    vi.advanceTimersByTime(5000)

    expect(store.seconds).toBe(3)
    expect(store.running).toBe(false)
  })

  it('formats elapsed time and derives pages per hour', () => {
    const store = new ReadingSessionStore()

    store.start()
    vi.advanceTimersByTime(90_000)
    store.addPage()
    store.addPage()

    expect(store.elapsed).toBe('01:30')
    expect(store.pagesPerHour).toBe(80)
  })

  it('notifies observers when observable state changes', () => {
    const store = new ReadingSessionStore()
    const seen: number[] = []

    autorun(() => seen.push(store.pages))
    store.addPage()
    store.reset()

    expect(seen).toEqual([0, 1, 0])
  })
})
