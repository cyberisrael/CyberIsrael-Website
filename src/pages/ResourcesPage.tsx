import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LuInstagram,
  LuMap,
  LuNewspaper,
  LuPresentation,
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
import { useVaultStyles } from "@/components/vault/useVaultStyles";
import type { VaultFolder } from "@/components/vault/types";

/** How each note type is shown: its folder, icon and how it embeds. The tag is `resources.vault.tag.<type>`. */
const NOTE_TYPE_CONFIG: Record<
  VaultNoteType,
  {
    folderId: string;
    icon: IconType;
    embed: { kind: "embed"; ratio: "video" | "page" } | { kind: "instagram" };
  }
> = {
  lecture: {
    folderId: "lectures",
    icon: LuVideo,
    embed: { kind: "embed", ratio: "video" },
  },
  roadmap: {
    folderId: "roadmaps",
    icon: LuMap,
    embed: { kind: "embed", ratio: "page" },
  },
  slides: {
    folderId: "slides",
    icon: LuPresentation,
    embed: { kind: "embed", ratio: "video" },
  },
  instagram: {
    folderId: "instagram",
    icon: LuInstagram,
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
      notes: articles.map((article) => ({
        kind: "article" as const,
        id: `article-${article.href}`,
        title: article.title,
        tag: t("resources.vault.tag.article"),
        article,
      })),
    };

    const typeFolders = VAULT_NOTE_TYPES.map((type): VaultFolder => {
      const { folderId, icon, embed } = NOTE_TYPE_CONFIG[type];
      const tag = t(`resources.vault.tag.${type}`);
      return {
        id: folderId,
        title: t(`resources.vault.folders.${folderId}`),
        icon,
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

    return [articlesFolder, ...typeFolders];
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
          <KnowledgeVault folders={folders} featured={resources.featured} />
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
