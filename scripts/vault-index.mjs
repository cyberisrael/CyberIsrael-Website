/**
 * Builds /knowledge-vault.json from the CMS-editable vault content.
 *
 * Each note lives at `content/vault/notes/<id>.json` and the featured block at
 * `content/vault/featured.json`. Neither is under `public/` on purpose: anything there is
 * served as-is, while the generated file is only ever served through the Worker's URL
 * filter (src/worker/knowledgeVault.ts).
 *
 * Used by `vite-plugin-generated-files.mjs` (the file itself) and by the CMS config (the
 * type dropdown and the featured picker).
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { readArticles } from './articles-index.mjs'

/** POSIX separators on purpose: these strings are also written into the CMS config. */
export const VAULT_NOTES_PATH = 'content/vault/notes'
export const VAULT_FEATURED_PATH = 'content/vault/featured.json'
const VAULT_TYPES_PATH = 'src/services/vaultNoteTypes.json'

/** `{ <type>: { he, match: [{ host, path? }] } }`, in folder order. Shared with the site. */
export function readVaultNoteTypes(root = process.cwd()) {
  return JSON.parse(readFileSync(join(root, VAULT_TYPES_PATH), 'utf8'))
}

const readJson = file => {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (error) {
    throw new Error(`${file} is not valid JSON: ${error.message}`)
  }
}

/**
 * Decap writes `""` for an optional field left blank, and `{ he: "", en: "" }` for an
 * optional object. The site reads a missing title as "use the fallback" but an empty one
 * as a real, blank title, so empties are removed rather than passed on.
 */
function prune(value) {
  if (Array.isArray(value)) return value.map(prune).filter(item => item !== undefined)
  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
      .map(([key, item]) => [key, prune(item)])
      .filter(([, item]) => item !== undefined)
    return entries.length > 0 ? Object.fromEntries(entries) : undefined
  }
  if (typeof value === 'string' && value.trim() === '') return undefined
  return value ?? undefined
}

/** @returns {Array<object>} notes ordered by their `order` field, without it */
export function readVaultNotes(root = process.cwd()) {
  const dir = join(root, VAULT_NOTES_PATH)
  if (!existsSync(dir)) return []

  const types = readVaultNoteTypes(root)

  const notes = readdirSync(dir)
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const id = file.slice(0, -'.json'.length)
      const note = prune(readJson(join(dir, file))) ?? {}

      // The CMS names the file after the id; a mismatch means a rename went wrong.
      if (note.id !== id) {
        throw new Error(`${VAULT_NOTES_PATH}/${file} declares id "${note.id}"; it must match its file name.`)
      }
      if (typeof note.url !== 'string') {
        throw new Error(`Vault note "${id}" has no url.`)
      }
      if (note.type !== undefined && !Object.hasOwn(types, note.type)) {
        throw new Error(`Vault note "${id}" uses unknown type "${note.type}". Add it to ${VAULT_TYPES_PATH}.`)
      }
      return note
    })

  return notes
    .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.id.localeCompare(b.id))
    .map(({ order: _order, ...note }) => note)
}

export function readVaultFeatured(root = process.cwd()) {
  const file = join(root, VAULT_FEATURED_PATH)
  return existsSync(file) ? prune(readJson(file)) ?? {} : {}
}

/** Every id `featured.items` may point at: vault notes, and articles as `article-<slug>`. */
export function readVaultTargets(root = process.cwd(), notes = readVaultNotes(root)) {
  return [
    ...notes.map(note => ({ id: note.id, title: note.title })),
    ...readArticles(root).map(article => ({ id: `article-${article.href}`, title: article.title })),
  ]
}

/** The file served at /knowledge-vault.json. */
export function buildKnowledgeVault(root = process.cwd()) {
  const notes = readVaultNotes(root)
  const featured = readVaultFeatured(root)

  // A note deleted in the CMS can still be featured. Dropping it is better than failing
  // the deploy over something an editor has no way to see.
  const known = new Set(readVaultTargets(root, notes).map(target => target.id))
  const items = (featured.items ?? []).filter(id => {
    if (known.has(id)) return true
    console.warn(`knowledge-vault: dropping featured item "${id}", which is no longer a note or article`)
    return false
  })

  return JSON.stringify({ featured: { ...featured, items }, notes }, null, 2) + '\n'
}
