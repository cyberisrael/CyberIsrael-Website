import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LuMaximize, LuMinus, LuPlus } from "react-icons/lu";
import GraphHeader from "./GraphHeader";
import GraphScene from "./GraphScene";
import GraphTooltip from "./GraphTooltip";
import FeaturedHoverEffect from "./FeaturedHoverEffect";
import { useVaultStyles } from "./useVaultStyles";
import { useVaultResources } from "./VaultResourcesContext";
import { layoutBounds, simulateLayout } from "./graphLayout";
import { useGraphViewport } from "./useGraphViewport";
import type { VaultFolder } from "./types";

interface VaultGraphProps {
  folders: VaultFolder[];
  activeId: string | null;
  /** Fills the pane in place of the note view instead of sitting beside it. */
  expanded: boolean;
  sidebarOpen: boolean;
  onOpenNote: (id: string) => void;
  onClose: () => void;
  onOpenSidebar: () => void;
  /** Brings back the note view; left out when no note is open to show. */
  onShowNoteView?: () => void;
}

/** Resources as a graph: folders are hubs, every note an icon linked to its folder. */
const VaultGraph: React.FC<VaultGraphProps> = ({
  folders,
  activeId,
  expanded,
  sidebarOpen,
  onOpenNote,
  onClose,
  onOpenSidebar,
  onShowNoteView,
}) => {
  const { t } = useTranslation();
  const c = useVaultStyles();
  const { isFeatured } = useVaultResources();
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

  const hovered = hoveredId && !dragging ? nodesById.get(hoveredId) : undefined;

  return (
    <aside
      className={`flex flex-col ${
        expanded
          ? `flex-1 min-w-0 ${c.pane}`
          : `absolute lg:static inset-y-0 end-0 z-30 w-[85%] max-w-sm lg:w-72 xl:w-96 flex-shrink-0 border-s ${c.sidebar}`
      }`}
    >
      <GraphHeader
        expanded={expanded}
        sidebarOpen={sidebarOpen}
        onClose={onClose}
        onOpenSidebar={onOpenSidebar}
        onShowNoteView={onShowNoteView}
      />

      <div
        ref={canvasRef}
        {...pointerHandlers}
        className={`relative flex-1 overflow-hidden select-none touch-none ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {size.width > 0 && (
          <>
            {/* Before the scene, so the effect sits behind the nodes and edges. */}
            <AnimatePresence>
              {hovered?.kind === "note" && isFeatured(hovered.id) && (
                <FeaturedHoverEffect
                  key={hovered.id}
                  node={hovered}
                  view={view}
                  canvasWidth={size.width}
                  canvasHeight={size.height}
                />
              )}
            </AnimatePresence>

            <GraphScene
              layout={layout}
              nodesById={nodesById}
              view={view}
              smooth={smooth}
              hoveredId={hoveredId}
              activeId={activeId}
              onHover={setHoveredId}
              onOpenNote={onOpenNote}
            />

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

export default VaultGraph;
