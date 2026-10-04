import { IconType } from "react-icons";
import type { Article } from "@/services/articlesData";

interface NoteBase {
  id: string;
  title: string;
  tag: string;
  description?: string;
}

export type VaultNote =
  | (NoteBase & {
      kind: "embed";
      src: string;
      ratio: "video" | "page";
    })
  | (NoteBase & { kind: "article"; article: Article })
  | (NoteBase & { kind: "instagram"; url: string });

export interface VaultFolder {
  id: string;
  title: string;
  icon: IconType;
  /** Any CSS colour; tints the folder's notes (their halo in the graph, their text in the sidebar). */
  color: string;
  notes: VaultNote[];
}
