import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/testing/render'
import { Header } from './header'

describe('Header', () => {
  it('links home and to the new book form, next to the view toggle', () => {
    renderWithProviders(<Header />)

    expect(screen.getByRole('link', { name: 'Book Tracker' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Add book' })).toHaveAttribute('href', '/books/new')
    expect(screen.getByRole('group', { name: 'Books view' })).toBeInTheDocument()
  })
})
