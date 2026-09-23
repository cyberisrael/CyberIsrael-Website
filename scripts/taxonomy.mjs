import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const TAXONOMY_PATH = join('src', 'services', 'articleTaxonomy.json')

/** Categories and topics shared by the site and the CMS. */
export function readTaxonomy(root = process.cwd()) {
  return JSON.parse(readFileSync(join(root, TAXONOMY_PATH), 'utf8'))
}
