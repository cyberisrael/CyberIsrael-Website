import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LuArrowRight, LuExternalLink } from "react-icons/lu";
import { useTheme } from "@/context/ThemeContext";
import { getCategoryColor } from "@/services/articlesData";
import IframeSkeleton from "@/components/ui/IframeSkeleton";
import InstagramEmbedCard from "@/components/ui/instagram/InstagramEmbedCard";
import type { VaultNote } from "./types";

interface VaultNoteViewProps {
  note: VaultNote;
  folderTitle: string;
}

/** Google embeds need `/embed`/`/preview` instead of the `/edit` URL people paste. */
const toEmbedUrl = (url: string) => url.trim().replace("/edit", "/embed");

const EmbedBody: React.FC<{ src: string; title: string; ratio: "video" | "page" }> = ({
  src,
  title,
  ratio,
}) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg border ${
        ratio === "video" ? "aspect-video" : "flex-1 min-h-[480px]"
      } ${theme === "dark" ? "border-cyber-border/60" : "border-light-border"}`}
    >
      {loading && <IframeSkeleton />}
      <iframe
        src={toEmbedUrl(src)}
        title={title}
        className="absolute inset-0 w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};

const VaultNoteView: React.FC<VaultNoteViewProps> = ({ note, folderTitle }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const muted = isDark ? "text-slate-400" : "text-light-muted";
  const accentText = isDark ? "text-cyber-green" : "text-light-blue";

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`mx-auto w-full flex flex-col text-start ${
        note.kind === "embed" && note.ratio === "page" ? "max-w-5xl flex-1" : "max-w-3xl"
      }`}
    >
      <h1
        className={`text-3xl md:text-4xl font-bold leading-tight mb-3 ${
          isDark ? "text-white" : "text-light-text"
        }`}
      >
        {note.title}
      </h1>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span
          className={`px-2.5 py-0.5 rounded-full text-sm font-display ${
            isDark ? "bg-cyber-purple/20 text-violet-300" : "bg-violet-100 text-violet-700"
          }`}
        >
          #{note.tag}
        </span>
      </div>

      <p className={`mb-6 ${muted}`}>
        {t("resources.vault.from")}{" "}
        <span className={`underline underline-offset-4 ${accentText}`}>{folderTitle}</span>
      </p>

      {note.kind === "embed" && (
        <>
          <EmbedBody src={note.src} title={note.title} ratio={note.ratio} />
          <a
            href={note.src.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-4 inline-flex items-center gap-2 self-start text-sm hover:underline ${accentText}`}
          >
            <LuExternalLink size={14} />
            {t("resources.vault.open_external")}
          </a>
        </>
      )}

      {note.kind === "article" && <ArticleBody note={note} />}

      {note.kind === "instagram" && (
        <div className="w-full max-w-md">
          <InstagramEmbedCard url={note.url} />
        </div>
      )}
    </motion.article>
  );
};

const ArticleBody: React.FC<{ note: Extract<VaultNote, { kind: "article" }> }> = ({ note }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { article } = note;
  const category = getCategoryColor(article.category);

  return (
    <>
      {article.image && (
        <img
          src={article.image}
          alt=""
          className={`w-full aspect-[2/1] object-cover rounded-lg border mb-6 ${
            isDark ? "border-cyber-border/60" : "border-light-border"
          }`}
        />
      )}

      <h2 className={`text-xl font-semibold mb-2 ${isDark ? "text-white" : "text-light-text"}`}>
        {t("resources.vault.summary")}
      </h2>
      <blockquote
        className={`border-s-4 ps-4 py-1 leading-relaxed mb-6 ${
          isDark ? "border-cyber-green text-slate-300" : "border-light-blue text-light-text/80"
        }`}
        dir="auto"
      >
        {article.excerpt}
      </blockquote>

      <ul className={`space-y-1.5 mb-8 list-disc ps-5 ${isDark ? "text-slate-300" : "text-light-text/80"}`}>
        <li>
          <strong>{t("resources.vault.category")}</strong>{" "}
          <span
            className="px-2 py-0.5 rounded text-xs font-display border"
            style={{ background: category.bg, color: category.text, borderColor: category.border }}
          >
            {t(`articles.categories.${article.category}`, article.category)}
          </span>
        </li>
        <li>
          <strong>{t("resources.vault.read_time")}</strong> {article.readTime} {t("articles.min_read")}
        </li>
        {article.tags.length > 0 && (
          <li>
            <strong>{t("resources.vault.tags")}</strong>{" "}
            <span className="font-display text-sm">{article.tags.map((tag) => `#${tag}`).join(" ")}</span>
          </li>
        )}
      </ul>

      <Link to={`/articles/${article.href}`} className="btn-primary inline-flex items-center gap-2 self-start">
        {t("resources.articles_cta")}
        <LuArrowRight className="rtl:rotate-180" />
      </Link>
    </>
  );
};

export default VaultNoteView;
