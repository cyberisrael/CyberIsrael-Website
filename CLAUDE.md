# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Commands

```bash
npm run dev            # Vite dev server on http://localhost:3000
npm run cms            # Decap CMS local proxy, so /admin writes to the working tree
npm run build          # tsc typecheck + vite production build -> dist/
npm run preview        # Serve the production build locally
npm run lint           # ESLint over src, .ts/.tsx, zero warnings allowed
```

There is no test suite/runner configured in this repo. `npm run lint` uses `eslint.config.js`-style flat config resolution but **no eslint config file currently exists at the project root** — running `npm run lint` will fail until one is added.

Docker: `docker compose up --build -d` builds via the multi-stage `Dockerfile` (Node build stage -> nginx serve stage) and serves on port 80 using `nginx/nginx.conf`. The compose file has commented-out placeholders for a future Node backend + Postgres + Redis — not currently active. This is **not** how cyberisrael.net is served.

Deployment: Cloudflare Workers Builds deploys this repo directly — `main` runs the Deploy command and goes live, every other branch only runs the Version command and uploads a preview. All deploy configuration belongs in `wrangler.jsonc`; the dashboard commands must stay bare, because a flag there silently overrides the file. `@cloudflare/vite-plugin` generates `dist/cyberisrael_website/wrangler.json` (pointing `assets.directory` at `dist/client`) plus a `.wrangler/deploy/config.json` pointer, which is why plain `npx wrangler deploy` needs no `--assets`. Verify any change with `npm run build && npx wrangler deploy --dry-run`. See `docs/deployment.md`.

## Architecture

React 18 + TypeScript SPA built with Vite, using the `@/*` -> `src/*` path alias (configured in both `tsconfig.json` and `vite.config.ts`).

**Routing & shell** (`src/App.tsx`): `BrowserRouter` wraps every route in `RootLayout` (`src/components/layout/RootLayout.tsx`), which renders the persistent `ParticleBackground`, `Navbar`, and `Footer` around a `<Outlet>` with `AnimatePresence`-based page transitions. All page components except `App.tsx` itself are lazy-loaded (`React.lazy`) for code splitting. Vite's `manualChunks` further splits `vendor` (react/react-dom/router), `animations` (framer-motion), and `i18n` (i18next/react-i18next) into separate bundles.

**Global providers**: `ThemeProvider` (`src/context/ThemeContext.tsx`) and `LangProvider` (`src/context/LangContext.tsx`) wrap the router in `App.tsx`, in that order. Both persist to `localStorage` (`cyberisrael-theme`, `cyberisrael-lang`) and mutate `document.documentElement` directly (theme toggles a `dark`/`light` class for Tailwind's `darkMode: 'class'`; lang sets `dir`/`lang` attributes for RTL). Any component reading theme/lang must use `useTheme()`/`useLang()` — there's no prop-drilling path.

**i18n**: `src/i18n.ts` initializes i18next with static resource objects from `src/translations/{en,he}/index.ts`. Hebrew renders RTL end-to-end. `LangContext.isRTL` is derived from the lang, not a separate flag.

**Pages** (`src/pages/`): `HomePage` is a stack of section components (`Hero`, `About`, `Values`, `Articles`, `Events`, `Social`, `Join` — under `src/components/sections/`, with some further split into `sections/subSections/`). Other routes (`ArticlesPage`, `ArticlePage`, `ImpactPage`, `CollaboratePage`, `ComingSoonPage`, `NotFoundPage`) are standalone.

**Articles system** — this is the most involved subsystem and spans several files:
- Each article is a single Markdown file at `public/articles/<slug>/<slug>.md` whose **YAML frontmatter carries its metadata** (title, excerpt, category, tags, image, order, `featured`, `homePreview`). The folder name is the slug — there is no hand-maintained list to keep in sync. See [docs/articles.md](docs/articles.md).
- `scripts/articles-index.mjs` reads that frontmatter and is the single source of the index; `scripts/vite-plugin-articles.mjs` exposes it to the app as the virtual module `virtual:articles` (and reloads the dev server when an article changes). The build fails loudly on a missing required field, an unknown category/topic, a `slug` that doesn't match its folder, or an article folder that holds files but no `<slug>.md`. CMS uploads all land in the shared `ArticleImage/` folder, so deleting an article strands nothing — it just leaves an empty directory, which Git and the build both ignore.
- `src/services/articlesData.ts` re-exports that index plus the `Article` type and the `getCategoryColor()` / `getArticleBySlug()` / `getHomePreviewArticles()` lookups. Badge colours are built there from the taxonomy into a private `categoryColors` map that only `getCategoryColor()` reads — the categories and topics lists themselves are not re-exported; read them from `articleTaxonomy.json`. Two optional flags drive placement: `featured` (wider card + FEATURED badge in the articles page grid) and `homePreview` (include it in the home page preview section).
- **`src/services/articleTaxonomy.json` is the single source of truth for categories and topics**, and is itself editable from the CMS (הגדרות → קטגוריות ונושאים, with a colour picker). Category badge colours (`categoryColors`, derived from one hex per category), the `articles.categories.*` i18n labels, the CMS dropdown options and the frontmatter validation are all built from it.
- **Decap CMS** is served from `public/admin/index.html` at `/admin`. The `config.yml` it loads is **generated** by the Vite plugin (from `scripts/admin-config.mjs`, taking its category/topic options from the taxonomy and its folder paths from `articles-index.mjs`) so it can't drift from the site. The `.hl-*`/`.callout*` rules live in `public/article-content.css`, which the site links from `index.html` and the preview pane loads by the same URL — one file, two consumers, no generation step. `public/admin/preview.js` holds only preview-specific layout, the `[!TIP]` → callout conversion, and a **טקסט צבעוני** editor component so authors insert coloured text instead of typing `<span class="hl-…">`. `publish_mode: editorial_workflow` means saving opens a PR against `dev` and publishing squash-merges it there (`squash_merges: true`, so `dev` stays linear) — deliberately not `main`, so reaching production still takes the usual `dev` → `main` PR as a review gate. `npm run cms` starts the local proxy, which bypasses that flow and sign-in entirely by writing to the working tree.
- **CMS sign-in** lives in `src/worker/index.ts`, which `wrangler.jsonc` registers as the Worker entry (`main`) in front of the static assets, with `assets.run_worker_first: ["/oauth/*"]` so the SPA fallback doesn't swallow the routes. It handles `/oauth/auth` and `/oauth/callback` for Decap's popup handshake; everything else falls through to `env.ASSETS.fetch()`, which preserves the SPA fallback. The scope is pinned server-side to `public_repo,read:org` — Decap's own default is `repo` — and `src/worker/organisation.ts` checks `GET /user/memberships/orgs/cyberisrael` before any token is handed over, failing closed on anything that is not `200` + `state: "active"`. Repository push access is deliberately not re-checked: Decap reads `permissions.push` itself and GitHub enforces it on every write. Needs `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` (wrangler secrets in production, `.dev.vars` locally — see `.dev.vars.example`), and the OAuth app must have expiring tokens **off**, because Decap has no refresh path. `CMS_BASE_URL` overrides the origin for local `wrangler dev` testing and is validated at build time, since Decap compares it against `event.origin` as a plain string.
- `src/components/ui/ArticleCard.tsx` is the shared preview card rendered from that metadata. By default a `featured` article gets a double-width card plus a FEATURED badge (`ArticlesPage`); `ArticlesSection` passes `ignoreFeatured` so the three home page cards stay identical.
- `ArticlePage.tsx` (`src/pages/ArticlePage.tsx`) fetches the raw Markdown at runtime, strips the frontmatter, and renders the body with `react-markdown` + `remark-gfm`, plus a custom `remarkGithubAlerts` plugin that turns GitHub-style `> [!TIP]`/`[!WARNING]` blockquotes into styled callouts. Images/relative links in the markdown resolve against `/articles/<slug>/`.
- It also switches the active i18n language to match the article's own `language` field (via `getLangCode()`) before rendering, independent of the site-wide language toggle.
- `src/components/ui/notion/` contains two alternate (currently unused by `ArticlePage`, but present for future/manual use) ways to embed content authored in Notion: `NotionIframeEmbed` (live `<iframe>` to a published Notion page) and `NotionHtmlEmbed` (fetches a Notion HTML export from `public/articles/<slug>/index.html` and mounts it in a Shadow DOM with a hand-written theme bridge so Notion's styles don't leak into the site).

**Theming**: dark/light values are defined as Tailwind color tokens (`cyber-*` for dark, `light-*` for light) in `tailwind.config.js`, not CSS variables — components branch on `theme === 'dark'` and pick Tailwind classes accordingly rather than relying on CSS custom-property cascading. `index.css` holds global styles and Tailwind layers.
