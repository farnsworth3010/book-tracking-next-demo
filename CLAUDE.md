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
| Routing | File routes in `src/app/`; `next/link`, `next/navigation` (`useRouter`, `useSearchParams`, `useParams`) | — |
| Server state | TanStack Query (`src/services/books/queries.ts`) | — |
| Client state | Redux Toolkit (`src/state/`) | MobX (`src/state/readingSessionStore.ts`) |
| Forms | React Hook Form + Zod (`BookForm`) | TanStack Form (`QuickAddForm`) |
| Validation | Zod (`src/services/books/schema.ts`), also for API responses and URL params | — |
| UI kit | shadcn/ui in `src/components/atoms/` (generated, Tailwind inside; add via `npx shadcn add <name>`) | — |
| Own styles | Tailwind utilities in `className`, `cn` for conditional classes and overrides (no styled-components) | — |
| Tests | Vitest + Testing Library (jsdom), tests next to the code; `next/navigation` and `next/link` are mocked in `src/test/setup.ts`, render with `renderWithProviders` | — |
| Mock backend | json-server v1 (`db.json`, string ids, `?field=value` filters) | — |

## Layout

Atomic Design (Brad Frost): UI is split by visual complexity; see ARCHITECTURE.md for the rules and trade-offs.

```
db.json                         mock data for json-server
next.config.ts                  rewrites /api/* to json-server
src/
  app/                          Next.js routes only: layout, providers (client), page.tsx files, error, not-found
  views/                        the Atomic "pages" level: templates filled with real data (not `pages/`: Pages Router)
  components/
    atoms/                      shadcn-generated primitives (components.json `ui` alias points here)
    molecules/                  small single-purpose groups: Message, StatusFilter, ViewToggle
    organisms/                  self-contained blocks: Header, BookCard, BookList, BookForm, QuickAddForm,
                                ReadingSession, DeleteBookCard
    templates/                  slot-based page layouts with no data: ListPage, DetailPage, FormPage
  services/books/               non-UI: book model (zod schema, labels), api (fetch), TanStack Query hooks
  state/                        non-UI: Redux Toolkit store + ui slice, MobX reading-session store
  lib/                          app-agnostic helpers: http (request, HttpError), query retry policy, shadcn `cn`
  test/                         setup, next/navigation + next/link mocks, renderWithProviders, fixtures
```

- Import direction: a level imports its own level and the ones below (atoms < molecules < organisms < templates
  < views < app), never above. Enforced by `no-restricted-imports` overrides in `.oxlintrc.json`; tests are exempt.
- `'use client'` marks the client boundary: views, ViewToggle, providers, error. Route files and Header are
  Server Components.
- Stores and the QueryClient are created per mount in `providers.tsx`, never at module level (shared across
  requests on the server).

## Version notes

Newer majors than most tutorials: Next.js 16.4 (`error.tsx` gets `retry`, not only `reset`), MobX 7 / mobx-react-lite 5
(no `Provider`/`inject`, no legacy decorators), Zod 4, `@hookform/resolvers` 7, Vite 8 (only under Vitest now), TypeScript 7, Tailwind 4.
shadcn imports `cn` from the `cn` package (shadcn's replacement for clsx + tailwind-merge).
