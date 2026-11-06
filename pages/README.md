# Why this empty folder exists

Next.js looks for the Pages Router in `./pages` first and `./src/pages` second.
In Feature-Sliced Design `src/pages` is the **pages layer** (page components), not Next.js routes,
so this empty root `pages/` folder makes Next.js pick it instead and ignore `src/pages`.
Routes live in the root `app/` folder (App Router). Do not delete this folder; see ARCHITECTURE.md.
