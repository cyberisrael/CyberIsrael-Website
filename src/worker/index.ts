/**
 * The Worker in front of the site's static assets.
 *
 * Right now it does nothing but hand every request back to the asset layer — the point
 * of this commit is the wiring, not the behaviour. Putting the entry point in place on
 * its own means the build output moving from `dist/` to `dist/client` plus a Worker
 * bundle is an isolated change that can be verified before any sign-in code exists.
 *
 * The CMS sign-in routes land here next.
 */

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
}

export default {
  async fetch(request: Request, env: Env) {
    // `not_found_handling: single-page-application` lives on the asset layer, so routing
    // back through it is what keeps a deep link like /articles/<slug> resolving.
    return env.ASSETS.fetch(request)
  },
}
