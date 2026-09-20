/**
 * Starts Decap's local backend proxy, bound to loopback.
 *
 * `decap-server` listens on every interface unless `BIND_HOST` is set, and it has no
 * authentication on `POST /api/v1` — that endpoint writes a client-supplied path,
 * checked only to be somewhere under the repository root. Left on `0.0.0.0` it lets
 * anything that can reach port 8081 overwrite any file in the working tree, `.git/`
 * included, for as long as the CMS is running.
 *
 * The bind is the only control there is, so it belongs in the committed script rather
 * than in a `.env` nobody else would have. An explicit `BIND_HOST` still wins, and
 * `dotenv` (which decap-server loads) does not override what is already set. `||=` rather
 * than `??=` because decap-server tests the value for truthiness, so an empty string would
 * otherwise survive and land straight back on the all-interfaces branch.
 */
process.env.BIND_HOST ||= '127.0.0.1'

await import('decap-server/dist/index.js')
