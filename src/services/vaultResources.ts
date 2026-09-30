export const VAULT_RESOURCES_URL = "/knowledge-vault.json";

/** Either one string for every language, or one per language code (`en`, `he`). */
export type LocalizedText = string | Record<string, string>;

export interface VaultResource {
  id: string;
  /** Optional for Instagram posts, which fall back to "Instagram post #n". */
  title?: LocalizedText;
  description?: LocalizedText;
  url: string;
}

type ResourceListKey = "lectures" | "roadmaps" | "slides" | "instagram";

export interface VaultFeaturedConfig {
  emoji: string;
  graphColor: string;
  description?: LocalizedText;
  /** Note ids in display order; an article is `article-<slug>`. */
  items: string[];
}

export type VaultResources = Record<ResourceListKey, VaultResource[]> & {
  featured: VaultFeaturedConfig;
};

const DEFAULT_FEATURED: VaultFeaturedConfig = {
  emoji: "⭐",
  graphColor: "#fbbf24",
  description: "Recommended",
  items: [],
};

export const EMPTY_VAULT_RESOURCES: VaultResources = {
  lectures: [],
  roadmaps: [],
  slides: [],
  instagram: [],
  featured: DEFAULT_FEATURED,
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
  key: string,
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

const isId = (id: unknown): id is string => typeof id === "string";

const featuredConfig = (value: unknown): VaultFeaturedConfig => {
  if (value === undefined) return DEFAULT_FEATURED;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    console.warn(
      `${VAULT_RESOURCES_URL}: "featured" should be { emoji, graphColor, items }`,
    );
    return DEFAULT_FEATURED;
  }
  const { emoji, graphColor, description } = value as Record<string, unknown>;

  const validEmoji = typeof emoji === "string" && emoji.trim() !== "";
  if (emoji !== undefined && !validEmoji)
    console.warn(`${VAULT_RESOURCES_URL}: ignoring invalid "featured.emoji"`);

  const validColor =
    typeof graphColor === "string" && CSS.supports("color", graphColor);
  if (graphColor !== undefined && !validColor)
    console.warn(
      `${VAULT_RESOURCES_URL}: ignoring invalid "featured.graphColor"`,
      graphColor,
    );

  const validDescription =
    description === undefined || isLocalizedText(description);
  if (description !== undefined && !validDescription)
    console.warn(
      `${VAULT_RESOURCES_URL}: ignoring invalid "featured.description"`,
      description,
    );

  return {
    emoji: validEmoji ? emoji.trim() : DEFAULT_FEATURED.emoji,
    graphColor: validColor ? graphColor : DEFAULT_FEATURED.graphColor,
    description: validDescription ? description : DEFAULT_FEATURED.description,
    items: validList(value as Record<string, unknown>, "items", isId),
  };
};

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
    featured: featuredConfig(record.featured),
  };
};

/** Picks the text for `lang`, falling back to English and then to whatever language is there. */
export const localize = (text: LocalizedText | undefined, lang: string) => {
  if (text === undefined || typeof text === "string") return text;
  const code = lang.split("-")[0];
  return text[code] ?? text.en ?? Object.values(text)[0];
};
