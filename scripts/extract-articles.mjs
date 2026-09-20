import { mkdirSync, writeFileSync } from 'node:fs'
import { readArticles } from './articles-index.mjs'

mkdirSync('./dist-temp', { recursive: true })

writeFileSync(
    './dist-temp/articles.json',
    JSON.stringify(readArticles(), null, 2)
)

console.log('✅ Articles extracted for sitemap')
