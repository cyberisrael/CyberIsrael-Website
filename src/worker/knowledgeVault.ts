/**
 * Serves /knowledge-vault.json with every entry whose URL fails the shared allowlist
 * (`isAllowedVaultUrl`: HTTPS, trusted hosts only) removed, so it never reaches the graph.
 * The raw file is only ever read through ASSETS, never served as-is.
 */

import { isAllowedVaultUrl } from '../services/vaultUrlPolicy'

export interface KnowledgeVaultEnv {
  ASSETS: { fetch(request: Request): Promise<Response> }
}

type Note = { id?: unknown; url?: unknown }

const jsonResponse = (body: string) =>
  new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // The browser revalidates every time (see fetchVaultResources).
      'Cache-Control': 'no-cache',
    },
  })

export async function serveKnowledgeVault(request: Request, env: KnowledgeVaultEnv) {
  // A fresh request, without the browser's conditional headers: a 304 for the raw file
  // would say nothing about whether the filtered version changed.
  const asset = await env.ASSETS.fetch(new Request(request.url))
  if (!asset.ok) return asset
  const raw = await asset.text()

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

  return jsonResponse(JSON.stringify({ ...data, notes: allowed }))
}
