import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { GraphNode } from "./graphLayout";
import type { Viewport } from "./useGraphViewport";

interface FeaturedHoverEffectProps {
  node: GraphNode;
  view: Viewport;
  canvasWidth: number;
  canvasHeight: number;
}

const RINGS = 3;
const RING_DURATION = 2.4;

/**
 * Drawn behind the graph while a featured note is hovered: a soft glow plus rings that keep
 * rippling out from the node across the whole canvas, in `--vault-featured`.
 */
const FeaturedHoverEffect: React.FC<FeaturedHoverEffectProps> = ({
  node,
  view,
  canvasWidth,
  canvasHeight,
}) => {
  const reduceMotion = useReducedMotion();
  const x = node.x * view.k + view.x;
  const y = node.y * view.k + view.y;
  // Big enough that a ring from any corner still sweeps past the far edge.
  const reach = 2 * Math.hypot(canvasWidth, canvasHeight);

  return (
    <motion.div
      aria-hidden
      className="absolute inset-0 pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="absolute rounded-full"
        style={{
          left: x,
          x: "-50%",
          y: "-50%",
          top: y,
          width: 360,
          height: 360,
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--vault-featured) 22%, transparent) 0%, transparent 70%)",
        }}
        animate={reduceMotion ? undefined : { scale: [1, 1.25, 1] }}
        transition={{
          duration: RING_DURATION,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {!reduceMotion &&
        Array.from({ length: RINGS }, (_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border"
            style={{
              left: x,
              x: "-50%",
              y: "-50%",
              top: y,
              width: reach,
              height: reach,
              borderColor: "var(--vault-featured)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1], opacity: [0.5, 0] }}
            transition={{
              duration: RING_DURATION * 2,
              repeat: Infinity,
              ease: "easeOut",
              delay: (i * RING_DURATION * 2) / RINGS,
            }}
          />
        ))}
    </motion.div>
  );
};

export default FeaturedHoverEffect;
