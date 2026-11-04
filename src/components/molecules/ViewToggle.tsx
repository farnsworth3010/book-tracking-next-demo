'use client'

import { LayoutGridIcon, ListIcon } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { useAppDispatch, useAppSelector } from '@/state/store'
import { selectBooksView, setBooksView } from '@/state/uiSlice'

export function ViewToggle() {
  const view = useAppSelector(selectBooksView)
  const dispatch = useAppDispatch()

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
