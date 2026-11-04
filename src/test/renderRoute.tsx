import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { routes } from '@/routes'
import { makeStore } from '@/store/store'

// Renders the real route tree at `path` with fresh providers, like main.tsx does in the browser
export function renderRoute(path: string) {
  const store = makeStore()
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const user = userEvent.setup()

  render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Provider>,
  )

  return { router, store, user }
}
