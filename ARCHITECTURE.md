# Architecture: Feature-Sliced Design (branch `arch/fsd`)

## 1. Summary

[Feature-Sliced Design](https://feature-sliced.design) (FSD) is a frontend methodology that grew out of the
Russian-speaking React community (v2 spec, maintained at feature-sliced.design). Code is split along three axes:
**layers** (fixed and ordered by responsibility: `app` → `pages` → `widgets` → `features` → `entities` → `shared`),
**slices** inside a layer (one per business concept: `book`, `create-book`, `header`…), and **segments** inside a
slice (by technical purpose: `ui`, `model`, `api`, `lib`, `config`). A module may import only from layers *below*
its own, slices of the same layer never import each other, and everything outside a slice goes through that slice's
public API (`index.ts`). This branch follows the official
[FSD guide for Next.js](https://feature-sliced.design/docs/guides/tech/with-nextjs): Next.js routing lives in a
root `app/` folder of thin re-export files, the FSD layers live in `src/`, and an empty root `pages/` folder keeps
Next.js from treating `src/pages` (the FSD pages layer) as the Pages Router.

## 2. Tree

```
app/                          Next.js App Router: thin route files only (re-exports of src/pages and src/app)
  layout.tsx  page.tsx  error.tsx  not-found.tsx  books/new/page.tsx  books/[id]/page.tsx
pages/README.md               empty on purpose: stops Next.js from reading src/pages as the Pages Router
src/
  app/                        FSD app layer (segments, no slices)
    layouts/RootLayout.tsx    <html>, Providers, Header widget, metadata
    providers/Providers.tsx   Redux + TanStack Query providers (client boundary), MobX static rendering
    store/store.ts            Redux store config: combines slices from lower layers
    styles/globals.css        Tailwind + shadcn theme
    index.ts                  public API for the root app/ route files
  pages/                      FSD pages layer: one slice per screen
    books/      ui/BooksPage (+ tests)          new-book/  ui/NewBookPage (+ test)
    book/       ui/BookPage (+ test)            error/     ui/ErrorPage (+ test)
    not-found/  index.ts (re-exports shared/ui/NotFound)
  widgets/
    header/     ui/Header (+ test)              book-list/ ui/BookList
  features/
    change-book-status/  ui/BookStatusSelect
    create-book/         model/useCreateBook, ui/CreateBookForm, ui/QuickAddForm
    edit-book/           ui/EditBookForm
    delete-book/         model/useDeleteBook, ui/DeleteBookCard
    filter-books/        ui/StatusFilter
    toggle-books-view/   model/uiSlice (Redux), ui/ViewToggle
    reading-session/     model/readingSessionStore (MobX), ui/ReadingSession (+ tests)
  entities/
    book/       model/schema (zod), api/bookApi (fetch), api/queries (keys, reads, update), ui/BookCard, ui/BookForm
  shared/
    api/        http (request, HttpError)
    lib/        utils (cn), queryRetry (shouldRetry)
    ui/         shadcn components, Message, NotFound
  test/         test infrastructure, outside the layers (setup, next/* mocks, renderWithProviders, fixtures)
```

Every slice has an `index.ts`; `shared/api` and `shared/lib` have one per segment. `shared/ui` has none: each
component is imported by path (`@/shared/ui/button`), which is what shadcn generates and what FSD recommends for
`shared/ui` to avoid one huge barrel.

## 3. Rules

| Code in | May import |
|---|---|
| root `app/` (routes) | `@/app`, `@/pages/<slice>` (public APIs only), `@/shared/*` |
| `src/app` | every layer below, through public APIs |
| `src/pages/<slice>` | its own files (relative), `widgets`, `features`, `entities` (public APIs), `shared` |
| `src/widgets/<slice>` | own files, `features`, `entities` (public APIs), `shared` |
| `src/features/<slice>` | own files, `entities` (public APIs), `shared` |
| `src/entities/<slice>` | own files, `shared` |
| `src/shared` | `shared` only (segments may use each other; there are no slices) |
| `src/test` | anything (only test files import it) |

Inside a slice imports are relative (`../model/useCreateBook`); `@/<layer>/<same-slice>` is rejected so a slice
never imports itself through its own public API.

**Enforcement**: `.oxlintrc.json` has one `overrides` entry per layer with `no-restricted-imports` regex patterns:

- upward / same-layer imports: e.g. in `src/features/**` anything matching `^@/(app|pages|widgets|features)(/|$)`;
- deep imports past a public API: `^@/(entities|features|…)/[^/]+/` (e.g. `@/entities/book/ui/BookForm`);
- relative imports that leave the slice: `^\.\./\.\./`.

All three were checked with throwaway violating files (they fail `npm run lint` with an explanation). Not
enforced: `vi.mock('@/entities/book/api/bookApi')` in page tests is a string, not an import, so it may (and has to)
point inside a slice; and `src/test` is deliberately unrestricted. Steiger (the official FSD linter) would also
check slice naming and unused public API, but it is not installed.

## 4. Old path → new path

| Old | New |
|---|---|
| `src/app/layout.tsx` | `src/app/layouts/RootLayout.tsx` (named `RootLayout`) + `app/layout.tsx` (re-export) |
| `src/app/page.tsx` | `app/page.tsx` |
| `src/app/books/new/page.tsx` | `app/books/new/page.tsx` |
| `src/app/books/[id]/page.tsx` | `app/books/[id]/page.tsx` |
| `src/app/not-found.tsx` | `app/not-found.tsx` |
| `src/app/error.tsx` | `src/pages/error/ui/ErrorPage.tsx` (named `ErrorPage`) + `app/error.tsx` (re-export) |
| `src/app/error.test.tsx` | `src/pages/error/ui/ErrorPage.test.tsx` |
| `src/app/providers.tsx` | `src/app/providers/Providers.tsx` |
| `src/app/globals.css` | `src/app/styles/globals.css` |
| `src/store/store.ts` | `src/app/store/store.ts` |
| `src/store/uiSlice.test.ts` | `src/app/store/store.test.ts` |
| `src/store/uiSlice.ts` | `src/features/toggle-books-view/model/uiSlice.ts` |
| `src/components/ViewToggle.tsx` | `src/features/toggle-books-view/ui/ViewToggle.tsx` |
| `src/components/Header.tsx`, `Header.test.tsx` | `src/widgets/header/ui/Header.tsx`, `Header.test.tsx` |
| `src/components/Message.tsx` | `src/shared/ui/Message.tsx` |
| `src/components/ui/*.tsx` (10 files) | `src/shared/ui/*.tsx` |
| `src/lib/http.ts` | `src/shared/api/http.ts` |
| `src/lib/utils.ts` | `src/shared/lib/utils.ts` |
| `src/lib/queryClient.ts`, `queryClient.test.ts` | `src/shared/lib/queryRetry.ts`, `queryRetry.test.ts` |
| `src/features/books/schema.ts`, `schema.test.ts` | `src/entities/book/model/schema.ts`, `schema.test.ts` |
| `src/features/books/api.ts`, `api.test.ts` | `src/entities/book/api/bookApi.ts`, `bookApi.test.ts` |
| `src/features/books/queries.ts` | `src/entities/book/api/queries.ts` (keys, `useBooks`, `useBook`, `useUpdateBook`); `useCreateBook` → `src/features/create-book/model/useCreateBook.ts`; `useDeleteBook` → `src/features/delete-book/model/useDeleteBook.ts` |
| `src/features/books/BookCard.tsx` | `src/entities/book/ui/BookCard.tsx` (status select → `src/features/change-book-status/ui/BookStatusSelect.tsx`) |
| `src/features/books/BookForm.tsx` | `src/entities/book/ui/BookForm.tsx` |
| `src/features/books/QuickAddForm.tsx` | `src/features/create-book/ui/QuickAddForm.tsx` |
| `src/features/books/QuickAddForm.test.tsx` | `src/pages/books/ui/QuickAddForm.test.tsx` |
| `src/features/books/StatusFilter.tsx` | `src/features/filter-books/ui/StatusFilter.tsx` |
| `src/features/reading-session/readingSessionStore.ts` (+ test) | `src/features/reading-session/model/readingSessionStore.ts` (+ test) |
| `src/features/reading-session/ReadingSession.tsx` (+ test) | `src/features/reading-session/ui/ReadingSession.tsx` (+ test) |
| `src/views/BooksPage.tsx`, `BooksPage.test.tsx` | `src/pages/books/ui/BooksPage.tsx`, `BooksPage.test.tsx`; its inner `BookList` → `src/widgets/book-list/ui/BookList.tsx` |
| `src/views/NewBookPage.tsx`, `NewBookPage.test.tsx` | `src/pages/new-book/ui/…`; the form card → `src/features/create-book/ui/CreateBookForm.tsx` |
| `src/views/BookPage.tsx`, `BookPage.test.tsx` | `src/pages/book/ui/…`; edit card → `src/features/edit-book/ui/EditBookForm.tsx`, delete card → `src/features/delete-book/ui/DeleteBookCard.tsx` |
| `src/views/NotFoundPage.tsx`, `NotFoundPage.test.tsx` | `src/shared/ui/NotFound.tsx`, `NotFound.test.tsx` (+ `src/pages/not-found/index.ts` re-export) |
| `src/test/*` | unchanged (imports updated) |
| — (new) | `pages/README.md`, every `index.ts` |

Config: `tsconfig.json` includes `app`; `components.json` aliases point at `@/shared/ui`, `@/shared/lib/utils`,
`@/shared/lib`, and its CSS path at `src/app/styles/globals.css`; `.oxlintrc.json` gained the layer overrides.

## 5. Decisions for this app

- **Next.js routing.** Root `app/` holds only re-exports (`export { BookPage as default } from '@/pages/book'`).
  `app/page.tsx` keeps its `<Suspense>` around `BooksPage`: that boundary exists only so Next.js can prerender
  around `useSearchParams`, a routing concern, so it stays in the route file. `app/error.tsx` keeps
  `'use client'` on the route file itself, since Next.js requires error files to be Client Components.
- **The empty root `pages/` has a cost.** With both `app/` and `pages/` present, Next.js writes
  `navigation-types/compat/navigation` into `next-env.d.ts`, which types `useParams`, `useSearchParams` and
  `usePathname` as possibly `null` (true only for components shared with the Pages Router). `next build` failed
  on that, so `BooksPage` and `BookPage` add a `!` to those calls, with a comment. No runtime change.
- **zod** schemas, types and status labels → `entities/book/model`. They are the entity's definition.
- **TanStack Query.** Fetch functions, query keys and read hooks → `entities/book/api` (FSD's React Query guide
  puts queries in the entity's `api` segment). Mutations go to the feature that performs them
  (`useCreateBook` → `create-book`, `useDeleteBook` → `delete-book`), **except `useUpdateBook`**: the optimistic
  update is used by both `change-book-status` (card select) and `edit-book` (form), and features cannot import each
  other, so it moved down to the entity. That is the usual FSD answer ("shared by two slices → go one layer
  down"), but it leaves mutations split across two layers.
- **BookCard and the status select (slot).** The entity card must not import a feature, so `BookCard` gained a
  `statusSlot` prop and the `book-list` widget composes `<BookCard statusSlot={<BookStatusSelect book={book} />} />`.
  The select and its error message come from one mutation, so both live in the slot. To keep the error on its own
  line under the row, the row got `flex-wrap` and the error `basis-full order-last`: same look, but in the DOM the
  error now comes before the page count.
- **BookForm** is used by create and edit, so it is entity UI (`entities/book/ui`): a pure form over the
  entity's schema with `onSubmit` from outside. `CreateBookForm` / `EditBookForm` (features) wire it to mutations.
- **Extracted features.** `CreateBookForm`, `EditBookForm` and `DeleteBookCard` are JSX moved out of the old
  views unchanged, so the pages only compose. FSD 2.1's "pages first" advice would allow leaving code used by one
  page inside that page; the split follows the requested mapping instead.
- **Redux.** The `ui` slice (books view) lives in `features/toggle-books-view/model`; the store config in
  `app/store` imports it (the app layer may). The typed `useAppSelector` / `useAppDispatch` were removed: they need
  `RootState` from the app layer, which lower layers cannot import. `ViewToggle` and `BookList` use plain
  `useSelector(selectBooksView)` (still typed, since RTK slice selectors carry their state type) and `useDispatch()`.
  A slice that needs thunks would bring the problem back (FSD's usual workaround is a global `RootState` declaration).
- **MobX reading session** → a feature (`features/reading-session`): a user interaction with its own state that
  needs no other slice. A widget would also fit, but nothing here composes it.
- **NotFound.** `BookPage` renders the not-found view for a 404 book, and pages cannot import each other, so the
  view went to `shared/ui/NotFound` and `pages/not-found` only re-exports it.
- **ErrorPage** is in the pages layer (`pages/error`) like not-found, as a named export; the route file maps it to
  `default`.
- **shadcn** → `shared/ui` (aliases updated in `components.json`; `npx shadcn add` keeps working). Only one
  generated file changed: `field.tsx`'s imports of `label` and `separator`. `shared/config` was not created:
  nothing in this app is config.
- **Tests.** They moved with their code. Two did not land next to their subject: `uiSlice.test` became
  `app/store/store.test.ts` (it exercises `makeStore`, which only the app layer may import), and
  `QuickAddForm.test` went to `pages/books` (it renders `BooksPage` to check that the list refreshes). Page tests
  now `vi.mock('@/entities/book/api/bookApi')` (only the fetch module) and import the mocked functions through
  `@/entities/book`, which re-exports the same mocked bindings. `src/test` stays outside the layers since
  `renderWithProviders` needs the app store and fixtures need the entity type.

## 6. Pros and cons on this codebase

**Pros**
- Composition is explicit: you see at a glance that `book-list` = entity card + status feature, and that
  `BookPage` = edit + delete + reading session.
- The import rules are machine-checked by the existing linter, so the structure cannot silently decay.
- Clear homes: "where does a new user action go?" → a new `features/<verb>-book` slice; "a new screen?" →
  `pages/<name>` + a one-line route file.
- Next.js is pushed to the edge: the route folder is just a list of URLs, and swapping the router would leave
  `src/` untouched.

**Cons**
- Heavy for an app this size: 44 non-test source files became 71 (18 of them `index.ts`, plus 6 route files),
  up to 5 directory levels deep for a 4-screen CRUD app. Most features hold one or two files.
- The Next.js integration is a workaround: two `app` folders with different meanings, an empty `pages/` folder,
  and nullable navigation types that needed `!`.
- The "no cross-imports between slices" rule forced non-obvious moves: `useUpdateBook` into the entity, NotFound
  into `shared`, the error message of the status select into a CSS trick, typed Redux hooks removed.
- Deciding feature vs widget vs entity UI (`BookForm`? `ReadingSession`?) is a judgment call each time, and the
  layer names (`pages`, `app`) clash with Next.js vocabulary, which confuses newcomers.
- Barrels everywhere: a server component that imports `@/features/toggle-books-view` also pulls in the Redux slice
  module. Harmless here, but barrels and the client/server split need care in a larger Next.js app.

Verdict: FSD pays off when several teams share a large frontend with many entities and cross-cutting features.
For this tracker, the simple feature-folder layout on `main` was easier to read; FSD's value here is the lint-checked
dependency direction and practice for bigger codebases.
