import { Readable } from "node:stream";
import { SitemapStream, streamToPromise } from "sitemap";
import { readArticles } from "./articles-index.mjs";

/**
 * Always the production origin: search engines should only ever be pointed at the
 * live site, even when CMS_BASE_URL is overridden for local Worker testing.
 */
export const SITE_URL = "https://cyberisrael.net";

// /coming-soon is intentionally left out, as in robots.txt.
const STATIC_ROUTES = [
  { url: "/", changefreq: "weekly", priority: 1.0 },
  { url: "/articles", changefreq: "weekly", priority: 0.9 },
  { url: "/impact", changefreq: "monthly", priority: 0.7 },
  { url: "/collaborate", changefreq: "monthly", priority: 0.7 },
];

/**
 * @param {string} root project root
 * @returns {Promise<string>} the sitemap XML
 */
export async function buildSitemap(root = process.cwd()) {
  const articles = readArticles(root).map((article) => ({
    url: `/articles/${article.href}`,
    lastmod: article.date,
    changefreq: "monthly",
    priority: 0.8,
  }));

  const stream = new SitemapStream({ hostname: SITE_URL });
  const xml = await streamToPromise(
    Readable.from([...STATIC_ROUTES, ...articles]).pipe(stream),
  );
  return xml.toString();
}
