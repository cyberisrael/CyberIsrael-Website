import { readdirSync } from "node:fs";
import { extname, join } from "node:path";

/** Extensions that need an explicit charset, and the type served for each. */
const TEXT_TYPES = {
  ".txt": "text/plain",
  ".md": "text/markdown",
};

/**
 * Without a charset, browsers decode text as the reader's locale default (Windows-1255
 * on Hebrew systems), garbling the Hebrew. Rules name each file that actually ships
 * rather than `/*.txt`, since a wildcard would also relabel the SPA fallback's
 * index.html for missing paths.
 *
 * @param {string} root project root
 * @param {string[]} generatedFiles paths emitted by the build alongside public/
 * @returns {string} the Cloudflare `_headers` file
 */
export function buildHeaders(root = process.cwd(), generatedFiles = []) {
  const publicFiles = readdirSync(join(root, "public"), { recursive: true });
  const paths = [...publicFiles, ...generatedFiles]
    .map((file) => `/${file.replaceAll("\\", "/")}`)
    .filter((path) => TEXT_TYPES[extname(path)])
    .sort();

  return paths
    .map(
      (path) =>
        `${path}\n  Content-Type: ${TEXT_TYPES[extname(path)]}; charset=utf-8\n`,
    )
    .join("");
}
