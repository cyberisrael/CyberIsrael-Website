/**
 * The Worker in front of the site's static assets, and the CMS sign-in endpoints.
 *
 * A static site cannot complete an OAuth handshake on its own: the exchange needs a
 * client secret, which must never reach a browser. This Worker does that half and
 * nothing else — once Decap holds a token it talks to api.github.com directly, so no
 * content traffic passes through here.
 *
 * Setup (once):
 *   1. Create an OAuth app with the callback URL https://cyberisrael.net/oauth/callback
 *      and "Expire user access tokens" left OFF — Decap's GitHub backend has no refresh
 *      path, so an expiring token would strand an editor mid-edit after eight hours.
 *   2. npx wrangler secret put GITHUB_CLIENT_ID
 *      npx wrangler secret put GITHUB_CLIENT_SECRET
 */

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
  GITHUB_CLIENT_ID?: string
  GITHUB_CLIENT_SECRET?: string
}

const PROVIDER = 'github'

/**
 * Pinned here rather than taken from the request. Decap appends its own `?scope=` when it
 * opens the popup — and defaults it to `repo`, which would hand the browser write access
 * to every private repository the editor can see. This repository is public, so
 * `public_repo` is all the CMS needs; `read:org` is what makes the membership check
 * possible, and GitHub answers /user/memberships/orgs with 403 without it.
 */
const SCOPE = 'public_repo,read:org'

/**
 * GitHub reports a refused authorisation by redirecting back with `?error=`, not by
 * failing the request. The messages are looked up here rather than taken from GitHub's
 * `error_description`, which is attacker-controllable: anyone can open
 * /oauth/callback?error=…&error_description=… and, if it were echoed, choose the text
 * the editor reads. Codes outside this map fall back to a fixed sentence.
 */
const OAUTH_ERRORS: Record<string, string> = {
  access_denied: 'Sign-in was cancelled.',
  application_suspended: 'This GitHub app has been suspended.',
  redirect_uri_mismatch: 'The CMS sign-in is misconfigured: GitHub rejected the callback URL.',
  incorrect_client_credentials: 'The CMS sign-in is misconfigured: GitHub rejected the client credentials.',
}

const STATE_COOKIE = 'cms_oauth_state'
const STATE_COOKIE_ATTRS = 'Path=/oauth; HttpOnly; Secure; SameSite=Lax'
/** The state cookie is single-use: once the callback has read it, it is spent. */
const CLEAR_STATE_COOKIE = `${STATE_COOKIE}=; ${STATE_COOKIE_ATTRS}; Max-Age=0`

const escapeForScript = (value: string) => JSON.stringify(value).replace(/</g, '\\u003c')

/**
 * Decap will not accept a token until it has completed a handshake — see the
 * Authenticator in decap-cms-lib-auth: the popup announces `authorizing:<provider>`,
 * Decap echoes it back, and only then does Decap listen for
 * `authorization:<provider>:success:<json>`.
 *
 * Both sides of that exchange are pinned to `origin`, which is the origin this Worker is
 * serving and therefore the origin /admin is served from. A page on any other origin that
 * opens this popup hoping to be handed the token never receives one: the browser drops a
 * postMessage whose target origin doesn't match.
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
          // Only Decap's echo means it is listening. Any other same-origin message — a
          // second CMS tab, an embed, a service worker — would otherwise burn this
          // one-shot listener, and the token would be posted into a window that has not
          // attached its handler yet, leaving the popup hanging with no error.
          if (event.data !== 'authorizing:${PROVIDER}') return;
          window.removeEventListener('message', send, false);
          window.opener.postMessage(message, origin);
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

const htmlResponse = (body: string) =>
  new Response(body, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // The success page carries the token in its body, so it must not be stored.
      'Cache-Control': 'no-store',
    },
  })

/**
 * Every outcome is HTTP 200 on purpose. The popup's job is to postMessage a result back
 * to Decap; a 4xx would render a bare error page the CMS never hears about.
 */
const failure = (origin: string, message: string) =>
  htmlResponse(handshakePage(origin, 'error', { message }))

function startAuth(request: Request, env: Env) {
  const { origin } = new URL(request.url)

  if (!env.GITHUB_CLIENT_ID) return failure(origin, 'The CMS is missing its GitHub client id.')

  const state = crypto.randomUUID()
  const redirectUri = new URL('/oauth/callback', request.url).toString()

  const authorize = new URL('https://github.com/login/oauth/authorize')
  authorize.searchParams.set('client_id', env.GITHUB_CLIENT_ID)
  // Derived from this request, never from a query parameter: a caller-supplied
  // redirect_uri would be an open redirect and could divert the authorisation code.
  authorize.searchParams.set('redirect_uri', redirectUri)
  authorize.searchParams.set('scope', SCOPE)
  authorize.searchParams.set('state', state)

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorize.toString(),
      'Cache-Control': 'no-store',
      // Ties the callback to this browser so a stray callback URL can't be replayed.
      'Set-Cookie': `${STATE_COOKIE}=${state}; ${STATE_COOKIE_ATTRS}; Max-Age=600`,
    },
  })
}

const readStateCookie = (request: Request) =>
  request.headers
    .get('Cookie')
    ?.split(';')
    .map(part => part.trim().split('='))
    .find(([name]) => name === STATE_COOKIE)?.[1]

async function completeAuth(request: Request, env: Env) {
  const url = new URL(request.url)
  const { origin } = url

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return failure(origin, 'The CMS is missing its GitHub credentials.')
  }

  // Checked before the code, because a refusal arrives with an error and no code — and
  // "GitHub did not return an authorisation code" is a confusing way to say "you pressed
  // Cancel".
  const error = url.searchParams.get('error')
  if (error) {
    return failure(origin, OAUTH_ERRORS[error] ?? 'GitHub refused the sign-in request.')
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

  // `token` is the only field Decap's GitHub backend reads — it does `this.token =
  // state.token` and drops the rest — so there is no point sending more.
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
