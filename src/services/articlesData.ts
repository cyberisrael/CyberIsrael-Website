import { articles as indexedArticles } from 'virtual:articles'
import taxonomy from './articleTaxonomy.json'

/**
 * Article metadata lives in the YAML frontmatter of `public/articles/<slug>/<slug>.md`
 * and is collected at build time (see scripts/articles-index.mjs). `href` is the
 * folder name, so it can never drift from the file it points at.
 */
export interface Article {
  title: string
  language: string
  excerpt: string
  category: string
  date: string
  readTime: number
  image: string
  tags: string[]
  href: string
  /** Position in the articles list; lower comes first. */
  order?: number
  featured?: boolean
  homePreview?: boolean
}

export const articles: Article[] = indexedArticles

const categories = taxonomy.categories

interface CategoryColor {
  bg: string
  text: string
  border: string
}

/** Accepts `#RGB`/`#RRGGBB`; the CMS colour picker always writes the long form. */
const toRgb = (hex: string) => {
  const digits = hex.replace('#', '').slice(0, 6)
  const full = digits.length === 3 ? digits.replace(/./g, c => c + c) : digits
  const value = parseInt(full, 16)
  return `${(value >> 16) & 255},${(value >> 8) & 255},${value & 255}`
}

const NEUTRAL_COLOR: CategoryColor = {
  bg: 'rgba(148,163,184,0.1)',
  text: '#94A3B8',
  border: 'rgba(148,163,184,0.3)',
}

export const categoryColors: Record<string, CategoryColor> = Object.fromEntries(
  categories.map(({ id, color }) => [
    id,
    { bg: `rgba(${toRgb(color)},0.1)`, text: color, border: `rgba(${toRgb(color)},0.3)` },
  ])
)

export function getCategoryColor(category: string): CategoryColor {
  return categoryColors[category] ?? NEUTRAL_COLOR
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find(a => a.href === slug)
}

export function getHomePreviewArticles(): Article[] {
  return articles.filter(article => article.homePreview)
}
