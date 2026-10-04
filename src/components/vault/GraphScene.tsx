import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useVaultStyles } from "./useVaultStyles";
import type { GraphLayout, GraphNode } from "./graphLayout";
import type { Viewport } from "./useGraphViewport";

interface GraphSceneProps {
  layout: GraphLayout;
  nodesById: Map<string, GraphNode>;
  view: Viewport;
  /** Animates the pan/zoom transform, e.g. after a zoom button rather than a drag. */
  smooth: boolean;
  hoveredId: string | null;
  activeId: string | null;
  featuredIds: Set<string>;
  onHover: (id: string | null) => void;
  onOpenNote: (id: string) => void;
}

/** The graph itself: edges and nodes laid out in graph coordinates, panned and zoomed by `view`. */
const GraphScene: React.FC<GraphSceneProps> = ({
  layout,
  nodesById,
  view,
  smooth,
  hoveredId,
  activeId,
  featuredIds,
  onHover,
  onOpenNote,
}) => {
  const c = useVaultStyles();

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

  const hoverProps = (id: string) => ({
    onMouseEnter: () => onHover(id),
    onMouseLeave: () => onHover(null),
    onFocus: () => onHover(id),
    onBlur: () => onHover(null),
  });

  return (
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
            !!highlighted && (source === hoveredId || target === hoveredId);
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
                  style={
                    { "--vault-type": node.folder.color } as React.CSSProperties
                  }
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
  );
};

export default GraphScene;
