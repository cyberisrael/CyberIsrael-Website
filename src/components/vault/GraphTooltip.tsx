import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useVaultStyles } from "./useVaultStyles";
import type { GraphNode } from "./graphLayout";
import type { Viewport } from "./useGraphViewport";
import { noteDetail } from "./noteDetail";

interface GraphTooltipProps {
  node: GraphNode;
  view: Viewport;
  canvasWidth: number;
  canvasHeight: number;
  /** Set only when the note is featured: shown beside the title, which turns `--vault-featured`. */
  featuredEmoji?: string;
}

const TOOLTIP_WIDTH = 240;
const TOOLTIP_GAP = 24;

/** Details card for the hovered graph node, positioned in canvas (screen) coordinates. */
const GraphTooltip: React.FC<GraphTooltipProps> = ({
  node,
  view,
  canvasWidth,
  canvasHeight,
  featuredEmoji,
}) => {
  const { t } = useTranslation();
  const c = useVaultStyles();
  const Icon = node.folder.icon;

  // Kept inside the panel: centred on the node, flipped above it in the lower half.
  const x = node.x * view.k + view.x;
  const y = node.y * view.k + view.y;
  const gap = TOOLTIP_GAP * Math.max(view.k, 0.6);
  const width = Math.min(TOOLTIP_WIDTH, canvasWidth - 16);
  const left = Math.min(Math.max(x - width / 2, 8), canvasWidth - width - 8);
  const below = y < canvasHeight / 2;
  const vertical = below
    ? { top: y + gap }
    : { bottom: canvasHeight - y + gap };

  return (
    <motion.div
      role="tooltip"
      initial={{ opacity: 0, y: below ? -4 : 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className={`absolute z-20 pointer-events-none rounded-lg border p-3 text-start backdrop-blur-sm ${c.tooltip}`}
      style={{ left, width, ...vertical }}
    >
      <div className={`flex items-center gap-1.5 text-xs mb-1 ${c.muted}`}>
        <Icon size={12} className="flex-shrink-0" />
        <span className="truncate">{node.folder.title}</span>
        {node.kind === "folder" && (
          <span className="ms-auto">{node.folder.notes.length}</span>
        )}
      </div>

      {node.kind === "note" && (
        <>
          <p
            className={`font-semibold text-sm leading-snug mb-2 ${
              featuredEmoji ? c.featuredText : ""
            }`}
            dir="auto"
          >
            {node.note.title}
            {featuredEmoji && (
              <span
                role="img"
                aria-label={t("resources.vault.featured")}
                className="ms-1.5"
              >
                {featuredEmoji}
              </span>
            )}
          </p>
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-display mb-2 ${c.tagPill}`}
          >
            #{node.note.tag}
          </span>
          <p
            className={`text-xs leading-relaxed line-clamp-3 ${c.muted}`}
            dir="auto"
          >
            {noteDetail(node.note)}
          </p>
          {node.note.kind === "article" && (
            <p className={`text-xs mt-1 ${c.muted}`}>
              {node.note.article.readTime} {t("articles.min_read")}
            </p>
          )}
          <p className={`text-xs mt-2 font-display ${c.accentText}`}>
            {t("resources.vault.graph_open_hint")}
          </p>
        </>
      )}
    </motion.div>
  );
};

export default GraphTooltip;
