import { join } from 'node:path'
import { readArticles, ARTICLES_PATH } from './articles-index.mjs'

const VIRTUAL_ID = 'virtual:articles'
const RESOLVED_ID = '\0' + VIRTUAL_ID

/**
 * Exposes the article index (built from Markdown frontmatter) as `virtual:articles`,
 * and reloads the dev server when an article is added, changed or removed.
 */
export default function articlesPlugin() {
  let root = process.cwd()

  return {
    name: 'cyberisrael:articles',

    configResolved(config) {
      root = config.root
    },

    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null
    },

    load(id) {
      if (id !== RESOLVED_ID) return null
      return `export const articles = ${JSON.stringify(readArticles(root))}`
    },

    configureServer(server) {
      const articlesPath = join(root, ARTICLES_PATH)

      const reload = file => {
        if (!file.startsWith(articlesPath) || !file.endsWith('.md')) return

        const module = server.moduleGraph.getModuleById(RESOLVED_ID)
        if (module) server.moduleGraph.invalidateModule(module)
        server.ws.send({ type: 'full-reload' })
      }

      server.watcher.add(articlesPath)
      server.watcher.on('add', reload)
      server.watcher.on('change', reload)
      server.watcher.on('unlink', reload)
    },
  }
}
