/**
 * OAuth gate for the CMS at /admin.
 *
 * GitHub can't complete an OAuth handshake from a static site, so this Worker does it:
 * it exchanges the code for a token and hands it to Decap only when the person is an
 * active member of the GitHub organisation. Everything else falls through to the site's
 * static assets untouched.
 *
 * Setup (once):
 *   1. Create an OAuth app under the organisation with the callback URL
 *      https://cyberisrael.net/oauth/callback
 *   2. npx wrangler secret put GITHUB_CLIENT_ID
 *      npx wrangler secret put GITHUB_CLIENT_SECRET
 */

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
  GITHUB_CLIENT_ID?: string
  GITHUB_CLIENT_SECRET?: string
}

const ORGANISATION = 'cyberisrael'
const PROVIDER = 'github'
/**
 * `public_repo` lets the CMS commit to this repository — it is public, so the broader
 * `repo` scope would hand the browser write access to every private repo the editor can
 * see, for nothing. `read:org` is what makes the membership check possible.
 */
const SCOPE = 'public_repo,read:org'
const STATE_COOKIE = 'cms_oauth_state'
const STATE_COOKIE_PATH = 'Path=/oauth; HttpOnly; Secure; SameSite=Lax'
/** The state cookie is single-use: once the callback has read it, it is spent. */
const CLEAR_STATE_COOKIE = `${STATE_COOKIE}=; ${STATE_COOKIE_PATH}; Max-Age=0`

const escapeForScript = (value: string) => JSON.stringify(value).replace(/</g, '\\u003c')

/**
 * Decap listens for a handshake before it accepts the token — see the Authenticator in
 * decap-cms-lib-auth: it waits for `authorizing:<provider>`, echoes it back, and only
 * then reads `authorization:<provider>:success:<json>`.
 *
 * Both sides of that exchange are pinned to `origin`, the origin this Worker is serving,
 * which is also where /admin is served from. A page on any other origin that opens this
 * popup hoping to be handed the token never receives one: the browser drops a
 * `postMessage` whose target origin doesn't match the opener.
 */
const handshakePage = (origin: string, status: 'success' | 'error', payload: unknown) => `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /><title>Signing in…</title></head>
  <body>
    <p>Completing sign-in…</p>
    <script>
      (function () {
        var origin = ${escapeForScript(origin)};
        var message = 'authorization:${PROVIDER}:${status}:' + ${escapeForScript(JSON.stringify(payload))};

        function send(event) {
          if (event.origin !== origin) return;
          window.opener.postMessage(message, origin);
          window.removeEventListener('message', send, false);
        }

        if (!window.opener) {
          document.body.textContent = 'This page must be opened from the CMS.';
          return;
        }

        window.addEventListener('message', send, false);
        window.opener.postMessage('authorizing:${PROVIDER}', origin);
      })();
    </script>
  </body>
</html>`

const htmlResponse = (body: string, status = 200) =>
  new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // The success page carries the token in its body, so it must not be stored.
      'Cache-Control': 'no-store',
    },
  })

const failure = (origin: string, message: string) =>
  htmlResponse(handshakePage(origin, 'error', { message }))

function startAuth(request: Request, env: Env) {
  const { origin } = new URL(request.url)

  if (!env.GITHUB_CLIENT_ID) return failure(origin, 'The CMS is missing its GitHub client id.')

  const state = crypto.randomUUID()
  const redirectUri = new URL('/oauth/callback', request.url).toString()

  const authorize = new URL('https://github.com/login/oauth/authorize')
  authorize.searchParams.set('client_id', env.GITHUB_CLIENT_ID)
  authorize.searchParams.set('redirect_uri', redirectUri)
  authorize.searchParams.set('scope', SCOPE)
  authorize.searchParams.set('state', state)

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorize.toString(),
      'Cache-Control': 'no-store',
      // Ties the callback to this browser so a stray callback URL can't be replayed.
      'Set-Cookie': `${STATE_COOKIE}=${state}; ${STATE_COOKIE_PATH}; Max-Age=600`,
    },
  })
}

const readStateCookie = (request: Request) =>
  request.headers
    .get('Cookie')
    ?.split(';')
    .map(part => part.trim().split('='))
    .find(([name]) => name === STATE_COOKIE)?.[1]

async function isOrganisationMember(token: string) {
  const response = await fetch(`https://api.github.com/user/memberships/orgs/${ORGANISATION}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'cyberisrael-cms',
    },
  })

  if (!response.ok) return false

  const membership = (await response.json()) as { state?: string }
  return membership.state === 'active'
}

async function completeAuth(request: Request, env: Env) {
  const url = new URL(request.url)
  const { origin } = url

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return failure(origin, 'The CMS is missing its GitHub credentials.')
  }

  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  if (!code) return failure(origin, 'GitHub did not return an authorisation code.')
  if (!state || state !== readStateCookie(request)) {
    return failure(origin, 'The sign-in request expired. Please try again.')
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: new URL('/oauth/callback', request.url).toString(),
    }),
  })

  const token = ((await tokenResponse.json()) as { access_token?: string }).access_token
  if (!token) return failure(origin, 'GitHub refused to issue a token.')

  if (!(await isOrganisationMember(token))) {
    return failure(origin, `Only members of the ${ORGANISATION} organisation can edit the site.`)
  }

  return htmlResponse(handshakePage(origin, 'success', { token, provider: PROVIDER }))
}

export default {
  async fetch(request: Request, env: Env) {
    const { pathname } = new URL(request.url)

    if (pathname === '/oauth/auth') return startAuth(request, env)

    if (pathname === '/oauth/callback') {
      const response = await completeAuth(request, env)
      // However it went, the state cookie has been consumed — don't leave it behind.
      response.headers.append('Set-Cookie', CLEAR_STATE_COOKIE)
      return response
    }

    // Everything else is the site itself; ASSETS keeps the SPA fallback behaviour.
    return env.ASSETS.fetch(request)
  },
}
