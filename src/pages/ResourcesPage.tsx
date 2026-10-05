import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LuFileText,
  LuInstagram,
  LuMap,
  LuNewspaper,
  LuPresentation,
  LuSheet,
  LuVideo,
} from "react-icons/lu";
import { useTheme } from "@/context/ThemeContext";
import { articles } from "@/services/articlesData";
import type { IconType } from "react-icons";
import {
  EMPTY_VAULT_RESOURCES,
  fetchVaultResources,
  localize,
  VAULT_NOTE_TYPES,
  type VaultNoteType,
  type VaultResources,
} from "@/services/vaultResources";
import KnowledgeVault from "@/components/vault/KnowledgeVault";
import { VaultResourcesProvider } from "@/components/vault/VaultResourcesContext";
import { useVaultStyles } from "@/components/vault/useVaultStyles";
import type { VaultFolder } from "@/components/vault/types";

const ARTICLES_COLOR = "#22d3ee";

/**
 * How each note type is shown: its folder, icon, colour (the note's halo in the graph and its
 * text in the sidebar) and how it embeds. The tag is `resources.vault.tag.<type>`.
 */
const NOTE_TYPE_CONFIG: Record<
  VaultNoteType,
  {
    folderId: string;
    icon: IconType;
    color: string;
    embed: { kind: "embed"; ratio: "video" | "page" } | { kind: "instagram" };
  }
> = {
  lecture: {
    folderId: "lectures",
    icon: LuVideo,
    color: "#fb923c",
    embed: { kind: "embed", ratio: "video" },
  },
  roadmap: {
    folderId: "roadmaps",
    icon: LuMap,
    color: "#a78bfa",
    embed: { kind: "embed", ratio: "page" },
  },
  slides: {
    folderId: "slides",
    icon: LuPresentation,
    color: "#facc15",
    embed: { kind: "embed", ratio: "video" },
  },
  document: {
    folderId: "documents",
    icon: LuFileText,
    color: "#60a5fa",
    embed: { kind: "embed", ratio: "page" },
  },
  spreadsheet: {
    folderId: "spreadsheets",
    icon: LuSheet,
    color: "#4ade80",
    embed: { kind: "embed", ratio: "page" },
  },
  instagram: {
    folderId: "instagram",
    icon: LuInstagram,
    color: "#f472b6",
    embed: { kind: "instagram" },
  },
};

const ResourcesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const c = useVaultStyles();
  const isDark = theme === "dark";
  const [resources, setResources] = useState<VaultResources | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchVaultResources(controller.signal)
      .then(setResources)
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error(err);
        // Still show the articles, which don't depend on the file.
        setResources(EMPTY_VAULT_RESOURCES);
      });
    return () => controller.abort();
  }, []);

  const folders = useMemo<VaultFolder[]>(() => {
    if (!resources) return [];
    const lang = i18n.language;

    const articlesFolder: VaultFolder = {
      id: "articles",
      title: t("resources.vault.folders.articles"),
      icon: LuNewspaper,
      color: ARTICLES_COLOR,
      notes: articles.map((article) => ({
        kind: "article" as const,
        id: `article-${article.href}`,
        title: article.title,
        tag: t("resources.vault.tag.article"),
        article,
      })),
    };

    const typeFolders = VAULT_NOTE_TYPES.map((type): VaultFolder => {
      const { folderId, icon, color, embed } = NOTE_TYPE_CONFIG[type];
      const tag = t(`resources.vault.tag.${type}`);
      return {
        id: folderId,
        title: t(`resources.vault.folders.${folderId}`),
        icon,
        color,
        notes: resources.notes
          .filter((note) => note.type === type)
          .map((note, index) => {
            const description = localize(note.description, lang);
            const title = localize(note.title, lang);
            if (embed.kind === "instagram")
              return {
                kind: "instagram" as const,
                id: note.id,
                title:
                  title ??
                  t("resources.vault.instagram_post", { number: index + 1 }),
                description,
                tag,
                url: note.url,
              };
            return {
              kind: "embed" as const,
              id: note.id,
              title: title ?? note.id,
              description,
              tag,
              src: note.url,
              ratio: embed.ratio,
            };
          }),
      };
    });

    // A type with nothing in the file yet would only be an empty sun in the graph.
    return [
      articlesFolder,
      ...typeFolders.filter((folder) => folder.notes.length > 0),
    ];
    // i18n.language re-runs this when the language switches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, i18n.language, resources]);

  return (
    <div className="min-h-screen pt-24 pb-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 text-start">
          <span
            className={`font-display text-xs tracking-widest uppercase ${
              isDark ? "text-cyber-green" : "text-light-blue"
            }`}
          >
            {t("resources.subtitle")}
          </span>
          <h1
            className={`font-display text-2xl md:text-3xl font-bold mt-1 ${
              isDark ? "text-white" : "text-light-text"
            }`}
          >
            {t("resources.title")}
          </h1>
        </header>

        {/* The vault reads `?note=` once on mount, so it waits for every note to exist. */}
        {resources ? (
          <VaultResourcesProvider resources={resources}>
            <KnowledgeVault folders={folders} />
          </VaultResourcesProvider>
        ) : (
          <div
            aria-busy="true"
            className={`h-[calc(100vh-12rem)] min-h-[560px] rounded-xl border animate-pulse ${c.frame}`}
          />
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;
