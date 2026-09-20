import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const STYLESHEET = 'src/index.css'
/** The rules that style an article's body: highlight colours and callout boxes. */
const ARTICLE_RULE = /(^|[\s,])(\.hl-|\.callout)/

/**
 * Lifts the article-body rules out of the site stylesheet so the CMS preview can
 * reuse them verbatim, instead of a hand-kept copy that silently drifts.
 */
export function readArticleStyles(root = process.cwd()) {
  const css = readFileSync(join(root, STYLESHEET), 'utf8')
  const rules = []

  let depth = 0
  let blockStart = 0

  for (let i = 0; i < css.length; i += 1) {
    if (css[i] === '{') {
      if (depth === 0) {
        const selector = css.slice(blockStart, i)
        // At-rules (@layer, @media) wrap other rules; step inside rather than capture them.
        if (!selector.trimStart().startsWith('@')) {
          const end = css.indexOf('}', i)
          if (ARTICLE_RULE.test(selector)) rules.push(`${selector.trim()} {${css.slice(i + 1, end)}}`)
          i = end
          blockStart = i + 1
          continue
        }
      }
      depth += 1
    } else if (css[i] === '}') {
      depth = Math.max(0, depth - 1)
      blockStart = i + 1
    }
  }

  const missing = [
    [/\.hl-[a-z]/, '.hl-* highlight colours'],
    [/\.callout/, '.callout* boxes'],
  ]
    .filter(([pattern]) => !pattern.test(rules.join('\n')))
    .map(([, name]) => name)

  if (missing.length > 0) {
    throw new Error(`${STYLESHEET} no longer defines ${missing.join(' or ')}; the CMS preview relies on them.`)
  }

  return rules.join('\n')
}
