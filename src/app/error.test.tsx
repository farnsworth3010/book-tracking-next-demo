import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ErrorPage from './error'

describe('error.tsx (route error boundary)', () => {
  it('shows the error and retries the segment on demand', async () => {
    const retry = vi.fn()

    render(<ErrorPage error={new Error('Cannot read properties of null')} retry={retry} />)
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument()
    expect(screen.getByText('Cannot read properties of null')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to books' })).toHaveAttribute('href', '/')
    expect(retry).toHaveBeenCalledOnce()
  })
})
