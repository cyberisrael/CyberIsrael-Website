import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  LuFileText,
  LuMaximize,
  LuMinus,
  LuPlus,
  LuWaypoints,
  LuX,
} from "react-icons/lu";
import VaultSidebarToggle from "./VaultSidebarToggle";
import { useVaultStyles } from "./useVaultStyles";
import { layoutBounds, simulateLayout, type GraphNode } from "./graphLayout";
import { useGraphViewport, type Viewport } from "./useGraphViewport";
import { noteDetail } from "./noteDetail";
import type { VaultFolder } from "./types";

interface VaultGraphProps {
  folders: VaultFolder[];
  activeId: string | null;
  /** Notes pinned above the vault; their nodes are drawn and glow in `featuredColor`. */
  featuredIds: Set<string>;
  featuredColor: string;
  /** Fills the pane in place of the note view instead of sitting beside it. */
  expanded: boolean;
  sidebarOpen: boolean;
  onOpenNote: (id: string) => void;
  onClose: () => void;
  onOpenSidebar: () => void;
  /** Brings back the note view; left out when no note is open to show. */
  onShowNoteView?: () => void;
}

const TOOLTIP_WIDTH = 240;
const TOOLTIP_GAP = 24;

/** Resources as a graph: folders are hubs, every note an icon linked to its folder. */
const VaultGraph: React.FC<VaultGraphProps> = ({
  folders,
  activeId,
  featuredIds,
  featuredColor,
  expanded,
  sidebarOpen,
  onOpenNote,
  onClose,
  onOpenSidebar,
  onShowNoteView,
}) => {
  const { t } = useTranslation();
  const c = useVaultStyles();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const layout = useMemo(() => simulateLayout(folders), [folders]);
  const bounds = useMemo(() => layoutBounds(layout), [layout]);
  const { view, smooth, dragging, zoomBy, resetView, pointerHandlers } =
    useGraphViewport(canvasRef, size, bounds);

  const nodesById = useMemo(
    () => new Map(layout.nodes.map((node) => [node.id, node])),
    [layout],
  );

  // The hovered node plus everything it links to; the rest of the graph fades back.
  const highlighted = useMemo(() => {
    if (!hoveredId) return null;
    const ids = new Set([hoveredId]);
    layout.edges.forEach(({ source, target }) => {
      if (source === hoveredId) ids.add(target);
      if (target === hoveredId) ids.add(source);
    });
    return ids;
  }, [hoveredId, layout]);

  const hovered = hoveredId && !dragging ? nodesById.get(hoveredId) : undefined;

  const hoverProps = (id: string) => ({
    onMouseEnter: () => setHoveredId(id),
    onMouseLeave: () => setHoveredId(null),
    onFocus: () => setHoveredId(id),
    onBlur: () => setHoveredId(null),
  });

  return (
    <aside
      // Read by `graphNodeFeatured`, since the colour comes from the config file at runtime.
      style={{ "--vault-featured": featuredColor } as React.CSSProperties}
      className={`flex flex-col ${
        expanded
          ? `flex-1 min-w-0 ${c.pane}`
          : `absolute lg:static inset-y-0 end-0 z-30 w-[85%] max-w-sm lg:w-72 xl:w-96 flex-shrink-0 border-s ${c.sidebar}`
      }`}
    >
      <div className={`flex items-center gap-2 px-4 py-3 border-b ${c.guide}`}>
        {expanded && !sidebarOpen && (
          <VaultSidebarToggle
            label={t("resources.vault.open_sidebar")}
            onClick={onOpenSidebar}
            className="-ms-1.5"
          />
        )}
        <LuWaypoints size={16} className={c.accentText} />
        <span className={`font-display text-sm truncate ${c.text}`}>
          {t("resources.vault.graph_title")}
        </span>
        {!expanded && (
          <button
            onClick={onClose}
            aria-label={t("resources.vault.close_graph")}
            className={`ms-auto p-1.5 rounded-md transition-colors ${c.icon}`}
          >
            <LuX size={16} />
          </button>
        )}
        {expanded && onShowNoteView && (
          <button
            onClick={onShowNoteView}
            className={`ms-auto flex items-center gap-1.5 px-2 py-1 rounded-md text-sm transition-colors ${c.icon}`}
          >
            <LuFileText size={15} />
            {t("resources.vault.show_note_view")}
          </button>
        )}
      </div>

      <div
        ref={canvasRef}
        {...pointerHandlers}
        className={`relative flex-1 overflow-hidden select-none touch-none ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {size.width > 0 && (
          <>
            {/* Everything inside is laid out in graph coordinates; this layer pans and zooms it. */}
            <div
              className={`absolute left-0 top-0 origin-top-left ${
                smooth ? "transition-transform duration-300 ease-out" : ""
              }`}
              style={{
                transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`,
              }}
            >
              <svg
                className="absolute left-0 top-0 overflow-visible pointer-events-none"
                width={1}
                height={1}
              >
                {layout.edges.map(({ source, target }) => {
                  const s = nodesById.get(source)!;
                  const e = nodesById.get(target)!;
                  const lit =
                    !!highlighted &&
                    (source === hoveredId || target === hoveredId);
                  return (
                    <line
                      key={`${source}-${target}`}
                      x1={s.x}
                      y1={s.y}
                      x2={e.x}
                      y2={e.y}
                      strokeWidth={lit ? 1.75 : 1}
                      vectorEffect="non-scaling-stroke"
                      className={`transition-opacity duration-200 ${
                        lit ? c.graphEdgeActive : c.graphEdge
                      } ${highlighted && !lit ? "opacity-30" : ""}`}
                    />
                  );
                })}
              </svg>

              {layout.nodes.map((node, index) => {
                const Icon = node.folder.icon;
                const dimmed = !!highlighted && !highlighted.has(node.id);
                return (
                  <div
                    key={node.id}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 transition-[left,top,opacity] duration-300 ${
                      dimmed ? "opacity-30" : ""
                    } ${node.id === hoveredId ? "z-10" : ""}`}
                    style={{ left: node.x, top: node.y }}
                  >
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.02, duration: 0.25 }}
                    >
                      {node.kind === "folder" ? (
                        <div
                          {...hoverProps(node.id)}
                          className={`relative grid place-items-center w-11 h-11 rounded-full border-2 ${c.graphHub}`}
                        >
                          <Icon size={20} />
                          <span
                            className={`absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-xs ${c.text}`}
                          >
                            {node.folder.title}
                          </span>
                        </div>
                      ) : (
                        <button
                          {...hoverProps(node.id)}
                          onClick={() => onOpenNote(node.note.id)}
                          aria-label={node.note.title}
                          aria-current={node.note.id === activeId || undefined}
                          className={`grid place-items-center w-8 h-8 rounded-full border transition-colors ${
                            node.note.id === activeId
                              ? c.graphNodeActive
                              : featuredIds.has(node.note.id)
                                ? c.graphNodeFeatured
                                : c.graphNode
                          }`}
                        >
                          <Icon size={15} />
                        </button>
                      )}
                    </motion.div>
                  </div>
                );
              })}
            </div>

            <AnimatePresence>
              {hovered && (
                <GraphTooltip
                  key={hovered.id}
                  node={hovered}
                  view={view}
                  canvasWidth={size.width}
                  canvasHeight={size.height}
                />
              )}
            </AnimatePresence>

            <div className="absolute bottom-3 end-3 flex flex-col gap-1">
              {[
                { icon: LuPlus, label: "zoom_in", onClick: () => zoomBy(1.3) },
                {
                  icon: LuMinus,
                  label: "zoom_out",
                  onClick: () => zoomBy(1 / 1.3),
                },
                { icon: LuMaximize, label: "fit_view", onClick: resetView },
              ].map(({ icon: ControlIcon, label, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  // Keeps a press on a control from starting a drag of the canvas behind it.
                  onPointerDown={(e) => e.stopPropagation()}
                  aria-label={t(`resources.vault.${label}`)}
                  title={t(`resources.vault.${label}`)}
                  className={`p-1.5 rounded-md border backdrop-blur-sm transition-colors ${c.graphControl}`}
                >
                  <ControlIcon size={16} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

const GraphTooltip: React.FC<{
  node: GraphNode;
  view: Viewport;
  canvasWidth: number;
  canvasHeight: number;
}> = ({ node, view, canvasWidth, canvasHeight }) => {
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
          <p className="font-semibold text-sm leading-snug mb-2" dir="auto">
            {node.note.title}
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

export default VaultGraph;
