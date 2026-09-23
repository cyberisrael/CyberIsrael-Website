# Editing articles

Articles are Markdown files with their metadata in YAML frontmatter:

```
public/articles/<slug>/<slug>.md
```

The folder name **is** the slug, so `/articles/<slug>` always matches the file it
renders. The index the site reads (`virtual:articles`) is built from these files at
build time by `scripts/articles-index.mjs` — there is no separate list to keep in sync.

## What works today

The CMS is complete: it runs locally against your working tree, and on the live site
behind a GitHub sign-in that only lets organisation members through.

| | |
| --- | --- |
| The public site | production-ready — built and deployed from `main` |
| Decap CMS, locally | `npm run cms`, writing straight to your working tree |
| Decap CMS, in production | `/admin`, behind GitHub sign-in |
| Who gets in | active members of the `cyberisrael` organisation **and** collaborators on the repository |
| Preview deployments | **not** a supported CMS environment — see below |

## Where the content lives

There is no database: **an article is just files in this repository**.

| | |
| --- | --- |
| The article | `public/articles/<slug>/<slug>.md` — metadata in frontmatter, body below |
| Its images | the same folder (uploaded through the CMS) or the shared `public/articles/ArticleImage/` |
| The list on the site | built from those files at build time — nothing to update by hand |

**Locally** (`npm run cms` + `npm run dev`) the CMS writes straight into your working
tree, so a new article shows up as normal file changes you commit yourself.

**In production** the CMS signs you in with GitHub and commits on your behalf. Nothing
it does reaches the live site on its own:

1. **Save** commits to a branch and opens a pull request against `dev`.
2. **Publish** squash-merges that pull request into `dev` as a single commit, which
   Cloudflare builds as a *preview* deployment, not as cyberisrael.net.
3. The site changes only when someone opens and merges the usual **`dev` → `main`**
   pull request, because `main` is the Cloudflare production branch.


### Deleting

Decap deletes an entry's Markdown file and leaves its folder behind, empty. Nothing
needs to be done about that: Git does not track an empty directory, so it never
reaches a commit, and the build ignores it.

Uploads all go to the shared `public/articles/ArticleImage/` folder, so deleting an
article never strands an image it uploaded. If a folder does end up holding files with
no `<slug>.md` beside them — images placed there by hand, most likely — the build fails
and names the folder rather than deleting anything.

## Editing through the CMS

[Decap CMS](https://decapcms.org) is served at `/admin`. Run it through the local proxy
(`npm run cms`) and it writes straight into your working tree, so everything it does is
an ordinary file change you can read in `git diff` before committing.

`publish_mode: editorial_workflow` is on, so in production "Save" opens a pull request
and "Publish" squash-merges it into `dev` — a non-developer can write an article and someone
else reviews it, without anyone touching Git. The local proxy bypasses that flow
entirely and edits files directly, so it has no effect when you run `npm run cms`.

### Locally

```bash
npm run cms   # proxy that lets /admin write to your working tree
npm run dev   # then open http://localhost:3000/admin/
```

No GitHub login is needed in this mode; edits land in your working tree as normal file
changes you can inspect with `git diff` before committing.

`npm run cms` goes through [`scripts/cms.mjs`](../scripts/cms.mjs), which pins the proxy
to `127.0.0.1`. That is on purpose: the proxy writes files anywhere under the repository
and has no authentication, so it must not be reachable from the network. Open the CMS on
the machine running it — another device on your Wi-Fi cannot, and should not, reach it.

### In production

Open `/admin` on the live site and press **Login with GitHub**. A popup completes the
OAuth handshake against this site's own Worker, and the CMS loads only if you get through
both gates below.

### Who gets in

Two separate checks, and conflating them is easy:

| Gate | What it decides | Where it lives |
| --- | --- | --- |
| Organisation membership | whether a token is issued at all — active members of `cyberisrael` only | `src/worker/organisation.ts` |
| Repository push access | whether the CMS will load, and whether a save succeeds | Decap reads `permissions.push`; GitHub enforces it on every write |

Access is therefore "in the organisation **and** a collaborator on the repository". The
Worker checks the first because it decides whether to hand over a token at all. It
deliberately does **not** check the second: Decap already asks GitHub for it before it
will load, and GitHub enforces it on every write regardless — a token without push access
cannot commit whatever the Worker believes. A second check would cost a request and add
no enforcement.

The membership check fails closed. Only `200` carrying `state: "active"` is a yes; a
pending invitation, a rejected token, a missing scope, an organisation that blocks the
app, a GitHub outage and a timeout are all no. Being unable to verify membership is never
treated as evidence of it.

> [!NOTE]
> A member **without** push access gets through the Worker and then hits a confusing
> message from Decap: *Repo "…" not found. … If the repo is private, make sure you're
> logged into a GitHub account with access.* That is Decap's wording for "you are not a
> collaborator", not a broken sign-in.

### Setting up the OAuth app

Once, by an organisation owner:

1. Create an OAuth app under the organisation (Settings → Developer settings → OAuth
   Apps) with **Authorization callback URL** `https://cyberisrael.net/oauth/callback`.
   One app is enough — GitHub allows up to 10 callback URLs, so the local one below goes
   on the same app.
2. Leave **"Expire user access tokens" OFF.** Decap's GitHub backend has no refresh path
   at all: it reads `state.token` and drops everything else, so a `refresh_token` cannot
   be handed to it. With expiring tokens an editor is thrown out mid-edit after eight
   hours with an opaque API error.
3. Store the credentials on the Worker:

   ```bash
   npx wrangler secret put GITHUB_CLIENT_ID
   npx wrangler secret put GITHUB_CLIENT_SECRET
   ```

The token the CMS receives is scoped `public_repo,read:org`, pinned in the Worker.
`public_repo` is all a public repository needs — the `repo` Decap would otherwise ask for
would put write access to every private repository the editor can see into a browser —
and `read:org` is what makes the membership check possible, including for members who
keep their membership private. Decap appends its own `?scope=` when it opens the popup;
the Worker ignores it, so no page can widen the request.

> [!IMPORTANT]
> If the organisation has **OAuth app access restrictions** turned on (Settings →
> Third-party Access → OAuth app policy), the app has to be approved there as well. New
> organisations have this on by default. Until it is approved GitHub answers the
> membership check with `403` for *everyone*, members included, and every sign-in is
> refused.

### Testing the sign-in locally

Add `http://127.0.0.1:8788/oauth/callback` as a second callback URL on the same OAuth
app — for loopback addresses GitHub does not require the port to match, so one entry
covers whichever port you use. Copy `.dev.vars.example` to `.dev.vars` (gitignored) and
fill in the same credentials, then:

```bash
CMS_BASE_URL=http://127.0.0.1:8788 npm run build
npx wrangler dev --port 8788
```

Open `http://127.0.0.1:8788/admin/` and sign in. Two things matter here:

- **`npm run cms` must not be running.** The local proxy takes over on loopback and the
  sign-in button would never be exercised.
- **Use `127.0.0.1`, not `localhost`.** The state cookie is marked `Secure`, and the two
  are different origins as far as Decap's `event.origin === base_url` comparison goes —
  mixing them makes the popup hang with nothing logged.

To see a refusal, temporarily change `ORGANISATION` in `src/worker/organisation.ts` to an
organisation you are *not* a member of and rebuild. **Change it back afterwards** —
shipping the wrong organisation here would open the CMS to strangers.

### Preview deployments are not a CMS environment

Cloudflare builds every non-`main` branch as a preview, and those URLs carry a version
prefix that changes with each build. GitHub requires the `redirect_uri` to match a
registered callback URL exactly, so sign-in on a preview URL is refused before the
handshake even starts. Previews are for looking at the site, not for editing it — use
production, or the local flow above.

### When sign-in fails

| What you see | What it means |
| --- | --- |
| "Sign-in was cancelled." | You pressed Cancel on GitHub's consent screen |
| "The sign-in request expired. Please try again." | The single-use state cookie was missing, stale or already spent — start again from `/admin` |
| "Only members of the cyberisrael organisation can edit the site." | Not an active member, a pending invitation, or the organisation blocks the app |
| "The CMS is missing its GitHub credentials." | The Worker secrets are not set |
| "The CMS sign-in is misconfigured: GitHub rejected the callback URL." | The OAuth app's callback URL does not match the origin you opened `/admin` from |
| The popup hangs on "Completing sign-in…" | `base_url` does not equal the origin serving `/admin`. The build guards against this, so it means the site is served from an origin the build did not expect |

Every one of these fails closed: no token reaches the browser.


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
  colours because both it and the site load the same stylesheet,
  [`public/article-content.css`](../public/article-content.css) — change the palette
  there and the CMS follows automatically.
- **The first CMS save of an existing article produces a large cosmetic diff.** Decap
  re-serialises the file: list markers become `*`, long frontmatter values wrap, and
  `[!TIP]` is written as `\[!TIP]`. All of it is Markdown-equivalent — a full save
  round-trip was checked and the callouts, `hl-*` spans, links and word count came back
  unchanged — but reviewers should expect the noise.
- **The preview is the eye toggle** above the editor (`הפעלת תצוגה מקדימה`). Decap also
  ships a "check for deploy preview" button, which needs a deploy-preview integration
  we don't have — it could only ever spin, so it's turned off in the config and hidden
  in `public/admin/index.html`.
- **Deleting an article in the CMS leaves an empty folder behind.** Git ignores it and
  so does the build. A folder that still holds files without a `<slug>.md` fails the
  build instead, because those are images nobody would find again.
- **Don't change a published article's `slug`.** It renames the folder and breaks every
  existing link to it.
- The Decap admin UI itself is left-to-right; text fields detect direction from their
  content, so Hebrew reads right-to-left while the slug field stays left-to-right.
