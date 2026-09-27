import { join } from 'node:path'
import { readArticles, ARTICLES_PATH } from './articles-index.mjs'
import { buildAdminConfig } from './admin-config.mjs'
import { buildSitemap } from './generate-sitemap.mjs'
import { buildAgentsTxt } from './generate-agents.mjs'

const VIRTUAL_ID = 'virtual:articles'
const RESOLVED_ID = '\0' + VIRTUAL_ID

/** Served files derived from the repo rather than written by hand. `build` may be async. */
const GENERATED = {
  'admin/config.yml': { type: 'text/yaml', build: buildAdminConfig },
  'sitemap.xml': { type: 'application/xml', build: buildSitemap },
  'agents.txt': { type: 'text/markdown', build: buildAgentsTxt },
}

/**
 * Three jobs, all driven by files rather than hand-kept lists:
 * - exposes the article index (built from Markdown frontmatter) as `virtual:articles`
 * - generates the Decap CMS config from the taxonomy, so it cannot drift from the site
 * - generates sitemap.xml and agents.txt from the routes and the article index
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

    async generateBundle() {
      // The build runs once per environment. Only the client bundle is served, so
      // emitting into the Worker bundle as well would just write files nothing reads.
      if (this.environment && this.environment.name !== 'client') return
      for (const [fileName, { build }] of Object.entries(GENERATED)) {
        this.emitFile({ type: 'asset', fileName, source: await build(root) })
      }
    },

    configureServer(server) {
      for (const [fileName, { type, build }] of Object.entries(GENERATED)) {
        server.middlewares.use(`/${fileName}`, async (_request, response, next) => {
          try {
            const body = await build(root)
            response.setHeader('Content-Type', `${type}; charset=utf-8`)
            response.end(body)
          } catch (error) {
            next(error)
          }
        })
      }

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
