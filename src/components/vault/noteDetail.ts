import type { VaultNote } from "./types";

const hostname = (url: string) => {
  try {
    return new URL(url.trim()).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/** Short detail under a note's title: its description, an article's excerpt, or where it's hosted. */
export const noteDetail = (note: VaultNote) => {
  if (note.kind === "article") return note.article.excerpt;
  if (note.description) return note.description;
  if (note.kind === "embed") return hostname(note.src);
  return hostname(note.url);
};
