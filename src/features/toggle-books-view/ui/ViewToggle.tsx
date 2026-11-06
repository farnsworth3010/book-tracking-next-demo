'use client'

import { LayoutGridIcon, ListIcon } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@/shared/ui/button'
import { selectBooksView, setBooksView } from '../model/uiSlice'

export function ViewToggle() {
  // Plain hooks: the slice selector is typed, and typed app hooks would import RootState from the app layer
  const view = useSelector(selectBooksView)
  const dispatch = useDispatch()

  return (
    <div role="group" aria-label="Books view" className="flex gap-1">
      <Button
        size="icon-sm"
        variant={view === 'grid' ? 'secondary' : 'ghost'}
        aria-label="Grid view"
        aria-pressed={view === 'grid'}
        onClick={() => dispatch(setBooksView('grid'))}
      >
        <LayoutGridIcon />
      </Button>
      <Button
        size="icon-sm"
        variant={view === 'list' ? 'secondary' : 'ghost'}
        aria-label="List view"
        aria-pressed={view === 'list'}
        onClick={() => dispatch(setBooksView('list'))}
      >
        <ListIcon />
      </Button>
    </div>
  )
}
