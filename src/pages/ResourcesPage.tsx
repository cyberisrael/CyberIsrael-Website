import React, { useMemo } from "react";
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
import KnowledgeVault from "@/components/vault/KnowledgeVault";
import type { VaultFolder } from "@/components/vault/types";

interface LinkedResource {
  title: string;
  url: string;
}

const instagramPosts = [
  "https://www.instagram.com/p/DXuiFBEiLtQ/",
  "https://www.instagram.com/p/DabKNJWiCni/",
  "https://www.instagram.com/p/DaQehYhCAYr/",
];

const ResourcesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const folders = useMemo<VaultFolder[]>(() => {
    /** Lectures and slides are translated arrays of `{ title, url }`; drop anything malformed. */
    const linkedResources = (key: string): LinkedResource[] => {
      const value = t(key, { returnObjects: true });
      if (!Array.isArray(value)) return [];
      return value.filter(
        (item): item is LinkedResource =>
          !!item &&
          typeof item.title === "string" &&
          typeof item.url === "string",
      );
    };

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
        notes: linkedResources("resources.past_lectures").map(
          (lecture, index) => ({
            kind: "embed" as const,
            id: `lecture-${index + 1}`,
            title: lecture.title,
            tag: t("resources.vault.tag.lecture"),
            src: lecture.url,
            ratio: "video" as const,
          }),
        ),
      },
      {
        id: "roadmaps",
        title: t("resources.vault.folders.roadmaps"),
        icon: LuMap,
        notes: [
          {
            kind: "embed",
            id: "roadmap-zero-to-hero",
            title: t("resources.docs_title"),
            tag: t("resources.vault.tag.roadmap"),
            src: "https://docs.google.com/document/d/19tF4arwM14EaQJFX3Y6OPH3tG9ZytQ3oRCM7gCIhxt8/preview",
            ratio: "page",
          },
          {
            kind: "embed",
            id: "roadmap-gamma",
            title: t("resources.sheets_title"),
            tag: t("resources.vault.tag.roadmap"),
            src: "https://docs.google.com/spreadsheets/d/1ylNPja33yQBsLWXUK2loKzthUMrBe9UpHUsAbnc0iLA/preview?gid=0",
            ratio: "page",
          },
        ],
      },
      {
        id: "slides",
        title: t("resources.vault.folders.slides"),
        icon: LuPresentation,
        notes: linkedResources("resources.slides_presentations").map(
          (slides, index) => ({
            kind: "embed" as const,
            id: `slides-${index + 1}`,
            title: slides.title,
            tag: t("resources.vault.tag.slides"),
            src: slides.url,
            ratio: "video" as const,
          }),
        ),
      },
      {
        id: "instagram",
        title: t("resources.vault.folders.instagram"),
        icon: LuInstagram,
        notes: instagramPosts.map((url, index) => ({
          kind: "instagram" as const,
          id: `instagram-${index + 1}`,
          title: t("resources.vault.instagram_post", { number: index + 1 }),
          tag: t("resources.vault.tag.instagram"),
          url,
        })),
      },
    ];
    // i18n.language re-runs this when the language switches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, i18n.language]);

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

        <KnowledgeVault folders={folders} />
      </div>
    </div>
  );
};

export default ResourcesPage;
