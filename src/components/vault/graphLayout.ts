import type { VaultFolder, VaultNote } from "./types";

export type GraphNode = {
  id: string;
  folder: VaultFolder;
  x: number;
  y: number;
} & ({ kind: "folder" } | { kind: "note"; note: VaultNote });

export interface GraphEdge {
  source: string;
  target: string;
}

export interface GraphLayout {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/** Hub ids are prefixed so they can never collide with a note id. */
export const folderNodeId = (folder: VaultFolder) => `folder:${folder.id}`;

const ITERATIONS = 300;
const REPULSION = 9000;
const LINK_LENGTH = 90;
const SPRING = 0.06;
const GRAVITY = 0.01;
const DAMPING = 0.6;

/**
 * Obsidian-style force layout: each folder is a hub linked to its notes, nodes push each
 * other apart and gravity holds the clusters together. Runs synchronously and
 * deterministically, so the same folders always give the same picture. Coordinates are in
 * pixels at zoom 1, centred on the origin; the graph panel pans and zooms over them.
 */
export const simulateLayout = (folders: VaultFolder[]): GraphLayout => {
  const nodes: (GraphNode & { vx: number; vy: number })[] = [];
  const edges: GraphEdge[] = [];
  const hubRadius = 200;

  folders.forEach((folder, fi) => {
    const angle = (fi / folders.length) * 2 * Math.PI;
    const hub = {
      id: folderNodeId(folder),
      kind: "folder" as const,
      folder,
      x: Math.cos(angle) * hubRadius,
      y: Math.sin(angle) * hubRadius,
      vx: 0,
      vy: 0,
    };
    nodes.push(hub);

    // Fan the notes outwards, away from the centre, so clusters start untangled.
    folder.notes.forEach((note, ni) => {
      const spread = ((ni + 1) / (folder.notes.length + 1) - 0.5) * Math.PI;
      nodes.push({
        id: note.id,
        kind: "note",
        folder,
        note,
        x: hub.x + Math.cos(angle + spread) * LINK_LENGTH,
        y: hub.y + Math.sin(angle + spread) * LINK_LENGTH,
        vx: 0,
        vy: 0,
      });
      edges.push({ source: hub.id, target: note.id });
    });
  });

  const byId = new Map(nodes.map((node) => [node.id, node]));

  for (let i = 0; i < ITERATIONS; i++) {
    const alpha = 1 - i / ITERATIONS;

    for (let a = 0; a < nodes.length; a++) {
      for (let b = a + 1; b < nodes.length; b++) {
        const na = nodes[a];
        const nb = nodes[b];
        const dx = na.x - nb.x || 0.01;
        const dy = na.y - nb.y || 0.01;
        const distSq = Math.max(dx * dx + dy * dy, 1);
        const dist = Math.sqrt(distSq);
        const force = (REPULSION / distSq) * alpha;
        na.vx += (dx / dist) * force;
        na.vy += (dy / dist) * force;
        nb.vx -= (dx / dist) * force;
        nb.vy -= (dy / dist) * force;
      }
    }

    edges.forEach(({ source, target }) => {
      const s = byId.get(source)!;
      const t = byId.get(target)!;
      const dx = t.x - s.x;
      const dy = t.y - s.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const force = (dist - LINK_LENGTH) * SPRING * alpha;
      s.vx += (dx / dist) * force;
      s.vy += (dy / dist) * force;
      t.vx -= (dx / dist) * force;
      t.vy -= (dy / dist) * force;
    });

    nodes.forEach((node) => {
      node.vx = (node.vx - node.x * GRAVITY * alpha) * DAMPING;
      node.vy = (node.vy - node.y * GRAVITY * alpha) * DAMPING;
      node.x += node.vx;
      node.y += node.vy;
    });
  }

  return {
    nodes: nodes.map(({ vx: _vx, vy: _vy, ...node }) => node as GraphNode),
    edges,
  };
};

export interface GraphBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** The box the nodes occupy, used to centre and fit the view. */
export const layoutBounds = ({ nodes }: GraphLayout): GraphBounds => {
  if (nodes.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  const xs = nodes.map((node) => node.x);
  const ys = nodes.map((node) => node.y);
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };
};
