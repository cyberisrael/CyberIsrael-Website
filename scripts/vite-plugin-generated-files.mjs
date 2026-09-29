import { buildAdminConfig } from './admin-config.mjs'
import { buildSitemap } from './generate-sitemap.mjs'
import { buildAgentsTxt } from './generate-agents.mjs'

/** Served files derived from the repo rather than written by hand. `build` may be async. */
const GENERATED = {
  'admin/config.yml': { type: 'text/yaml', build: buildAdminConfig },
  'sitemap.xml': { type: 'application/xml', build: buildSitemap },
  'agents.txt': { type: 'text/markdown', build: buildAgentsTxt },
}

/**
 * Emits every file in `GENERATED` into the client build, and serves the same
 * files from the dev server, rebuilt on each request so they are never stale.
 */
export default function generatedFilesPlugin() {
  let root = process.cwd()

  return {
    name: 'cyberisrael:generated-files',

    configResolved(config) {
      root = config.root
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
    },
  }
}
