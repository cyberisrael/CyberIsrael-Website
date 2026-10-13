/**
 * Serves /knowledge-vault.json with every suspicious entry removed, so it never reaches
 * the graph. The raw file is only ever read through ASSETS, never served as-is.
 *
 * Two checks, in order:
 *   1. the shared allowlist (`isAllowedVaultUrl`): HTTPS, trusted hosts only;
 *   2. Google Safe Browsing, for what passes — an allowed host such as docs.google.com can
 *      still host a phishing form, and a link can turn bad long after it was added.
 *
 * The result is cached per edge for half an hour, keyed on a hash of the file, so an edit
 * is checked on the very next request and Safe Browsing is asked a couple of times an hour.
 */

import { isAllowedVaultUrl } from '../services/vaultUrlPolicy'

export interface KnowledgeVaultEnv {
  ASSETS: { fetch(request: Request): Promise<Response> }
  SAFE_BROWSING_API_KEY?: string
}

const SAFE_BROWSING_URL = 'https://safebrowsing.googleapis.com/v4/threatMatches:find'
/** Safe Browsing accepts at most this many URLs per lookup. */
const SAFE_BROWSING_BATCH = 500

const CACHE_NAME = 'knowledge-vault'
const CHECKED_TTL = 30 * 60
/** A result Safe Browsing could not vouch for is retried soon rather than kept. */
const UNCHECKED_TTL = 60

type Note = { id?: unknown; url?: unknown }

const sha256 = async (text: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * The URLs Safe Browsing flags, or `undefined` when it could not answer. That includes a
 * missing key: the allowlist still applies, so this fails open on reputation only.
 */
async function flaggedUrls(urls: string[], apiKey: string | undefined) {
  if (!apiKey) {
    console.error('knowledge-vault: SAFE_BROWSING_API_KEY is not set; skipping the reputation check')
    return undefined
  }
  const flagged = new Set<string>()
  try {
    for (let i = 0; i < urls.length; i += SAFE_BROWSING_BATCH) {
      const response = await fetch(`${SAFE_BROWSING_URL}?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: { clientId: 'cyberisrael-website', clientVersion: '1.0' },
          threatInfo: {
            threatTypes: [
              'MALWARE',
              'SOCIAL_ENGINEERING',
              'UNWANTED_SOFTWARE',
              'POTENTIALLY_HARMFUL_APPLICATION',
            ],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: urls.slice(i, i + SAFE_BROWSING_BATCH).map(url => ({ url })),
          },
        }),
      })
      if (!response.ok) {
        console.error(`knowledge-vault: Safe Browsing answered HTTP ${response.status}`)
        return undefined
      }
      // No matches comes back as `{}`.
      const { matches = [] } = (await response.json()) as {
        matches?: { threat?: { url?: string } }[]
      }
      for (const match of matches) if (match.threat?.url) flagged.add(match.threat.url)
    }
  } catch (err) {
    console.error('knowledge-vault: Safe Browsing lookup failed', err)
    return undefined
  }
  return flagged
}

const jsonResponse = (body: string, ttl?: number) =>
  new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // The browser revalidates every time (see fetchVaultResources); only the edge caches.
      'Cache-Control': ttl === undefined ? 'no-cache' : `public, max-age=${ttl}`,
    },
  })

export async function serveKnowledgeVault(request: Request, env: KnowledgeVaultEnv) {
  // A fresh request, without the browser's conditional headers: a 304 for the raw file
  // would say nothing about whether the filtered version changed.
  const asset = await env.ASSETS.fetch(new Request(request.url))
  if (!asset.ok) return asset
  const raw = await asset.text()

  const cache = await caches.open(CACHE_NAME)
  const cacheKey = new Request(`https://knowledge-vault.cache/${await sha256(raw)}`)
  const cached = await cache.match(cacheKey)
  if (cached) return jsonResponse(await cached.text())

  let data: { notes?: unknown }
  try {
    data = JSON.parse(raw)
  } catch {
    // The browser validates the file and reports the problem; there is nothing to filter.
    return jsonResponse(raw)
  }
  if (!data || typeof data !== 'object' || !Array.isArray(data.notes)) return jsonResponse(raw)

  const notes = data.notes as Note[]
  const allowed = notes.filter(note => {
    if (typeof note?.url === 'string' && isAllowedVaultUrl(note.url)) return true
    console.warn(`knowledge-vault: hiding "${String(note?.id)}", whose URL is not allowlisted`, note?.url)
    return false
  })

  const urls = allowed.map(note => (note.url as string).trim())
  const flagged = await flaggedUrls(urls, env.SAFE_BROWSING_API_KEY)
  const safe = flagged
    ? allowed.filter(note => {
        if (!flagged.has((note.url as string).trim())) return true
        console.warn(`knowledge-vault: hiding "${String(note.id)}", flagged by Safe Browsing`, note.url)
        return false
      })
    : allowed

  const body = JSON.stringify({ ...data, notes: safe })
  await cache.put(cacheKey, jsonResponse(body, flagged ? CHECKED_TTL : UNCHECKED_TTL))
  return jsonResponse(body)
}
