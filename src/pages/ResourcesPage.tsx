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
  embedRatio,
  sourceFromUrl,
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
 * Which folder each note type goes in, with its icon and colour (the note's halo in the graph and
 * its text in the sidebar). How a note renders comes from its own URL, not from here.
 */
const NOTE_TYPE_CONFIG: Record<
  VaultNoteType,
  {
    folderId: string;
    icon: IconType;
    color: string;
  }
> = {
  lecture: {
    folderId: "lectures",
    icon: LuVideo,
    color: "#04c92f",
  },
  roadmap: {
    folderId: "roadmaps",
    icon: LuMap,
    color: "#a78bfa",
  },
  slides: {
    folderId: "slides",
    icon: LuPresentation,
    color: "#ffe836",
  },
  document: {
    folderId: "documents",
    icon: LuFileText,
    color: "#60a5fa",
  },
  spreadsheet: {
    folderId: "spreadsheets",
    icon: LuSheet,
    color: "#4ade80",
  },
  instagram: {
    folderId: "instagram",
    icon: LuInstagram,
    color: "#f472b6",
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
        source: {
          label: t("resources.vault.source.site"),
          url: `/articles/${article.href}`,
        },
        article,
      })),
    };

    const typeFolders = VAULT_NOTE_TYPES.map((type): VaultFolder => {
      const { folderId, icon, color } = NOTE_TYPE_CONFIG[type];
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
            // The URL alone decides how the note renders, whatever folder it's in.
            const origin = sourceFromUrl(note.url);
            const source = {
              label:
                localize(note.from, lang) ??
                t(`resources.vault.source.${origin}`),
              url: note.url.trim(),
            };
            if (origin === "unknown")
              return {
                kind: "link" as const,
                id: note.id,
                title: title ?? note.id,
                description,
                source,
                url: note.url,
              };
            if (origin === "instagram")
              return {
                kind: "instagram" as const,
                id: note.id,
                title:
                  title ??
                  t("resources.vault.instagram_post", { number: index + 1 }),
                description,
                source,
                url: note.url,
              };
            return {
              kind: "embed" as const,
              id: note.id,
              title: title ?? note.id,
              description,
              source,
              src: note.url,
              ratio: embedRatio(note.url),
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

          <h2
            id="vault-featured-title"
            style={{
              color: resources?.featured.graphColor,
              // `currentColor` is the featured colour above; softer on white, where a glow smudges.
              textShadow: isDark
                ? "0 0 10px color-mix(in srgb, currentColor 90%, transparent), 0 0 16px color-mix(in srgb, currentColor 45%, transparent)"
                : "0 0 16px color-mix(in srgb, currentColor 35%, transparent)",
            }}
            className={`flex items-center gap-1.5 mb-2 font-display tracking-widest uppercase font-bold mt-3`}
          >
            {localize(resources?.featured.description, i18n.language)}
          </h2>
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
