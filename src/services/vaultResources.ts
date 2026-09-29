/**
 * The Knowledge Vault's linked resources (lectures, roadmaps, slides, Instagram posts) live in
 * `public/knowledge-vault.json` and are fetched at runtime, so editing them needs no code change
 * or rebuild. Articles are not listed there; they come from the articles index.
 */

export const VAULT_RESOURCES_URL = "/knowledge-vault.json";

/** Either one string for every language, or one per language code (`en`, `he`). */
export type LocalizedText = string | Record<string, string>;

export interface VaultResource {
  /** Stable id, also used as the `?note=` query param, so keep it unchanged once published. */
  id: string;
  /** Optional for Instagram posts, which fall back to "Instagram post #n". */
  title?: LocalizedText;
  /** Short blurb for the featured strip and graph tooltip; falls back to the link's host. */
  description?: LocalizedText;
  url: string;
}

type ResourceListKey = "lectures" | "roadmaps" | "slides" | "instagram";

export type VaultResources = Record<ResourceListKey, VaultResource[]> & {
  /**
   * Note ids pinned above the vault, in display order. Any note can be listed, including an
   * article as `article-<slug>`; ids that match nothing are skipped.
   */
  featured: string[];
};

export const EMPTY_VAULT_RESOURCES: VaultResources = {
  lectures: [],
  roadmaps: [],
  slides: [],
  instagram: [],
  featured: [],
};

const isLocalizedText = (value: unknown): value is LocalizedText =>
  typeof value === "string" ||
  (!!value &&
    typeof value === "object" &&
    Object.values(value).every((text) => typeof text === "string"));

const isResource = (value: unknown): value is VaultResource => {
  if (!value || typeof value !== "object") return false;
  const { id, title, description, url } = value as Record<string, unknown>;
  return (
    typeof id === "string" &&
    typeof url === "string" &&
    (title === undefined || isLocalizedText(title)) &&
    (description === undefined || isLocalizedText(description))
  );
};

/** Keeps the well-formed entries of a list and warns about the rest, so one typo can't blank the page. */
const validList = <T>(
  data: Record<string, unknown>,
  key: keyof VaultResources,
  isValid: (item: unknown) => item is T,
): T[] => {
  const list = data[key];
  if (list === undefined) return [];
  if (!Array.isArray(list)) {
    console.warn(`${VAULT_RESOURCES_URL}: "${key}" should be an array`);
    return [];
  }
  return list.filter((item): item is T => {
    if (isValid(item)) return true;
    console.warn(
      `${VAULT_RESOURCES_URL}: skipping malformed "${key}" entry`,
      item,
    );
    return false;
  });
};

const resourceList = (data: Record<string, unknown>, key: ResourceListKey) =>
  validList(data, key, isResource);

export const fetchVaultResources = async (
  signal?: AbortSignal,
): Promise<VaultResources> => {
  // `no-cache` revalidates, so an edited file shows up without waiting out the browser cache.
  const res = await fetch(VAULT_RESOURCES_URL, { cache: "no-cache", signal });
  if (!res.ok) throw new Error(`${VAULT_RESOURCES_URL}: HTTP ${res.status}`);
  const data: unknown = await res.json();
  if (!data || typeof data !== "object") return EMPTY_VAULT_RESOURCES;
  const record = data as Record<string, unknown>;
  return {
    lectures: resourceList(record, "lectures"),
    roadmaps: resourceList(record, "roadmaps"),
    slides: resourceList(record, "slides"),
    instagram: resourceList(record, "instagram"),
    featured: validList(
      record,
      "featured",
      (id): id is string => typeof id === "string",
    ),
  };
};

/** Picks the text for `lang`, falling back to English and then to whatever language is there. */
export const localize = (text: LocalizedText | undefined, lang: string) => {
  if (text === undefined || typeof text === "string") return text;
  const code = lang.split("-")[0];
  return text[code] ?? text.en ?? Object.values(text)[0];
};
