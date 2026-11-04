import type { RouteObject } from 'react-router'
import { Layout } from '@/components/Layout'
import { BooksPage } from '@/pages/BooksPage'
import { NewBookPage } from '@/pages/NewBookPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

// Plain route objects: main.tsx builds a browser router from them, tests build a memory router
export const routes: RouteObject[] = [
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: BooksPage },
      { path: 'books/new', Component: NewBookPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
]
