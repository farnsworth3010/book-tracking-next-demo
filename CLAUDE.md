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

## Commands

```bash
npm run api       # json-server on :3001 over db.json
npm run dev       # Vite; /api/* is proxied to :3001
npx vitest run    # tests once (npm test = watch mode)
npm run lint      # oxlint
npm run build     # tsc -b + vite build
```

## Stack and where each library is used

| Concern | Main choice | Demo-only alternative |
|---|---|---|
| Build | Vite | — |
| Routing | React Router (`createBrowserRouter`, `RouterProvider` from `react-router/dom`) | — |
| Server state | TanStack Query (`src/features/books/queries.ts`) | — |
| Client state | Redux Toolkit (`src/store/`) | MobX (`src/features/reading-session/`) |
| Forms | React Hook Form + Zod (`BookForm`) | TanStack Form (`QuickAddForm`) |
| Validation | Zod (`src/features/books/schema.ts`), also for API responses and URL params | — |
| UI kit | shadcn/ui in `src/components/ui/` (generated, Tailwind inside; add via `npx shadcn add <name>`) | — |
| Own styles | styled-components (layout and app components); no Tailwind utilities in our own code | — |
| Tests | Vitest + Testing Library (jsdom), tests next to the code as `*.test.ts(x)` | — |
| Mock backend | json-server v1 (`db.json`, string ids, `?field=value` filters) | — |

## Layout

```
db.json                       mock data for json-server
src/
  main.tsx                    entry: providers + router
  features/books/             schema (zod), api (fetch), queries, forms, book components
  features/reading-session/   MobX demo store + component
  store/                      Redux Toolkit store and slices
  pages/                      route components
  components/                 shared app components; ui/ is shadcn-generated
  lib/utils.ts                shadcn `cn` helper
  test/setup.ts               jest-dom matchers, cleanup
```

## Version notes

Newer majors than most tutorials: React Router 8 (no `react-router-dom`), MobX 7 / mobx-react-lite 5
(no `Provider`/`inject`, no legacy decorators), Zod 4, `@hookform/resolvers` 7, Vite 8, TypeScript 7, Tailwind 4.
shadcn imports `cn` from the `cn` package (shadcn's replacement for clsx + tailwind-merge).
