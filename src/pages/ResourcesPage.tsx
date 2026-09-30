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
import {
  EMPTY_VAULT_RESOURCES,
  fetchVaultResources,
  localize,
  type VaultResources,
} from "@/services/vaultResources";
import KnowledgeVault from "@/components/vault/KnowledgeVault";
import { useVaultStyles } from "@/components/vault/useVaultStyles";
import type { VaultFolder } from "@/components/vault/types";

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

    return [
      {
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
      },
      {
        id: "lectures",
        title: t("resources.vault.folders.lectures"),
        icon: LuVideo,
        notes: resources.lectures.map((lecture) => ({
          kind: "embed" as const,
          id: lecture.id,
          title: localize(lecture.title, lang) ?? lecture.id,
          description: localize(lecture.description, lang),
          tag: t("resources.vault.tag.lecture"),
          src: lecture.url,
          ratio: "video" as const,
        })),
      },
      {
        id: "roadmaps",
        title: t("resources.vault.folders.roadmaps"),
        icon: LuMap,
        notes: resources.roadmaps.map((roadmap) => ({
          kind: "embed" as const,
          id: roadmap.id,
          title: localize(roadmap.title, lang) ?? roadmap.id,
          description: localize(roadmap.description, lang),
          tag: t("resources.vault.tag.roadmap"),
          src: roadmap.url,
          ratio: "page" as const,
        })),
      },
      {
        id: "slides",
        title: t("resources.vault.folders.slides"),
        icon: LuPresentation,
        notes: resources.slides.map((slides) => ({
          kind: "embed" as const,
          id: slides.id,
          title: localize(slides.title, lang) ?? slides.id,
          description: localize(slides.description, lang),
          tag: t("resources.vault.tag.slides"),
          src: slides.url,
          ratio: "video" as const,
        })),
      },
      {
        id: "instagram",
        title: t("resources.vault.folders.instagram"),
        icon: LuInstagram,
        notes: resources.instagram.map((post, index) => ({
          kind: "instagram" as const,
          id: post.id,
          title:
            localize(post.title, lang) ??
            t("resources.vault.instagram_post", { number: index + 1 }),
          description: localize(post.description, lang),
          tag: t("resources.vault.tag.instagram"),
          url: post.url,
        })),
      },
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
