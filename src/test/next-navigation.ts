import { useSyncExternalStore } from 'react'
import { vi } from 'vitest'

// In-memory stand-in for next/navigation, so client components run in tests without the Next.js router
type NavigationState = { url: URL; params: Record<string, string> }

let state: NavigationState = { url: new URL('http://localhost/'), params: {} }
const listeners = new Set<() => void>()

export function navigate(href: string, params: Record<string, string> = {}) {
  state = { url: new URL(href, state.url), params }
  listeners.forEach((listener) => listener())
}

export const currentUrl = () => state.url

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const useNavigationState = () => useSyncExternalStore(subscribe, () => state)

export const mockRouter = {
  push: vi.fn((href: string) => navigate(href)),
  replace: vi.fn((href: string) => navigate(href)),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
}

export const useRouter = () => mockRouter
export const usePathname = () => useNavigationState().url.pathname
export const useSearchParams = () => useNavigationState().url.searchParams
export const useParams = () => useNavigationState().params
