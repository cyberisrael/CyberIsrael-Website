/**
 * fetching an article URL without running JavaScript returns an empty shell.
 * Each article therefore links to its raw Markdown file.
 */
import { readArticles } from './articles-index.mjs'
import { SITE_URL } from './generate-sitemap.mjs'
import { readIndexedRoutes } from './site-routes.mjs'

/**
 * @param {string} root project root
 * @returns {string} the agents.txt Markdown
 */
export function buildAgentsTxt(root = process.cwd()) {
  const pages = readIndexedRoutes(root).map(({ path, indexed }) =>
    `- [${indexed.title}](${SITE_URL}${path}): ${indexed.description}`
  )
  const articles = readArticles(root).map(({ href, title, excerpt, language }) =>
    `- [${title}](${SITE_URL}/articles/${href}/${href}.md): ${excerpt} (${language})`
  )

  return `# CyberIsrael

> Israel's cybersecurity community: CTF competitions, workshops, conferences, articles and collaborations. Content is published in Hebrew and English.

The site is a client-rendered single-page app. To read an article, fetch the
Markdown link below rather than the page URL; each file starts with YAML
frontmatter (title, category, tags, date) followed by the article body.

## Pages

${pages.join('\n')}

## Articles

${articles.join('\n')}

## Optional

- [Sitemap](${SITE_URL}/sitemap.xml): Every indexable URL on the site
`
}
