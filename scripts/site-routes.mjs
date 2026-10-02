import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROUTES_PATH = join('src', 'siteRoutes.json')

/**
 * The site's routes, shared by App.tsx, the sitemap and agents.txt.
 * Fails loudly on a route the app could not render or the sitemap could not list.
 */
export function readSiteRoutes(root = process.cwd()) {
  const routes = JSON.parse(readFileSync(join(root, ROUTES_PATH), 'utf8'))

  for (const { path, page, indexed } of routes) {
    if (!path.startsWith('/')) {
      throw new Error(`${ROUTES_PATH}: path "${path}" must start with "/"`)
    }
    if (!existsSync(join(root, 'src', 'pages', `${page}.tsx`))) {
      throw new Error(`${ROUTES_PATH}: "${path}" points to src/pages/${page}.tsx, which does not exist`)
    }
    if (indexed && path.includes(':')) {
      throw new Error(`${ROUTES_PATH}: "${path}" has a parameter, so it cannot be indexed`)
    }
  }

  return routes
}

/** Routes listed in sitemap.xml and agents.txt. */
export function readIndexedRoutes(root = process.cwd()) {
  return readSiteRoutes(root).filter((route) => route.indexed)
}
