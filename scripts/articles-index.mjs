/**
 * Reads the article index from the Markdown files themselves.
 *
 * Each article lives at `public/articles/<slug>/<slug>.md` and carries its own
 * metadata in YAML frontmatter, so the folder name is the single source of truth
 * for the slug and nothing has to be kept in sync by hand.
 *
 * Used by the Vite plugin (to build `virtual:articles`) and by the sitemap script.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { load } from 'js-yaml'
import { readTaxonomy } from './taxonomy.mjs'

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/
const REQUIRED_FIELDS = ['title', 'excerpt', 'language', 'category', 'date', 'readTime', 'image']

/**
 * Where article content lives. POSIX separators on purpose: these strings are also
 * written into the CMS config, and `join` handles them fine for filesystem reads.
 */
export const ARTICLES_PATH = 'public/articles'
export const MEDIA_PATH = `${ARTICLES_PATH}/ArticleImage`
/** The same media folder as the browser sees it. */
export const PUBLIC_MEDIA_PATH = MEDIA_PATH.replace(/^public/, '')
const MEDIA_FOLDER_NAME = MEDIA_PATH.split('/').pop()

const TAXONOMY_HINT = 'src/services/articleTaxonomy.json'

/** YAML turns an unquoted `2026-05-21` into a Date, so normalise back to `YYYY-MM-DD`. */
const toDateString = value =>
  value instanceof Date ? value.toISOString().slice(0, 10) : String(value)

/** Splits `---\n…\n---` frontmatter from the Markdown body. */
function parseFrontmatter(raw) {
  const match = raw.match(FRONTMATTER)
  if (!match) return { data: {}, body: raw }
  return { data: load(match[1]) ?? {}, body: raw.slice(match[0].length) }
}

/**
 * @param {string} root project root
 * @returns {Array<object>} articles ordered by their `order` field
 */
export function readArticles(root = process.cwd()) {
  const dir = join(root, ARTICLES_PATH)
  if (!existsSync(dir)) return []

  const taxonomy = readTaxonomy(root)
  const categories = new Set(taxonomy.categories.map(category => category.id))
  const topics = new Set(taxonomy.topics)

  const articles = []

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue

    const slug = entry.name
    const file = join(dir, slug, `${slug}.md`)

    // Deleting an article in the CMS removes its Markdown but leaves the images it
    // uploaded, so a folder without an entry means leftovers nobody noticed.
    if (!existsSync(file)) {
      if (slug === MEDIA_FOLDER_NAME) continue
      throw new Error(
        `"${ARTICLES_PATH}/${slug}" has no ${slug}.md. If the article was deleted, run ` +
        `\`npm run articles:prune\` to remove what it left behind; shared images belong in ${MEDIA_PATH}.`
      )
    }

    const { data } = parseFrontmatter(readFileSync(file, 'utf8'))

    const missing = REQUIRED_FIELDS.filter(field => data[field] === undefined || data[field] === '')
    if (missing.length > 0) {
      throw new Error(`Article "${slug}" is missing frontmatter field(s): ${missing.join(', ')}`)
    }

    // The CMS needs the slug as an editable field; the folder is still the source of
    // truth, so a mismatch means a rename went wrong and must fail loudly.
    if (data.slug !== undefined && data.slug !== slug) {
      throw new Error(`Article "${slug}" declares slug "${data.slug}"; it must match its folder name.`)
    }

    // Categories and topics come from a fixed list so the site and the CMS agree;
    // a new value has to be added to src/services/articleTaxonomy.json first.
    if (!categories.has(data.category)) {
      throw new Error(`Article "${slug}" uses unknown category "${data.category}". Add it to ${TAXONOMY_HINT}.`)
    }

    const unknownTopics = (data.tags ?? []).filter(tag => !topics.has(tag))
    if (unknownTopics.length > 0) {
      throw new Error(`Article "${slug}" uses unknown topic(s): ${unknownTopics.join(', ')}. Add them to ${TAXONOMY_HINT}.`)
    }

    articles.push({
      ...data,
      href: slug,
      date: toDateString(data.date),
      // An image stored next to its article is written as a bare filename; make it
      // browser-resolvable so both that and a shared /articles/… path work.
      image: data.image.startsWith('/') ? data.image : `/articles/${slug}/${data.image}`,
      tags: data.tags ?? [],
    })
  }

  return articles.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.href.localeCompare(b.href))
}
