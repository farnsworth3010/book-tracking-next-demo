import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ReadingSession } from './ReadingSession'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ReadingSession (MobX)', () => {
  it('counts time while running and pages on demand', () => {
    render(<ReadingSession />)

    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    act(() => vi.advanceTimersByTime(3000))

    expect(screen.getByText('00:03')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '+1 page' }))
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    act(() => vi.advanceTimersByTime(5000))

    expect(screen.getByText('00:03')).toBeInTheDocument()
    expect(screen.getByText('Pages read: 1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
  })

  it('stops its timer when unmounted', () => {
    const { unmount } = render(<ReadingSession />)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))

    unmount()

    expect(vi.getTimerCount()).toBe(0)
  })
})
