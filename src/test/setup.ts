import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { navigate } from './next-navigation'

vi.mock('next/navigation', () => import('./next-navigation'))
vi.mock('next/link', () => import('./next-link'))

afterEach(() => {
  cleanup()
  navigate('/')
})
