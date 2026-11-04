import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NotFoundPage } from './NotFoundPage'

describe('NotFoundPage', () => {
  it('explains and links back to the list', () => {
    render(<NotFoundPage />)

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to books' })).toHaveAttribute('href', '/')
  })
})
