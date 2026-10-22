import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROUTES_PATH = join('src', 'siteRoutes.json')

/**
 * The site's routes, shared by App.tsx, the navbar and footer, the sitemap and agents.txt.
 * Fails loudly on a route the app could not render or the sitemap could not list.
 */
export function readSiteRoutes(root = process.cwd()) {
  const routes = JSON.parse(readFileSync(join(root, ROUTES_PATH), 'utf8'))
  const navLabels = ['en', 'he'].map((lang) => {
    const file = join('src', 'translations', lang, 'index.ts')
    return { file, block: readFileSync(join(root, file), 'utf8').match(/\bnav:\s*\{([^}]*)\}/)?.[1] ?? '' }
  })

  for (const { path, page, nav, indexed } of routes) {
    if (!path.startsWith('/')) {
      throw new Error(`${ROUTES_PATH}: path "${path}" must start with "/"`)
    }
    if (!existsSync(join(root, 'src', 'pages', `${page}.tsx`))) {
      throw new Error(`${ROUTES_PATH}: "${path}" points to src/pages/${page}.tsx, which does not exist`)
    }
    if (indexed && path.includes(':')) {
      throw new Error(`${ROUTES_PATH}: "${path}" has a parameter, so it cannot be indexed`)
    }
    if (nav && path.includes(':')) {
      throw new Error(`${ROUTES_PATH}: "${path}" has a parameter, so it cannot be a nav link`)
    }
    for (const { file, block } of nav ? navLabels : []) {
      if (!new RegExp(`\\b${nav}:`).test(block)) {
        throw new Error(`${ROUTES_PATH}: "${path}" uses nav.${nav}, which ${file} does not define`)
      }
    }
  }

  return routes
}

/** Routes listed in sitemap.xml and agents.txt. */
export function readIndexedRoutes(root = process.cwd()) {
  return readSiteRoutes(root).filter((route) => route.indexed)
}
