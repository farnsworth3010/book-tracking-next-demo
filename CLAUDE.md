# CLAUDE.md

A learning project: a book tracker on the modern React stack, built step by step to teach React to a developer who
knows Angular well and React only from the class-component era. The next stage is a migration to Next.js.

## How to work here

- **TDD is mandatory.** For every change: write the failing test first, run it and see it fail (red), write the
  minimum code to pass (green), then refactor. No production code without a test that drove it.
- **Small steps.** Build one step at a time and stop after each so the user can review the code before moving on.
- **Teach while building.** Explain React concepts, architecture and the reasoning behind each choice in chat
  (in Russian), comparing with Angular where it helps.
- One component per "alternative" library, purely as a demo; the rest of the app uses the main choice
  (see the table below).
- Git config changes only with `--local`.

## Roadmap

1. Vite SPA, step by step — done; the last SPA commit is tagged `vite-spa`.
2. Migration to Next.js (current stage): App Router first with client pages, then Server Components,
   Server Actions, streaming and caching.
3. At the very end, architecture comparison: rebuild the same app in separate git branches, one per architecture
   (Feature-Sliced Design, Atomic Design, and others such as feature folders / layered), so the user can compare
   them side by side. Keep `main` on the current simple feature-folder layout until then.

## Commands

```bash
npm run api       # json-server on :3001 over db.json
npm run dev       # next dev; /api/* is rewritten to :3001 (next.config.ts)
npx vitest run    # tests once (npm test = watch mode)
npx tsc --noEmit  # type check (Vitest does not type check)
npm run lint      # oxlint (react, typescript, nextjs plugins)
npm run build     # next build (type checks with the local tsc CLI, TypeScript 7)
```

## Stack and where each library is used

| Concern | Main choice | Demo-only alternative |
|---|---|---|
| Framework | Next.js 16 App Router (Turbopack); docs for this exact version are in `node_modules/next/dist/docs/` | — |
| Routing | File routes in the root `app/`; `next/link`, `next/navigation` (`useRouter`, `useSearchParams`, `useParams`) | — |
| Server state | TanStack Query (`src/entities/book/api/queries.ts`, mutations in `src/features/*/model`) | — |
| Client state | Redux Toolkit (`src/app/store/`, slice in `src/features/toggle-books-view/`) | MobX (`src/features/reading-session/`) |
| Forms | React Hook Form + Zod (`BookForm`) | TanStack Form (`QuickAddForm`) |
| Validation | Zod (`src/entities/book/model/schema.ts`), also for API responses and URL params | — |
| UI kit | shadcn/ui in `src/shared/ui/` (generated, Tailwind inside; add via `npx shadcn add <name>`) | — |
| Own styles | Tailwind utilities in `className`, `cn` for conditional classes and overrides (no styled-components) | — |
| Tests | Vitest + Testing Library (jsdom), tests next to the code; `next/navigation` and `next/link` are mocked in `src/test/setup.ts`, render with `renderWithProviders` | — |
| Mock backend | json-server v1 (`db.json`, string ids, `?field=value` filters) | — |

## Layout

Feature-Sliced Design (see ARCHITECTURE.md for the rules, decisions and the old -> new path map).

```
db.json                       mock data for json-server
next.config.ts                rewrites /api/* to json-server
app/                          Next.js routes only: thin files re-exporting src/pages and src/app (layout, error, not-found, pages)
pages/README.md               empty on purpose, so Next.js does not read src/pages as the Pages Router
src/
  app/                        FSD app layer: layouts/RootLayout, providers, store (Redux config), styles/globals.css
  pages/                      one slice per screen: books, new-book, book, error, not-found
  widgets/                    header, book-list (composes BookCard + change-book-status)
  features/                   change-book-status, create-book, edit-book, delete-book, filter-books,
                              toggle-books-view (Redux slice + ViewToggle), reading-session (MobX demo)
  entities/book/              model (zod schema), api (fetch, query keys, reads, optimistic update), ui (BookCard, BookForm)
  shared/                     ui (shadcn-generated + Message, NotFound), api (request, HttpError), lib (cn, shouldRetry)
  test/                       setup, next/navigation + next/link mocks, renderWithProviders, fixtures (outside the layers)
```

- A layer imports only from layers below it; slices of one layer never import each other; outside a slice import
  only its `index.ts`, inside it use relative paths. `npm run lint` enforces this (`no-restricted-imports` per layer
  in `.oxlintrc.json`).
- `'use client'` marks the client boundary: page components, ViewToggle, providers, ErrorPage (and `app/error.tsx`).
  Route files and Header are Server Components.
- Stores and the QueryClient are created per mount in `src/app/providers`, never at module level (shared across
  requests on the server).

## Version notes

Newer majors than most tutorials: Next.js 16.4 (`error.tsx` gets `retry`, not only `reset`), MobX 7 / mobx-react-lite 5
(no `Provider`/`inject`, no legacy decorators), Zod 4, `@hookform/resolvers` 7, Vite 8 (only under Vitest now), TypeScript 7, Tailwind 4.
shadcn imports `cn` from the `cn` package (shadcn's replacement for clsx + tailwind-merge).
