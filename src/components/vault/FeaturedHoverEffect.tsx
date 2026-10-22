import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { GraphNode } from "./graphLayout";
import type { Viewport } from "./useGraphViewport";

interface FeaturedHoverEffectProps {
  node: GraphNode;
  view: Viewport;
}

const PULSE_DURATION = 2.4;

/** Drawn behind the graph while a featured note is hovered: a soft glow pulsing in `--vault-featured`. */
const FeaturedHoverEffect: React.FC<FeaturedHoverEffectProps> = ({
  node,
  view,
}) => {
  const reduceMotion = useReducedMotion();
  const x = node.x * view.k + view.x;
  const y = node.y * view.k + view.y;

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
          duration: PULSE_DURATION,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
};

export default FeaturedHoverEffect;
