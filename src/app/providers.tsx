'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { enableStaticRendering } from 'mobx-react-lite'
import { useState } from 'react'
import { Provider } from 'react-redux'
import { shouldRetry } from '@/lib/queryClient'
import { makeStore } from '@/state/store'

// On the server, observer components render once and must not subscribe (nothing would ever unsubscribe)
enableStaticRendering(typeof window === 'undefined')

export function Providers({ children }: { children: React.ReactNode }) {
  // Created per mount, not at module level: on the server a module-level store would be shared by all requests
  const [store] = useState(makeStore)
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: shouldRetry } } }))

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools />
      </QueryClientProvider>
    </Provider>
  )
}
