import { isAllowedVaultUrl } from "./vaultUrlPolicy";
import noteTypes from "./vaultNoteTypes.json";

export const VAULT_RESOURCES_URL = "/knowledge-vault.json";

/** Either one string for every language, or one per language code (`en`, `he`). */
export type LocalizedText = string | Record<string, string>;

/**
 * The note types live in `vaultNoteTypes.json`, which the CMS reads too. A JSON import
 * keeps its keys as literals, so adding a type there fails `tsc` until it has an icon.
 */
export type VaultNoteType = keyof typeof noteTypes;

/** Each type becomes one folder in the vault, in this order. */
export const VAULT_NOTE_TYPES = Object.keys(noteTypes) as VaultNoteType[];

export interface VaultResource {
  id: string;
  /** Optional in the file when it can be deduced from `url` (see `typeFromUrl`); always set once fetched. */
  type: VaultNoteType;
  /** Optional for Instagram posts, which fall back to "Instagram post #n". */
  title?: LocalizedText;
  description?: LocalizedText;
  url: string;
  /** Names where the resource lives ("from …"); overrides the source deduced from `url` (see `sourceFromUrl`). */
  from?: LocalizedText;
}

export interface VaultFeaturedConfig {
  emoji: string;
  graphColor: string;
  description?: LocalizedText;
  /** Note ids in display order; an article is `article-<slug>`. */
  items: string[];
}

export interface VaultResources {
  notes: VaultResource[];
  featured: VaultFeaturedConfig;
}

const DEFAULT_FEATURED: VaultFeaturedConfig = {
  emoji: "⭐",
  graphColor: "#fbbf24",
  description: "Recommended",
  items: [],
};

export const EMPTY_VAULT_RESOURCES: VaultResources = {
  notes: [],
  featured: DEFAULT_FEATURED,
};

const isLocalizedText = (value: unknown): value is LocalizedText =>
  typeof value === "string" ||
  (!!value &&
    typeof value === "object" &&
    Object.values(value).every((text) => typeof text === "string"));

type RawResource = Omit<VaultResource, "type"> & { type?: VaultNoteType };

const isResource = (value: unknown): value is RawResource => {
  if (!value || typeof value !== "object") return false;
  const { id, type, title, description, url, from } = value as Record<
    string,
    unknown
  >;
  return (
    typeof id === "string" &&
    (type === undefined || VAULT_NOTE_TYPES.includes(type as VaultNoteType)) &&
    typeof url === "string" &&
    (title === undefined || isLocalizedText(title)) &&
    (description === undefined || isLocalizedText(description)) &&
    (from === undefined || isLocalizedText(from))
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

type UrlRule = { host: string; path?: string };

/**
 * The type a link implies, for notes that leave `type` out. The rules are each type's
 * `match` list in `vaultNoteTypes.json`; the CMS applies the same ones (admin/vault.js).
 */
const typeFromUrl = (url: string): VaultNoteType | undefined => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }
  const host = parsed.hostname.replace(/^www\./, "");
  const segment = parsed.pathname.split("/")[1];
  return VAULT_NOTE_TYPES.find((type) =>
    (noteTypes[type].match as UrlRule[]).some(
      (rule) =>
        rule.host === host &&
        (rule.path === undefined || rule.path === segment),
    ),
  );
};

/** Where a link points, named by `resources.vault.source.<source>`. */
export type VaultSource = "drive" | "instagram" | "youtube" | "other";

/** The source a link's host implies, for notes that leave `from` out. */
export const sourceFromUrl = (url: string): VaultSource => {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return "other";
  }
  const host = parsed.hostname.replace(/^www\./, "");
  if (host === "drive.google.com" || host === "docs.google.com") return "drive";
  if (host === "instagram.com") return "instagram";
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be")
    return "youtube";
  return "other";
};

/**
 * The player URL for a YouTube video or playlist, since the watch/share URLs people paste
 * refuse to load in an iframe. `undefined` for anything that isn't one (a channel page).
 */
export const youtubeEmbedUrl = (url: string): string | undefined => {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return undefined;
  }
  const host = parsed.hostname.replace(/^www\./, "");
  const [first, second] = parsed.pathname.split("/").slice(1);
  const list = parsed.searchParams.get("list");
  const start = parsed.searchParams.get("t")?.replace(/s$/, "");

  let id: string | null | undefined;
  if (host === "youtu.be") id = first;
  else if (first === "watch") id = parsed.searchParams.get("v");
  else if (first === "shorts" || first === "live" || first === "embed")
    id = second;
  else if (first === "playlist" && list)
    return `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(list)}`;
  if (!id || !/^[\w-]+$/.test(id)) return undefined;

  const embed = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
  if (list) embed.searchParams.set("list", list);
  if (start && /^\d+$/.test(start)) embed.searchParams.set("start", start);
  return embed.toString();
};

/** How tall a Drive embed is: videos and slides are 16:9, documents and sheets fill the page. */
export const embedRatio = (url: string): "video" | "page" => {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return "page";
  }
  const host = parsed.hostname.replace(/^www\./, "");
  if (host === "drive.google.com") return "video";
  return parsed.pathname.split("/")[1] === "presentation" ? "video" : "page";
};

/**
 * The Worker already strips these before the file is served; checking again here covers
 * any setup where it isn't running (and keeps a `javascript:` URL out of an `href`).
 */
const withAllowedUrl = (notes: RawResource[]): RawResource[] =>
  notes.filter((note) => {
    if (isAllowedVaultUrl(note.url)) return true;
    console.warn(
      `${VAULT_RESOURCES_URL}: skipping "${note.id}", whose URL is not on the allowlist (see vaultUrlPolicy.ts)`,
    );
    return false;
  });

/** An explicit `type` always wins; otherwise the URL decides, and a note neither settles is left out. */
const withType = (notes: RawResource[]): VaultResource[] =>
  notes.flatMap((note) => {
    const type = note.type ?? typeFromUrl(note.url);
    if (type) return [{ ...note, type }];
    console.warn(
      `${VAULT_RESOURCES_URL}: skipping "${note.id}", which has no "type" and a URL that doesn't imply one`,
    );
    return [];
  });

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
    notes: withType(withAllowedUrl(validList(record, "notes", isResource))),
    featured: featuredConfig(record.featured),
  };
};

/** Picks the text for `lang`, falling back to English and then to whatever language is there. */
export const localize = (text: LocalizedText | undefined, lang: string) => {
  if (text === undefined || typeof text === "string") return text;
  const code = lang.split("-")[0];
  return text[code] ?? text.en ?? Object.values(text)[0];
};
