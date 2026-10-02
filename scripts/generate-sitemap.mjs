import { Readable } from "node:stream";
import { SitemapStream, streamToPromise } from "sitemap";
import { readArticles } from "./articles-index.mjs";
import { readIndexedRoutes } from "./site-routes.mjs";

/**
 * Always the production origin: search engines should only ever be pointed at the
 * live site, even when CMS_BASE_URL is overridden for local Worker testing.
 */
export const SITE_URL = "https://cyberisrael.net";

/**
 * @param {string} root project root
 * @returns {Promise<string>} the sitemap XML
 */
export async function buildSitemap(root = process.cwd()) {
  const pages = readIndexedRoutes(root).map(({ path, indexed }) => ({
    url: path,
    changefreq: indexed.changefreq,
    priority: indexed.priority,
  }));

  const articles = readArticles(root).map((article) => ({
    url: `/articles/${article.href}`,
    lastmod: article.date,
    changefreq: "monthly",
    priority: 0.8,
  }));

  const stream = new SitemapStream({ hostname: SITE_URL });
  const xml = await streamToPromise(
    Readable.from([...pages, ...articles]).pipe(stream),
  );
  return xml.toString();
}
