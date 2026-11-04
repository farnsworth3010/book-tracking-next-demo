import type { RouteObject } from 'react-router'
import { Layout } from '@/components/Layout'
import { RouteError } from '@/components/RouteError'
import { BooksPage } from '@/pages/BooksPage'
import { BookPage, NewBookPage } from '@/pages/lazyPages'
import { NotFoundPage } from '@/pages/NotFoundPage'

// Plain route objects: main.tsx builds a browser router from them, tests build a memory router
export const routes: RouteObject[] = [
  {
    path: '/',
    Component: Layout,
    children: [
      {
        // Pathless route: its error boundary replaces only the page, the header stays
        ErrorBoundary: RouteError,
        children: [
          { index: true, Component: BooksPage },
          { path: 'books/new', Component: NewBookPage },
          { path: 'books/:id', Component: BookPage },
          { path: '*', Component: NotFoundPage },
        ],
      },
    ],
  },
]
