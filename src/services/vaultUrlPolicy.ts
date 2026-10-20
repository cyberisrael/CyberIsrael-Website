/**
 * Which links the knowledge vault may show. Shared by the browser and the Worker, so it
 * must stay free of DOM-only APIs.
 *
 * Anyone will eventually be able to add entries, so a link is shown only if its host is
 * listed here. Adding a host is a code change on purpose: it goes through PR review.
 */

/** A host matches when it is one of these or a subdomain of one (`www.`, `m.`). */
export const VAULT_ALLOWED_HOSTS = [
  "drive.google.com",
  "docs.google.com",
  "instagram.com",
  "youtube.com",
  "youtu.be",
  "github.com",
] as const;

const isAllowedHost = (host: string) =>
  VAULT_ALLOWED_HOSTS.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`),
  );

/**
 * HTTPS only (which also rules out `javascript:` and `data:`), no `user@host` credentials
 * to disguise the real host, no explicit port, and an allowlisted host — which in turn rules
 * out raw IPs and punycode lookalikes.
 */
export const isAllowedVaultUrl = (url: string): boolean => {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return false;
  }
  return (
    parsed.protocol === "https:" &&
    parsed.username === "" &&
    parsed.password === "" &&
    parsed.port === "" &&
    isAllowedHost(parsed.hostname.toLowerCase())
  );
};
