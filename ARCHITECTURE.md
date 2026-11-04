# Architecture: Atomic Design

## 1. Summary

This branch arranges the UI by **Atomic Design**, the methodology Brad Frost described in *Atomic Design* (2013 blog
post, 2016 book), which borrows its levels from chemistry: **atoms** (the smallest UI primitives) combine into
**molecules** (small groups with one job), molecules and atoms make **organisms** (self-contained sections of an
interface), organisms are arranged into **templates** (page layouts with no real content), and a template filled
with real content is a **page**. Each level is defined by visual complexity, not by business domain. Atomic Design
is a methodology for UI and design systems only. It says nothing about data fetching, validation or state, so this
app adds three non-UI folders (`services/`, `state/`, `lib/`) beside the component levels.

## 2. Tree

```
src/
  app/                          Next.js routes (unchanged): layout, providers, page.tsx files, error, not-found
  views/                        Atomic "pages": BooksPage, BookPage, NewBookPage, NotFoundPage (+ tests)
  components/
    atoms/                      shadcn-generated: badge, button, card, field, input, label, native-select,
                                select, separator, textarea
    molecules/                  Message, StatusFilter, ViewToggle
    organisms/                  Header, BookCard, BookList, BookForm, QuickAddForm, ReadingSession,
                                DeleteBookCard (+ tests)
    templates/                  ListPageTemplate, DetailPageTemplate, FormPageTemplate
  services/
    books/                      schema.ts (zod model + labels), api.ts (fetch), queries.ts (TanStack Query) (+ tests)
  state/                        store.ts + uiSlice.ts (Redux Toolkit), readingSessionStore.ts (MobX) (+ tests)
  lib/                          http.ts, queryClient.ts (retry policy), utils.ts (shadcn `cn`)
  test/                         setup, next/navigation + next/link mocks, renderWithProviders, fixtures
```

## 3. Rules

UI levels, lowest first: `atoms` < `molecules` < `organisms` < `templates` < `views` < `app`.
**A level may import its own level and any level below it, never a level above.** Same-level imports are allowed
on purpose: shadcn's `field` imports `label` and `separator` (atom → atom), `BookList` renders `BookCard`
(organism → organism, which Frost explicitly allows), and `BookPage` renders `NotFoundPage` for a 404.

| Folder | May import | Must not import |
|---|---|---|
| `components/atoms` | other atoms, `@/lib/utils`, npm packages | molecules, organisms, templates, views, app, services, state |
| `components/molecules` | atoms, molecules, `@/services/*/schema` (types, labels), `@/state`, `@/lib` | organisms, templates, views, app, `@/services/*/api`, `@/services/*/queries` |
| `components/organisms` | atoms, molecules, organisms, services, state, lib | templates, views, app |
| `components/templates` | atoms, molecules, organisms | views, app, **services, state** (templates hold no real data) |
| `views` | everything below, other views | app |
| `app` | everything | — |
| `services`, `state` | each other, `lib`, npm packages | components, views, app |
| `lib` | npm packages | components, views, app, services, state |

**Enforcement:** `.oxlintrc.json` has one `overrides` entry per folder with an `eslint/no-restricted-imports`
`regex` pattern. The regexes match on path segments (`(^|/)organisms(/|$)`), so they catch both `@/components/...`
and relative `../organisms/...` imports. A violation is an `error`, so `npm run lint` fails. I checked each rule
with a temporary file that broke it (atom → organism, molecule → queries, organism → view, template → state,
state → `../components/...`, lib → state). Each one reported an error, and each file was deleted afterwards.

**Tests are exempt** (`**/*.test.{ts,tsx}` turns the rule off). `QuickAddForm.test.tsx` lives next to the organism
but renders the whole `BooksPage` view, because one assertion checks that the list refreshes after the add. Moving
or rewriting the test would change what it tests.

## 4. Moves

| Old path | New path |
|---|---|
| `src/components/ui/badge.tsx` | `src/components/atoms/badge.tsx` |
| `src/components/ui/button.tsx` | `src/components/atoms/button.tsx` |
| `src/components/ui/card.tsx` | `src/components/atoms/card.tsx` |
| `src/components/ui/field.tsx` | `src/components/atoms/field.tsx` (import paths only) |
| `src/components/ui/input.tsx` | `src/components/atoms/input.tsx` |
| `src/components/ui/label.tsx` | `src/components/atoms/label.tsx` |
| `src/components/ui/native-select.tsx` | `src/components/atoms/native-select.tsx` |
| `src/components/ui/select.tsx` | `src/components/atoms/select.tsx` |
| `src/components/ui/separator.tsx` | `src/components/atoms/separator.tsx` |
| `src/components/ui/textarea.tsx` | `src/components/atoms/textarea.tsx` |
| `src/components/Message.tsx` | `src/components/molecules/Message.tsx` |
| `src/components/ViewToggle.tsx` | `src/components/molecules/ViewToggle.tsx` |
| `src/features/books/StatusFilter.tsx` | `src/components/molecules/StatusFilter.tsx` |
| `src/components/Header.tsx` | `src/components/organisms/Header.tsx` |
| `src/components/Header.test.tsx` | `src/components/organisms/Header.test.tsx` |
| `src/features/books/BookCard.tsx` | `src/components/organisms/BookCard.tsx` |
| `src/features/books/BookForm.tsx` | `src/components/organisms/BookForm.tsx` |
| `src/features/books/QuickAddForm.tsx` | `src/components/organisms/QuickAddForm.tsx` |
| `src/features/books/QuickAddForm.test.tsx` | `src/components/organisms/QuickAddForm.test.tsx` |
| `src/features/reading-session/ReadingSession.tsx` | `src/components/organisms/ReadingSession.tsx` |
| `src/features/reading-session/ReadingSession.test.tsx` | `src/components/organisms/ReadingSession.test.tsx` |
| `src/features/books/schema.ts` | `src/services/books/schema.ts` |
| `src/features/books/schema.test.ts` | `src/services/books/schema.test.ts` |
| `src/features/books/api.ts` | `src/services/books/api.ts` |
| `src/features/books/api.test.ts` | `src/services/books/api.test.ts` |
| `src/features/books/queries.ts` | `src/services/books/queries.ts` |
| `src/features/reading-session/readingSessionStore.ts` | `src/state/readingSessionStore.ts` |
| `src/features/reading-session/readingSessionStore.test.ts` | `src/state/readingSessionStore.test.ts` |
| `src/store/store.ts` | `src/state/store.ts` |
| `src/store/uiSlice.ts` | `src/state/uiSlice.ts` |
| `src/store/uiSlice.test.ts` | `src/state/uiSlice.test.ts` |
| `BookList` inside `src/views/BooksPage.tsx` | `src/components/organisms/BookList.tsx` (moved verbatim) |
| delete card inside `BookDetails` in `src/views/BookPage.tsx` | `src/components/organisms/DeleteBookCard.tsx` (moved verbatim, owns its `confirmingDelete` state) |
| layout markup in `src/views/BooksPage.tsx` | `src/components/templates/ListPageTemplate.tsx` (new, slots: `title`, `toolbar`, `children`) |
| layout markup in `src/views/BookPage.tsx` | `src/components/templates/DetailPageTemplate.tsx` (new, slots: `title`, `children`, `aside`) |
| layout markup in `src/views/NewBookPage.tsx` | `src/components/templates/FormPageTemplate.tsx` (new, slots: `title`, `children`) |

Unmoved: `src/app/**`, `src/lib/**`, `src/test/**`, `src/views/**` (the views now compose templates and organisms
and have new import paths). Emptied and removed: `src/features/`, `src/store/`, `src/components/ui/`.

## 5. Decisions for this app

- **The pages level is `src/views/`, not `src/components/pages/`.** Next.js treats `src/pages` and `./pages` as the
  Pages Router. A nested `components/pages` would not be routed, but it is confusing next to `app/` and the
  assignment forbids it. The only documented way to keep a real `pages/` folder is `pageExtensions` (for example
  `page.tsx` only), which changes routing config just to win a naming argument. Views are what Frost calls pages:
  a template filled with real data. They read the URL, call the query hooks and pass results down. Route files in
  `app/` only render a view, so `app` is the top level.
- **shadcn's `ui` alias points to atoms** (`components.json`: `"ui": "@/components/atoms"`). `npx shadcn add`
  writes every component into that one alias folder and rewrites internal imports to it. Atoms are therefore
  exactly the generated shadcn files, and the generated content did not change (only `field.tsx`'s two
  `@/components/ui/*` import lines). The one hand-written primitive, `Message`, went to molecules so the atoms
  folder stays fully regenerable. I did not run `npx shadcn add` itself: it needs the network and would add files.
- **Non-UI code (the gap in Atomic Design):**
  - `src/services/books/` holds the book domain: the zod model and labels (`schema.ts`), the fetch layer
    (`api.ts`) and the TanStack Query hooks (`queries.ts`). Query hooks are React hooks, but they are server-state
    access, not UI, so they sit with the API they wrap. The cache keys and the optimistic update stay in one file.
  - `src/state/` holds client state: the Redux store and ui slice, and the MobX `ReadingSessionStore`. These moved
    out of `features/reading-session`, which used to keep the MobX store next to its only component.
  - `src/lib/` stays as it was, and its rule makes it truly app-agnostic (it imports nothing from the app).
- **Templates take slots (`children`, `toolbar`, `aside`) instead of importing organisms.** If a template imported
  the organisms it lays out, it would also pull in data: `BookList` calls `useBooks`, `BookCard` calls
  `useUpdateBook`. Slots keep the "no real data" rule enforceable (templates must not import `services`/`state`).
  The markup the views rendered is unchanged, so every test passes untouched.
- **Splits.** `BookList` was a private component inside `BooksPage`, and the delete confirmation was inline in
  `BookDetails`. Both moved out verbatim into organisms. `confirmingDelete` still resets on a book switch, because
  `DeleteBookCard` sits under the keyed `BookDetails`. No logic, markup or test changed.

### Classification arguments (where it felt forced)

- **`field.tsx` is a molecule by definition** (label + control + error), and so is the multi-part `card.tsx`. Both
  stay in atoms because shadcn decides the folder. The assignment's example "field = label + input + error" as a
  molecule does not exist as a separate file: `BookForm` and `QuickAddForm` assemble shadcn's
  `Field`/`FieldLabel`/`FieldError` inline. Extracting a `TextField` molecule would rewrite both forms, which is
  beyond a pure refactor.
- **`Message` is really an atom** (a single styled `<p>`). It lives in molecules only so that atoms stay "shadcn
  output only".
- **`ViewToggle` is a molecule that reads and writes Redux.** Atomic Design implies molecules are presentational.
  Making it controlled would need a connected wrapper, because its parent `Header` is a Server Component and
  cannot pass callbacks. So molecules may use `@/state`, and the rule only bans data fetching (`api`, `queries`).
- **`StatusFilter` (molecule) vs `BookList` (organism):** the line drawn here is that an organism may fetch or
  mutate data and own a section of the page, while a molecule takes props or global UI state. By looks alone,
  `StatusFilter` (a row of buttons) and `ReadingSession` (a card with buttons) are close. `ReadingSession` is an
  organism because it is a self-contained card with its own store.
- **`NotFoundPage`** is a page without data. It could be a template or an organism. It stays a view because the
  route `not-found.tsx` renders it and `BookPage` reuses it for a 404 (view → view).
- **Business logic has no natural home.** The optimistic update, URL ↔ filter parsing, and "404 → not found" live
  in whichever component happens to need them (`queries.ts`, `BooksPage`, `BookPage`). Atomic Design gives no
  guidance, and `services/` + `state/` are this repo's convention, not part of the methodology.

## 6. Pros and cons on this codebase

**Pros**
- Finding a UI piece by size is quick, and the shadcn output is isolated in one regenerable folder.
- The import rules are simple, directional and lint-enforced. Atoms and templates are provably data-free.
- The templates made the three page layouts explicit and reusable: `DetailPageTemplate` could take another
  detail page without copying the grid classes.
- Views got thinner: each is now "read the URL and the data, then fill a template".

**Cons**
- **Overkill for an app this size.** It has 1 domain, 4 screens and ~20 components. Splitting them over 4 component
  levels plus 3 non-UI folders spreads one feature (books) across `services/books`, `molecules`, `organisms` and
  `views`. Changing "how a book's status works" now touches four folders. The feature-folder layout on `main`
  kept that in one place.
- The levels describe size, not meaning. Several placements above are judgement calls the next developer could
  reasonably make differently, so the structure does not answer "where does X go?" by itself.
- Atomic Design is silent on data and logic, which is most of what this app's code does (queries, optimistic
  updates, two stores, zod). Those folders are an add-on with their own conventions.
- shadcn and Atomic Design disagree on granularity (`field`, `card`, `select` are compound components), and shadcn
  wins because it owns the folder.
- Tests had to be exempted from the import rules, because an integration test for an organism needs the page
  around it.
- The model fits a design-system library or a large UI with many shared visual pieces better than a small app
  with one domain. Here it adds navigation cost without much reuse in return.
