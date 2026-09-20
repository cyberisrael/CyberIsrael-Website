/**
 * Deleting an article in the CMS removes its Markdown file but leaves behind any image
 * that was uploaded with it, because Decap treats media as independent of the entry.
 * This removes those leftovers: an article folder with no Markdown file left in it.
 *
 * Run directly (`npm run articles:prune`) or from the dev server, which calls it when
 * an article's Markdown disappears.
 */
import { readdirSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { ARTICLES_PATH, MEDIA_PATH } from './articles-index.mjs'

const MEDIA_FOLDER_NAME = MEDIA_PATH.split('/').pop()

/** @returns {string[]} the folders that were removed */
export function pruneOrphanArticleFolders(root = process.cwd()) {
  const dir = join(root, ARTICLES_PATH)
  if (!existsSync(dir)) return []

  const removed = []

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === MEDIA_FOLDER_NAME) continue

    const folder = join(dir, entry.name)
    // Only when nothing Markdown is left, so a renamed entry is never swept away with it.
    if (readdirSync(folder).some(file => file.endsWith('.md'))) continue

    rmSync(folder, { recursive: true, force: true })
    removed.push(`${ARTICLES_PATH}/${entry.name}`)
  }

  return removed
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const removed = pruneOrphanArticleFolders()
  console.log(removed.length ? `Removed leftovers:\n  ${removed.join('\n  ')}` : 'Nothing to clean up.')
}
