import { describe, expect, it } from 'vitest'
import { makeStore } from './store'
import { selectBooksView, setBooksView } from './ui-slice'

describe('ui slice', () => {
  it('starts in grid view and switches on setBooksView', () => {
    const store = makeStore()

    expect(selectBooksView(store.getState())).toBe('grid')

    store.dispatch(setBooksView('list'))

    expect(selectBooksView(store.getState())).toBe('list')
  })
})
