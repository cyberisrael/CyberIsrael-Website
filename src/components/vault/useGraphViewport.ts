import { useCallback, useEffect, useRef, useState } from "react";
import type { GraphBounds } from "./graphLayout";

export interface Viewport {
  /** Screen position of the graph's origin, in pixels. */
  x: number;
  y: number;
  /** Zoom factor. */
  k: number;
}

interface Size {
  width: number;
  height: number;
}

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.5;
/**
 * The first view is close to full size, so a narrow panel shows part of the graph at a
 * readable size and the rest is a drag away. The fit button zooms out further, to MIN_ZOOM.
 */
const MIN_INITIAL_ZOOM = 0.9;
/** Room kept around the graph when fitting it, for hub labels and node circles. */
const FIT_PADDING = 48;
/** How far a press has to move before it counts as a drag rather than a click. */
const DRAG_THRESHOLD = 4;

const clampZoom = (k: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, k));

/** Zooms by `factor` while keeping the screen point (`px`, `py`) fixed under the cursor. */
const zoomAround = (
  view: Viewport,
  factor: number,
  px: number,
  py: number,
): Viewport => {
  const k = clampZoom(view.k * factor);
  const ratio = k / view.k;
  return { k, x: px - (px - view.x) * ratio, y: py - (py - view.y) * ratio };
};

const fitView = (
  bounds: GraphBounds,
  size: Size,
  minZoom: number,
): Viewport => {
  const spanX = bounds.maxX - bounds.minX + FIT_PADDING * 2;
  const spanY = bounds.maxY - bounds.minY + FIT_PADDING * 2;
  // Zoom out as far as fitting needs (down to `minZoom`), but never zoom in past 1.
  const k = Math.min(
    1,
    Math.max(minZoom, Math.min(size.width / spanX, size.height / spanY)),
  );
  const centreX = (bounds.minX + bounds.maxX) / 2;
  const centreY = (bounds.minY + bounds.maxY) / 2;
  return {
    k,
    x: size.width / 2 - centreX * k,
    y: size.height / 2 - centreY * k,
  };
};

/**
 * Map-style navigation for the graph canvas: drag to pan, wheel or pinch to zoom.
 * A press only turns into a drag once it moves, and only then is the pointer captured,
 * so a plain click still reaches the node under it while a drag never opens one.
 */
export const useGraphViewport = (
  canvasRef: React.RefObject<HTMLDivElement>,
  size: Size,
  bounds: GraphBounds,
) => {
  const [view, setView] = useState<Viewport>({ x: 0, y: 0, k: 1 });
  // Only button zooms animate; drags and wheel zooms must track the input exactly.
  const [smooth, setSmooth] = useState(false);
  const [dragging, setDragging] = useState(false);

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const press = useRef({ x: 0, y: 0, moved: false });
  const prevSize = useRef<Size>({ width: 0, height: 0 });
  const prevBounds = useRef<GraphBounds | null>(null);

  // Fit the graph on first measure and whenever it changes; on a plain resize keep the centre.
  useEffect(() => {
    if (!size.width || !size.height) return;
    const previous = prevSize.current;
    if (!previous.width || prevBounds.current !== bounds) {
      setSmooth(false);
      setView(fitView(bounds, size, MIN_INITIAL_ZOOM));
    } else {
      setView((v) => ({
        ...v,
        x: v.x + (size.width - previous.width) / 2,
        y: v.y + (size.height - previous.height) / 2,
      }));
    }
    prevSize.current = size;
    prevBounds.current = bounds;
  }, [size, bounds]);

  // Registered by hand: React's onWheel is passive, so it can't stop the page scrolling.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      setSmooth(false);
      setView((v) =>
        zoomAround(
          v,
          Math.exp(-e.deltaY * 0.0015),
          e.clientX - rect.left,
          e.clientY - rect.top,
        ),
      );
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [canvasRef]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      press.current = { x: e.clientX, y: e.clientY, moved: false };
    } else {
      // A second finger makes it a pinch: capture both so neither lands as a click.
      press.current.moved = true;
      setDragging(true);
      pointers.current.forEach((_, id) =>
        e.currentTarget.setPointerCapture(id),
      );
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const previous = pointers.current.get(e.pointerId);
    if (!previous) return;
    const current = { x: e.clientX, y: e.clientY };

    if (pointers.current.size === 1) {
      if (!press.current.moved) {
        const distance = Math.hypot(
          current.x - press.current.x,
          current.y - press.current.y,
        );
        if (distance < DRAG_THRESHOLD) return;
        press.current.moved = true;
        setDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
      }
      pointers.current.set(e.pointerId, current);
      setSmooth(false);
      setView((v) => ({
        ...v,
        x: v.x + current.x - previous.x,
        y: v.y + current.y - previous.y,
      }));
      return;
    }

    const other = [...pointers.current].find(([id]) => id !== e.pointerId)?.[1];
    pointers.current.set(e.pointerId, current);
    if (!other) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const before = Math.hypot(previous.x - other.x, previous.y - other.y) || 1;
    const after = Math.hypot(current.x - other.x, current.y - other.y) || 1;
    const midX = (current.x + other.x) / 2 - rect.left;
    const midY = (current.y + other.y) / 2 - rect.top;
    const panX = (current.x - previous.x) / 2;
    const panY = (current.y - previous.y) / 2;
    setSmooth(false);
    setView((v) => {
      const zoomed = zoomAround(v, after / before, midX, midY);
      return { ...zoomed, x: zoomed.x + panX, y: zoomed.y + panY };
    });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) setDragging(false);
  };

  const zoomBy = useCallback(
    (factor: number) => {
      setSmooth(true);
      setView((v) => zoomAround(v, factor, size.width / 2, size.height / 2));
    },
    [size.width, size.height],
  );

  const resetView = useCallback(() => {
    setSmooth(true);
    setView(fitView(bounds, size, MIN_ZOOM));
  }, [bounds, size]);

  return {
    view,
    smooth,
    dragging,
    zoomBy,
    resetView,
    pointerHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
};
