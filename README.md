# book-tracking-next-demo

A small book tracker built to learn the modern React stack. It starts as a Vite SPA and will later move to Next.js.

## Run

```bash
npm install
npm run api    # json-server mock backend on http://localhost:3001 (data in db.json)
npm run dev    # Vite dev server; /api/* is proxied to json-server
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run api` | json-server REST API over `db.json` |
| `npm test` | Vitest in watch mode (`npx vitest run` for a single run) |
| `npm run lint` | Oxlint |
| `npm run build` | Type-check (`tsc -b`) and production build |

## Stack

Vite, React 19, TypeScript, React Router, TanStack Query, React Hook Form + Zod, TanStack Form (one demo form),
Redux Toolkit and MobX (one demo each), Tailwind CSS + shadcn/ui, Vitest + Testing Library.
