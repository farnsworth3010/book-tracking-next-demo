import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from '@/state/store'
import { navigate } from './next-navigation'

type Options = { url?: string; params?: Record<string, string> }

// Renders a client component the way the app shell does: fresh store and query client, at the given URL
export function renderWithProviders(ui: ReactElement, { url = '/', params = {} }: Options = {}) {
  navigate(url, params)

  const store = makeStore()
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const user = userEvent.setup()

  render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </Provider>,
  )

  return { store, user }
}
