import { IconType } from "react-icons";
import type { Article } from "@/services/articlesData";

interface NoteBase {
  /** Stable id, also used as the `?note=` query param. */
  id: string;
  title: string;
  /** Shown as an Obsidian-style `#tag` pill under the title. */
  tag: string;
}

export type VaultNote =
  | (NoteBase & {
      kind: "embed";
      src: string;
      /** `video` keeps 16:9 (lectures, slides); `page` fills the pane (docs, sheets). */
      ratio: "video" | "page";
    })
  | (NoteBase & { kind: "article"; article: Article })
  | (NoteBase & { kind: "instagram"; url: string });

export interface VaultFolder {
  id: string;
  title: string;
  icon: IconType;
  notes: VaultNote[];
}
