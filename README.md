# book-tracking-next-demo

A small book tracker built to learn the modern React stack. It started as a Vite SPA (tag `vite-spa`) and now runs on the Next.js App Router.

## Run

```bash
npm install
npm run api    # json-server mock backend on http://localhost:3001 (data in db.json)
npm run dev    # Next.js dev server; /api/* is rewritten to json-server
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run api` | json-server REST API over `db.json` |
| `npm test` | Vitest in watch mode (`npx vitest run` for a single run) |
| `npm run lint` | Oxlint |
| `npm run build` | Production build (`next build`, includes type checking) |
| `npm start` | Serve the production build |

## Stack

Next.js 16 (App Router), React 19, TypeScript, TanStack Query, React Hook Form + Zod, TanStack Form (one demo form),
Redux Toolkit and MobX (one demo each), Tailwind CSS + shadcn/ui, Vitest + Testing Library.
