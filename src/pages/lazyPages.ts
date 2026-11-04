import { lazy } from 'react'

// Heavier pages (React Hook Form, Radix Select, MobX) load as separate chunks on first visit
export const NewBookPage = lazy(() => import('./NewBookPage'))
export const BookPage = lazy(() => import('./BookPage'))
