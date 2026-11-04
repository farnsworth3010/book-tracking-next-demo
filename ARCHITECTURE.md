# Architecture: feature folders, Bulletproof React style

## 1. Summary

This branch (`arch/feature-folders`) follows the project structure of
[bulletproof-react](https://github.com/alan2207/bulletproof-react) (`docs/project-structure.md`, and its
`apps/nextjs-app` variant for the App Router). Code is grouped by **feature** (`src/features/<name>/` with its own
`api/`, `components/`, `stores/`, schemas), next to a handful of **shared** folders (`components`, `lib`, `stores`,
`testing`) and the **app** layer (`src/app`: Next.js routes, layout, providers). Imports flow one way,
`shared -> features -> app`: a feature never imports another feature, and two features meet only in the app layer.
Other Bulletproof conventions adopted here: no barrel `index.ts` files inside features (import the exact file),
`@/` absolute imports across folders, kebab-case file names, and route-level components kept next to their route
in private `_components` folders, as `apps/nextjs-app` does. It is a pure refactor of the previous
feature-folders + `views/` layout: behaviour, routes, UI and all 40 test assertions are unchanged.

## 2. Source tree

```
src/
  app/                               app layer (Next.js App Router)
    layout.tsx  providers.tsx  page.tsx  error.tsx (+test)  not-found.tsx  globals.css
    _components/books-page.tsx (+test)          home route page component
    books/new/page.tsx
    books/new/_components/new-book-page.tsx (+test)
    books/[id]/page.tsx
    books/[id]/_components/book-page.tsx (+test)  composes books + reading-session
  features/
    books/
      api/books.ts (+test)           fetch functions, zod-parsed responses
      api/queries.ts                 TanStack Query keys, queries, mutations (optimistic update)
      components/                    book-card, book-form (RHF), books-list, quick-add-form (TanStack Form, +test), status-filter
      schemas/book.ts (+test)        zod schemas, inferred types, status labels
    reading-session/
      components/reading-session.tsx (+test)
      stores/reading-session-store.ts (+test)   MobX store
  components/                        shared UI
    message.tsx  view-toggle.tsx
    layouts/header.tsx (+test)
    errors/not-found-page.tsx (+test)
    ui/                              shadcn-generated (unchanged)
  stores/                            global client state: Redux store + ui slice (+test)
  lib/                               api-client.ts (request, HttpError), react-query.ts (retry policy, +test), utils.ts (cn)
  testing/                           vitest setup, next/navigation + next/link mocks, renderWithProviders, fixtures
```

`hooks/`, `utils/`, `types/`, `config/` from the Bulletproof template are not created: this app has nothing to put
in them. The lint rules already cover them should they appear.

## 3. Rules

| Folder | May import | Must not import |
|---|---|---|
| `src/app/**` | everything | a feature root (`@/features/books`): there are no barrels |
| `src/features/<x>/**` | its own files, shared folders | `@/app/**`, `@/features/<other>/**`, `../` paths, `export *` barrels |
| `src/components`, `lib`, `stores`, `hooks`, `utils`, `types`, `config` | each other, npm packages | `@/features/**`, `@/app/**`, `../` paths |
| `src/testing/**` | anything (test infrastructure) | — |

All files: kebab-case names.

Enforced by oxlint (`.oxlintrc.json`), so `npm run lint` fails on a violation:

- `no-restricted-imports` in per-folder `overrides`, the oxlint counterpart of Bulletproof's
  `import/no-restricted-paths` zones. Cross-feature imports use the gitignore-style group
  `["@/features/**", "!@/features/<own>/**"]`: oxlint's `regex` patterns run on Rust's regex engine, which has no
  lookahead, so "any feature except mine" cannot be written as a regex. Like Bulletproof, there is one override per
  feature, so a new feature needs its own entry.
- `../` imports are banned in features and shared folders, otherwise `../../reading-session/...` would slip past
  the alias-based patterns. Same-folder `./x` imports stay allowed.
- `oxc/no-barrel-file` (threshold 0) in features catches `export *` barrels; the app-layer pattern
  `^@/features/[^/]+/?$` catches importing a feature root, which covers `export { X } from` barrels too.
- `unicorn/filename-case` (kebab-case), Bulletproof's `check-file/filename-naming-convention`.

Each rule was checked by adding a throwaway violating file and running oxlint.

## 4. Moved files

| Old path | New path |
|---|---|
| `src/views/BooksPage.tsx` | `src/app/_components/books-page.tsx` (minus `BookList`, see below) |
| `src/views/BooksPage.test.tsx` | `src/app/_components/books-page.test.tsx` |
| — (split out of `BooksPage.tsx`) | `src/features/books/components/books-list.tsx` |
| `src/views/NewBookPage.tsx` | `src/app/books/new/_components/new-book-page.tsx` |
| `src/views/NewBookPage.test.tsx` | `src/app/books/new/_components/new-book-page.test.tsx` |
| `src/views/BookPage.tsx` | `src/app/books/[id]/_components/book-page.tsx` |
| `src/views/BookPage.test.tsx` | `src/app/books/[id]/_components/book-page.test.tsx` |
| `src/views/NotFoundPage.tsx` | `src/components/errors/not-found-page.tsx` |
| `src/views/NotFoundPage.test.tsx` | `src/components/errors/not-found-page.test.tsx` |
| `src/components/Header.tsx` | `src/components/layouts/header.tsx` |
| `src/components/Header.test.tsx` | `src/components/layouts/header.test.tsx` |
| `src/components/Message.tsx` | `src/components/message.tsx` |
| `src/components/ViewToggle.tsx` | `src/components/view-toggle.tsx` |
| `src/features/books/api.ts` | `src/features/books/api/books.ts` |
| `src/features/books/api.test.ts` | `src/features/books/api/books.test.ts` |
| `src/features/books/queries.ts` | `src/features/books/api/queries.ts` |
| `src/features/books/schema.ts` | `src/features/books/schemas/book.ts` |
| `src/features/books/schema.test.ts` | `src/features/books/schemas/book.test.ts` |
| `src/features/books/BookCard.tsx` | `src/features/books/components/book-card.tsx` |
| `src/features/books/BookForm.tsx` | `src/features/books/components/book-form.tsx` |
| `src/features/books/QuickAddForm.tsx` | `src/features/books/components/quick-add-form.tsx` |
| `src/features/books/QuickAddForm.test.tsx` | `src/features/books/components/quick-add-form.test.tsx` |
| `src/features/books/StatusFilter.tsx` | `src/features/books/components/status-filter.tsx` |
| `src/features/reading-session/ReadingSession.tsx` | `src/features/reading-session/components/reading-session.tsx` |
| `src/features/reading-session/ReadingSession.test.tsx` | `src/features/reading-session/components/reading-session.test.tsx` |
| `src/features/reading-session/readingSessionStore.ts` | `src/features/reading-session/stores/reading-session-store.ts` |
| `src/features/reading-session/readingSessionStore.test.ts` | `src/features/reading-session/stores/reading-session-store.test.ts` |
| `src/store/store.ts` | `src/stores/store.ts` |
| `src/store/uiSlice.ts` | `src/stores/ui-slice.ts` |
| `src/store/uiSlice.test.ts` | `src/stores/ui-slice.test.ts` |
| `src/lib/http.ts` | `src/lib/api-client.ts` |
| `src/lib/queryClient.ts` | `src/lib/react-query.ts` |
| `src/lib/queryClient.test.ts` | `src/lib/react-query.test.ts` |
| `src/test/*` (5 files) | `src/testing/*` (same names; `vitest.config.ts` `setupFiles` updated) |

Unchanged: `src/app/{layout,providers,page,error,not-found}.tsx`, `error.test.tsx`, the route `page.tsx` files
(only their imports), `src/lib/utils.ts`, `src/components/ui/*`, `components.json` (its aliases still match).

## 5. Decisions for this app

- **Page components live in the app layer** (`src/app/**/_components/`), not in features. This is what
  Bulletproof's Next.js variant does, and it resolves the one cross-feature import for free: `BookPage` renders
  the books edit form *and* the MobX `ReadingSession`, and the app layer is exactly where two features may meet.
  The alternative (page inside `features/books` with a `sidebar` slot prop filled by the route file) works too,
  but adds a prop that exists only to satisfy the rule. `_` makes the folder private, so Next.js never treats it as
  a route; no `pages/` directory is involved.
- **`BookList` split out of `BooksPage` into `features/books/components/books-list.tsx`.** It is pure books UI,
  and `quick-add-form.test.tsx` (inside the feature) used to render the whole `BooksPage` to see the list refresh,
  which would now be a feature -> app import. The test renders `<QuickAddForm /><BookList />` instead; its
  assertions are unchanged. The page itself is otherwise moved verbatim.
- **Redux ui slice in shared `src/stores/`**, where Bulletproof keeps global client state. The Redux store is
  app-wide infrastructure (`renderWithProviders` and `providers.tsx` build it), and `ViewToggle` sits in the shared
  header. Putting the slice into `features/books` would make the shared store import a feature. Awkward part:
  `booksView` is semantically books state living in a shared folder. With more feature slices, RTK's
  `combineSlices(...).inject` would let each feature inject its own slice into a shared root reducer.
- **`ViewToggle` stays a shared component** for the same reason: the header (shared layout) renders it, and it only
  depends on the shared store.
- **MobX** is feature-local state, so it went to `features/reading-session/stores/`, Bulletproof's slot for
  feature stores.
- **TanStack Query: fetchers and hooks stay in two files** (`api/books.ts`, `api/queries.ts`). Bulletproof puts
  one endpoint per file with the fetch function, query options and hook together (`get-books.ts`, ...). Here the
  tests mock the fetch layer with `vi.mock('@/features/books/api/books')`; a hook that calls a function from its
  own module cannot be intercepted that way, so colocating would mean rewriting the test mocks. Shared query keys
  (`bookKeys`) also argue for one file.
- **zod schemas in `features/books/schemas/book.ts`.** Bulletproof keeps entity types in a shared `types/api.ts`
  and input schemas inside each api file; here one schema drives response parsing, both forms, the URL filter and
  the inferred types, and only the books feature uses it, so it stays in the feature.
- **`NotFoundPage` became shared** (`components/errors/`): both `app/not-found.tsx` and the book page use it and it
  knows nothing about books.
- **`src/test` renamed to `src/testing`** (Bulletproof's name). It is exempt from the import rules, as in
  Bulletproof: `fixtures.ts` imports the `Book` type from the feature.
- **lib renames** to Bulletproof's names: `http.ts` -> `api-client.ts`, `queryClient.ts` -> `react-query.ts`.
  `utils.ts` keeps its name because shadcn's `components.json` points at `@/lib/utils`.
- **shadcn `ui/`** stays at `src/components/ui`, so `components.json` needs no change. Bulletproof puts its own
  shared components into `components/ui` too; here that folder is generated, so custom shared components sit one
  level up.
- **Kebab-case file names**, as Bulletproof enforces. Exported identifiers (`BooksPage`, `ReadingSessionStore`)
  are unchanged.

## 6. Pros and cons on this codebase

Pros:
- The import direction is now checked by `npm run lint`, not just described. A future "show the reading timer on
  the books list" change cannot quietly couple the two features; it has to go through the app layer.
- Deleting a feature is a folder delete plus fixing the app-layer files that compose it. The linter lists them.
- `src/app` reads as the app's map: every route and the page component it renders sit together, which also
  replaces the ambiguous `views/` folder.
- Close to the previous layout, so the diff is mostly renames. Low learning cost for anyone who has seen
  Bulletproof.

Cons:
- Overkill for this size: two features, five endpoints, four pages. `features/reading-session/` now has two
  subfolders holding one file each, and `components/layouts/` and `components/errors/` hold one file each.
- The rules need per-feature boilerplate in `.oxlintrc.json` (the regex engine has no lookahead), and the oxlint
  rule cannot express "any feature except mine" generically.
- Some placements are judgement calls the architecture does not settle: the books view mode lives in shared
  `stores/` and `ViewToggle` in shared `components/`, although both are about books.
- Page components in the app layer still hold real logic (`BookPage` owns the delete confirmation and the update
  mutation). Bulletproof would push those into feature components (`update-book`, `delete-book`), which is more
  files for no gain at this size; that is left undone in this pure refactor.
- Longer import paths (`@/features/books/components/book-form` instead of `@/features/books/BookForm`) and the
  `../` ban mean more typing inside a feature.
