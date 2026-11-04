import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { fetchBooks } from '@/features/books/api'
import { renderRoute } from '@/test/renderRoute'

vi.mock('@/features/books/api')

describe('routes', () => {
  it('renders the layout with a home link around every page', async () => {
    vi.mocked(fetchBooks).mockResolvedValue([])

    renderRoute('/')

    expect(screen.getByRole('link', { name: 'Book Tracker' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('heading', { name: 'Books' })).toBeInTheDocument()
  })

  it('shows a not-found page for unknown paths', () => {
    renderRoute('/nope')

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to books' })).toHaveAttribute('href', '/')
  })
})
