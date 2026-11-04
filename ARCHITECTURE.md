# Architecture: Layered (by technical type)

## 1. Summary

The top-level folder of every file is its **technical role** — component, hook, service, store, schema — not the
business feature it belongs to. This is the classic structure of most React tutorials and starters (create-react-app
era `components/ hooks/ services/ utils/`), a frontend take on the n-tier "presentation → business → data" layering.
Dependencies point one way, from the UI down to plain utilities:
`app → views → components → hooks → services / stores → schemas → lib`. There are no feature folders: the books
feature now lives in seven folders at once (`views`, `components`, `hooks`, `services`, `schemas`, `test`, plus
`stores` for its UI state).

## 2. Tree

```
src/
  app/            Next.js routes only: layout, providers (client), page.tsx files, error, not-found
    books/[id]/ books/new/
  views/          page components rendered by the route files: BooksPage, NewBookPage, BookPage, NotFoundPage
  components/     every app component: BookCard, BookForm, QuickAddForm, StatusFilter, ReadingSession,
                  Header, Message, ViewToggle
    ui/           shadcn/ui primitives (generated)
  hooks/          books.ts (TanStack Query keys + hooks), redux.ts (typed useAppSelector/useAppDispatch)
  services/       booksApi.ts (fetch + zod parsing), http.ts (request, HttpError), queryClient.ts (retry policy)
  stores/         store.ts + uiSlice.ts (Redux Toolkit), readingSessionStore.ts (MobX)
  schemas/        book.ts (zod schemas, inferred types, status labels)
  lib/            utils.ts (shadcn `cn`)
  test/           setup, next/navigation + next/link mocks, renderWithProviders, fixtures
```

## 3. Rules

A layer may import from any layer **below** it (relaxed layering: skipping down is allowed), never from one above.
Same-layer imports are fine (`BookPage` renders `NotFoundPage`, `Header` renders `ViewToggle`).

| Layer | May import | Must not import |
|---|---|---|
| `app` | everything | — |
| `views` | components, hooks, services (`HttpError` only), stores, schemas, lib | app, `services/booksApi` |
| `components` | components, hooks, stores, schemas, lib | app, views, `services/booksApi` |
| `hooks` | services, stores, schemas, lib | app, views, components |
| `services`, `stores` | each other, schemas, lib | app, views, components, hooks |
| `schemas` | lib | everything above |
| `lib` | nothing internal | everything |
| `test` | anything (test infrastructure) | — |

The extra rule "UI never imports `services/booksApi`" makes the hooks layer the only door to the backend; views may
still import `HttpError` to tell a 404 from a crash.

**Enforcement:** oxlint `no-restricted-imports` with per-folder `overrides` in `.oxlintrc.json`, so `npm run lint`
fails on a violation (checked by adding throw-away violating files in `lib`, `hooks` and `components`). Test files
(`*.test.ts(x)`) are exempt: they mock `@/services/booksApi` and render whole views. Limit: the patterns match the
`@/…` alias; a relative `../views/x` import would slip through. The code uses the alias for every cross-folder import.

## 4. Moved files

| Old path | New path |
|---|---|
| `src/features/books/schema.ts` | `src/schemas/book.ts` |
| `src/features/books/schema.test.ts` | `src/schemas/book.test.ts` |
| `src/features/books/api.ts` | `src/services/booksApi.ts` |
| `src/features/books/api.test.ts` | `src/services/booksApi.test.ts` |
| `src/lib/http.ts` | `src/services/http.ts` |
| `src/lib/queryClient.ts` | `src/services/queryClient.ts` |
| `src/lib/queryClient.test.ts` | `src/services/queryClient.test.ts` |
| `src/features/books/queries.ts` | `src/hooks/books.ts` |
| `src/store/store.ts` | `src/stores/store.ts` (typed hooks split out ↓) |
| `src/store/store.ts` (`useAppSelector`, `useAppDispatch`) | `src/hooks/redux.ts` |
| `src/store/uiSlice.ts` | `src/stores/uiSlice.ts` |
| `src/store/uiSlice.test.ts` | `src/stores/uiSlice.test.ts` |
| `src/features/reading-session/readingSessionStore.ts` | `src/stores/readingSessionStore.ts` |
| `src/features/reading-session/readingSessionStore.test.ts` | `src/stores/readingSessionStore.test.ts` |
| `src/features/reading-session/ReadingSession.tsx` | `src/components/ReadingSession.tsx` |
| `src/features/reading-session/ReadingSession.test.tsx` | `src/components/ReadingSession.test.tsx` |
| `src/features/books/BookCard.tsx` | `src/components/BookCard.tsx` |
| `src/features/books/BookForm.tsx` | `src/components/BookForm.tsx` |
| `src/features/books/QuickAddForm.tsx` | `src/components/QuickAddForm.tsx` |
| `src/features/books/QuickAddForm.test.tsx` | `src/components/QuickAddForm.test.tsx` |
| `src/features/books/StatusFilter.tsx` | `src/components/StatusFilter.tsx` |

Unchanged location (imports updated only): `src/app/**`, `src/views/**`, `src/components/{Header,Message,ViewToggle}`,
`src/components/ui/**`, `src/lib/utils.ts`, `src/test/**`. `components.json` needs no change: its aliases
(`@/components/ui`, `@/lib/utils`, `@/hooks`) already match this layout.

## 5. Decisions for this app

- **TanStack Query → `hooks/books.ts`, one module, not one file per hook.** `bookKeys` and the optimistic update /
  invalidation logic are shared by all five hooks; splitting into `useBooks.ts`, `useBook.ts`… would scatter one
  cache policy across six files.
- **Typed Redux hooks → `hooks/redux.ts`.** They were in `store.ts`; a store must not depend on React hooks in this
  layering, so they moved up a layer. `store.ts` still exports `RootState` / `AppDispatch` for them.
- **Redux and MobX side by side in `stores/`.** The folder says "state container", not "which library". The MobX
  `ReadingSessionStore` and its `ReadingSession` component, which used to share a folder, are now two folders apart.
- **zod → `schemas/book.ts`.** `STATUS_LABELS` (display strings) stayed with the schema it is keyed by; strictly it is
  presentation, but moving it would mean a new file for three strings.
- **Retry policy → `services/queryClient.ts`, not `lib/`.** It checks `instanceof HttpError`, and `HttpError` is now
  in `services`. Leaving it in `lib` would make the bottom layer import a higher one. It describes which transport
  errors are transient, so it sits next to `http.ts`.
- **shadcn stays in `components/ui`.** The generated files are untouched; `components.json` aliases unchanged.
- **No code changes beyond imports**, except splitting the two typed hooks out of `store.ts`. No slot props were
  needed: nothing in the old code imported upward.

Awkward spots:
- `views` reaching into `services` for `HttpError` — the classic layered rule "UI talks only to hooks" does not hold
  cleanly; the rule had to be narrowed to `booksApi`.
- `QuickAddForm.test.tsx` (in `components`) renders `BooksPage` (a view), because the test is about the list
  refreshing after a quick add. Fine for a test, but it is a component test that depends on a page.
- `components/` is now a flat bag of 8 app components plus `ui/`; nothing says which ones are about books.

## 6. Pros and cons on this codebase

Pros:
- Zero learning curve: anyone who has seen a React tutorial knows where a hook or a service goes.
- Easy to enforce: one oxlint override per folder, simple "below only" rules.
- Swapping a technology is local: all Redux/MobX code is in `stores/`, all fetch code in `services/`.
- For an app this size (one entity, four pages) it is perfectly adequate and probably the least overhead of all
  the variants.

Cons:
- One feature is spread over seven folders; changing "books" (e.g. adding a field) touches `schemas`, `services`,
  `hooks`, `components`, `views` and `test/fixtures`. Feature folders kept most of that in one place.
- Cohesion is lost: `ReadingSession` and its store, `BookForm` and its schema, now live apart.
- Folders grow without bound: `components/` and `hooks/` would become long flat lists as features are added, and
  nothing in the structure separates generic components (`Message`) from domain ones (`BookCard`).
- No notion of a public API per feature: any component can import any hook or store.
- Rules by layer do not stop features from coupling to each other — there is only one feature here, so this cost
  is not visible yet.
