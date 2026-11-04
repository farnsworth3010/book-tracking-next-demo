import { describe, expect, it } from 'vitest'
import { selectBooksView, setBooksView } from '@/features/toggle-books-view'
import { makeStore } from './store'

describe('ui slice', () => {
  it('starts in grid view and switches on setBooksView', () => {
    const store = makeStore()

    expect(selectBooksView(store.getState())).toBe('grid')

    store.dispatch(setBooksView('list'))

    expect(selectBooksView(store.getState())).toBe('list')
  })
})
