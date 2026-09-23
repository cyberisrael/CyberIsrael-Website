/**
 * Authorisation: may the person behind this token edit the site?
 *
 * Authentication only established *who* they are. This is the separate question of
 * whether they are allowed in, and it is asked of GitHub with the token we just issued —
 * never of anything the browser sent us. Email addresses, usernames and any claim
 * arriving with the request are all forgeable; organisation membership as GitHub reports
 * it is not.
 *
 * Repository write access is deliberately not checked here. Decap already asks GitHub for
 * it (`permissions.push` on the repo) before it will load, and GitHub enforces it on
 * every write regardless — a token without push access simply cannot commit. Repeating
 * the check in the Worker would add a request and no enforcement.
 */

export const ORGANISATION = 'cyberisrael'

const API_ROOT = 'https://api.github.com'

/**
 * `GET /user/memberships/orgs/{org}` answers for the token's own user, which is what we
 * want: it needs no username lookup and it sees private membership, unlike
 * `/orgs/{org}/public_members/{username}`, which would lock out anyone who keeps their
 * membership private. It requires `read:org` — without that scope GitHub answers 403.
 *
 * Fails closed. Only an explicit `200` carrying `state: "active"` is a yes; everything
 * else is a no, including the cases that are not really about membership at all:
 *
 *   200 + "active"   the one authorised case
 *   200 + "pending"  invited, has not accepted
 *   401              token rejected
 *   403              missing `read:org`, or the organisation blocks this app
 *   404              not affiliated with the organisation
 *   throw            network failure, timeout, or a body that is not JSON
 *
 * A failure to verify is not evidence of membership, so it can never be treated as one.
 */
export async function isOrganisationMember(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_ROOT}/user/memberships/orgs/${ORGANISATION}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'cyberisrael-cms',
      },
    })

    if (!response.ok) return false

    const membership = (await response.json()) as { state?: string }
    return membership.state === 'active'
  } catch {
    return false
  }
}
