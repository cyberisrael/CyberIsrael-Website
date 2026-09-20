# Editing articles

Articles are Markdown files with their metadata in YAML frontmatter:

```
public/articles/<slug>/<slug>.md
```

The folder name **is** the slug, so `/articles/<slug>` always matches the file it
renders. The index the site reads (`virtual:articles`) is built from these files at
build time by `scripts/articles-index.mjs` — there is no separate list to keep in sync.

## Where the content lives

There is no database: **an article is just files in this repository**.

| | |
| --- | --- |
| The article | `public/articles/<slug>/<slug>.md` — metadata in frontmatter, body below |
| Its images | the same folder (uploaded through the CMS) or the shared `public/articles/ArticleImage/` |
| The list on the site | built from those files at build time — nothing to update by hand |

**Locally** (`npm run cms` + `npm run dev`) the CMS writes straight into your working
tree, so a new article shows up as normal file changes you commit yourself.

**In production** the CMS talks to GitHub, and nothing it does reaches the live site on
its own:

1. **Save** commits to a branch and opens a pull request against `dev`.
2. **Publish** merges that pull request into `dev` — Cloudflare then builds `dev` as a
   *preview* deployment, not as cyberisrael.net.
3. The site only changes when someone opens and merges the usual **`dev` → `main`** pull
   request, because `main` is the Cloudflare production branch.

Two separate things decide who can do what here, and conflating them is easy:

| Layer | What it decides | Where it lives |
| --- | --- | --- |
| The Worker's membership check | who may **sign in** — active members of the `cyberisrael` organisation | `src/worker/index.ts` |
| GitHub's repository permissions | who may actually **commit** — Decap acts as the signed-in user, so a member without write access reaches the CMS but their save fails | repo settings on GitHub |

Access is therefore "in the organisation **and** a collaborator on the repository". That
is deliberate: it is checked where GitHub already tracks it, rather than duplicated into
a list of names in this repo that would quietly go stale. Note that it is not the same
as "organisation admins only" — any member with write access can publish. (`local_backend`
looks like a bypass, but Decap only honours it on `localhost`/`127.0.0.1`, so it is
ignored on the deployed site.)

### Deleting

Decap deletes an entry's Markdown file but not the images uploaded with it, so the
article's folder would be left behind. That is handled for you:

- while `npm run dev` is running, the folder is removed automatically as soon as the
  article is deleted (the terminal logs `removed public/articles/<slug>`);
- otherwise `npm run articles:prune` clears any leftovers;
- and if one is ever missed, the build fails and names the folder, so it can't reach
  `main` unnoticed.

### Who can sign in

`/admin` is gated by a Cloudflare Worker (`src/worker/index.ts`): it completes GitHub's
OAuth handshake and only returns a token when the person is an **active member of the
`cyberisrael` GitHub organisation**. Anyone else gets "Only members of the cyberisrael
organisation can edit the site" and never reaches the CMS.

Setting it up takes two steps, once:

1. Create an OAuth app under the organisation
   (Settings → Developer settings → OAuth Apps) with
   **Authorization callback URL** `https://cyberisrael.net/oauth/callback`.
2. Store the credentials on the Worker:

   ```bash
   npx wrangler secret put GITHUB_CLIENT_ID
   npx wrangler secret put GITHUB_CLIENT_SECRET
   ```

For `npm run preview`, copy `.dev.vars.example` to `.dev.vars` and fill in the same
values; `.dev.vars` is gitignored.

> [!IMPORTANT]
> If the organisation has **OAuth App access restrictions** turned on
> (Settings → Third-party Access), the app has to be approved there as well. Until it
> is, GitHub answers the membership check with `403` for *everyone*, members included,
> and the CMS refuses all sign-ins.

The token the CMS receives is scoped `public_repo,read:org`. Decap keeps it in the
browser, so it is deliberately no wider than this repository needs: `public_repo` cannot
touch a private repository, and `read:org` is only there to make the membership check
possible. If this repository ever becomes private, that scope has to widen to `repo` —
and the token in every editor's browser widens with it.

### Verifying that the restriction works

The worker only hands back a token when GitHub answers `200` with `state: "active"`.
Everything else is refused, which covers every way a person can fail to be a member:

| Who is signing in | GitHub's answer | Result |
| --- | --- | --- |
| Active member | `200` `state: active` | allowed in |
| Not in the organisation | `404` | refused |
| Invited but hasn't accepted | `200` `state: pending` | refused |
| Expired or tampered token | `401` / `403` | refused |

To see it for yourself, run the real flow locally:

1. Create a second OAuth app for development with callback
   `http://localhost:8788/oauth/callback`, and put its credentials in `.dev.vars`.
2. Build with the CMS pointed at the local origin, then serve it:

   ```bash
   CMS_BASE_URL=http://localhost:8788 npm run build
   npx wrangler dev --port 8788
   ```

   Make sure `npm run cms` is **not** running — the local proxy backend bypasses OAuth
   entirely, so the sign-in button would never be exercised.
3. Open `http://localhost:8788/admin/` and sign in. Your own account should get in.
4. Now sign in from a GitHub account that isn't in the organisation (a throwaway
   account works). It should be refused with "Only members of the cyberisrael
   organisation can edit the site".

If you'd rather not create a second account, temporarily change `ORGANISATION` in
`src/worker/index.ts` to an organisation you are *not* a member of, rebuild, and sign
in with your own account — the refusal is the same code path. **Change it back
afterwards**; shipping the wrong organisation here would open the CMS to strangers.

Use `http://localhost`, not a LAN IP: the CSRF state cookie is marked `Secure`, and
browsers only treat `localhost` as a trustworthy origin over plain HTTP.

> **Before deploying this**, the Cloudflare build's deploy command must be plain
> `npx wrangler deploy`. The old `--assets=./dist` flag points at the wrong folder now
> that the build emits `dist/client` plus a Worker, and would break the deployment.

## Editing through the CMS

[Decap CMS](https://decapcms.org) is served at `/admin` and writes straight to this
repository. `publish_mode: editorial_workflow` is on, so **"Save" opens a pull request**
and **"Publish" merges it into `dev`** — a non-developer can write an article and someone
else reviews it, without anyone touching Git. Reaching cyberisrael.net still takes the
`dev` → `main` pull request; see [In production](#in-production).

### Locally

```bash
npm run cms   # proxy that lets /admin write to your working tree
npm run dev   # then open http://localhost:3000/admin/
```

No GitHub login is needed in this mode; edits land in your working tree as normal file
changes you can inspect with `git diff` before committing.

### In production

Sign in with GitHub; only members of the organisation get through, see
[Who can sign in](#who-can-sign-in). From there an article reaches the live site in two
stages, and **the second one is a deliberate human gate**:

| Step | Who does it | Where it lands |
| --- | --- | --- |
| Write the article, then **Save** | the editor, in the CMS | a branch and a pull request against `dev` |
| **Publish** | the editor, in the CMS | merged into `dev`; Cloudflare builds it as a *preview* |
| Open the **`dev` → `main`** pull request, review it, merge | a maintainer, on GitHub | `main`, which deploys to cyberisrael.net |

So **"Publish" in the CMS is not the same as publishing to the site**: it only carries
the article as far as `dev`. Nothing an editor does on their own changes
cyberisrael.net — that is exactly why `backend.branch` is `dev` and not `main`. Someone
has to review and approve the `dev` → `main` pull request before readers see anything.

## Categories and topics

Both lists live in **one place**: [`src/services/articleTaxonomy.json`](../src/services/articleTaxonomy.json),
and the CMS edits it under **הגדרות → קטגוריות ונושאים** — a category's colour is picked
with a colour picker, not typed as a hex string in a file.

```json
{
  "categories": [
    { "id": "guides", "color": "#FFD700", "he": "מדריכים", "en": "Guides" }
  ],
  "topics": ["Military", "Selections"]
}
```

Everything else is derived from it:

| Consumer | What it takes |
| --- | --- |
| `src/services/articlesData.ts` | `categoryColors` — the badge background and border are derived from the single `color` |
| `src/translations/{he,en}` | the `articles.categories.*` labels |
| `/admin/config.yml` | the category and topic dropdown options (generated by `scripts/admin-config.mjs`) |
| `scripts/articles-index.mjs` | validation — an article using a category or topic that isn't listed fails the build |

`public/admin/config.yml` does not exist — it is generated, so it can never drift from
this file. Note that the taxonomy is read at **build** time, so a change goes live with
the next deploy rather than instantly.

## Editing by hand

Create `public/articles/my-article/my-article.md`:

```markdown
---
title: כותרת המאמר
slug: my-article          # must equal the folder name; the build fails otherwise
excerpt: תקציר קצר שמופיע בכרטיס המאמר
language: Hebrew/עברית
category: guides          # must be one of articleTaxonomy.json → categories
date: '2026-09-20'
readTime: 5
image: /articles/ArticleImage/MyArticle.webp
tags:
  - Military             # must be listed in articleTaxonomy.json → topics
order: 10                 # lower numbers appear first
featured: false           # optional: wider card + "מומלץ" badge
homePreview: false        # optional: include in the home page preview
---

תוכן המאמר…
```

Cover images can live either in the shared `public/articles/ArticleImage/` folder
(referenced as `/articles/ArticleImage/name.webp`) or next to the article in its own
folder (referenced as just `name.webp`) — a bare filename is resolved against the
article's folder. Images used inside the body work the same way.

Missing required fields fail the build with the article name, rather than rendering a
broken card.

## Things worth knowing

- **Coloured text and callouts.** Colour comes from `<span class="hl-COLOR">…</span>`
  (red / orange / yellow / green / blue / purple) and callouts from
  `> [!TIP]` / `[!NOTE]` / `[!WARNING]` / `[!IMPORTANT]`. In the CMS you don't type
  that by hand: the editor's **+** menu has **טקסט צבעוני**, which renders an existing
  coloured paragraph as a card with a colour dropdown. The preview shows the site's real
  colours because `/admin/article-styles.css` is **generated from `src/index.css`** at
  build time — change the palette there and the CMS follows automatically.
- **The first CMS save of an existing article produces a large cosmetic diff.** Decap
  re-serialises the file: list markers become `*`, long frontmatter values wrap, and
  `[!TIP]` is written as `\[!TIP]`. All of it is Markdown-equivalent — a full save
  round-trip was checked and the callouts, `hl-*` spans, links and word count came back
  unchanged — but reviewers should expect the noise.
- **The preview is the eye toggle** above the editor (`הפעלת תצוגה מקדימה`). Decap also
  ships a "check for deploy preview" button, which needs a deploy-preview integration
  we don't have — it could only ever spin, so it's turned off in the config and hidden
  in `public/admin/index.html`.
- **Deleting an article in the CMS leaves its images behind.** Decap removes the entry's
  Markdown file but not the media uploaded with it. The dev server prunes the folder
  automatically, `npm run articles:prune` does it on demand, and the build fails on a
  leftover so it can't slip into a commit unnoticed.
- **Don't change a published article's `slug`.** It renames the folder and breaks every
  existing link to it.
- The Decap admin UI itself is left-to-right; text fields detect direction from their
  content, so Hebrew reads right-to-left while the slug field stays left-to-right.
