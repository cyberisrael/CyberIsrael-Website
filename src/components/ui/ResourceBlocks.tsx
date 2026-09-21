import React from "react";
import { motion } from "framer-motion";
import { IconType } from "react-icons";
import { useTheme } from "@/context/ThemeContext";

export type ResourceAccent = "green" | "teal" | "purple" | "yellow";

const accents: Record<ResourceAccent, { dark: string; light: string }> = {
  green: { dark: "#00FF88", light: "#2563EB" },
  teal: { dark: "#00D4FF", light: "#0891B2" },
  purple: { dark: "#8B5CF6", light: "#7C3AED" },
  yellow: { dark: "#FFD700", light: "#D97706" },
};

export const useAccent = (accent: ResourceAccent) => {
  const { theme } = useTheme();
  return accents[accent][theme === "dark" ? "dark" : "light"];
};

interface ResourceSectionProps {
  index: number;
  title: string;
  icon: IconType;
  accent: ResourceAccent;
  children: React.ReactNode;
  className?: string;
}

/** Numbered section header + content wrapper shared by every resources block. */
export const ResourceSection: React.FC<ResourceSectionProps> = ({
  index,
  title,
  icon: Icon,
  accent,
  children,
  className = "",
}) => {
  const { theme } = useTheme();
  const color = useAccent(accent);

  return (
    <section className={`w-full relative z-10 py-12 md:py-16 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7 }}
      >
        <div className="flex items-center gap-4 mb-8">
          <div
            className="p-3 rounded-xl flex-shrink-0"
            style={{
              background: `${color}18`,
              color,
              border: `1px solid ${color}35`,
              boxShadow: `0 0 20px ${color}20`,
            }}
          >
            <Icon size={22} />
          </div>
          <div className="min-w-0 text-start">
            <span
              className="font-display text-xs tracking-widest uppercase"
              style={{ color }}
            >
              {`// ${String(index).padStart(2, "0")}`}
            </span>
            <h2
              className={`font-display text-2xl md:text-3xl font-bold leading-tight ${
                theme === "dark" ? "text-white" : "text-light-text"
              }`}
            >
              {title}
            </h2>
          </div>
        </div>
        {children}
      </motion.div>
    </section>
  );
};

interface ResourceFrameProps {
  accent: ResourceAccent;
  label: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

/** Window-style frame (title bar, accent glow, corner brackets) for embedded content. */
export const ResourceFrame: React.FC<ResourceFrameProps> = ({
  accent,
  label,
  children,
  className = "",
  bodyClassName = "h-[420px] md:h-[560px]",
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const color = useAccent(accent);

  const corner = "absolute w-4 h-4 pointer-events-none z-20";

  return (
    <div className={`relative ${className}`}>
      {/* Soft accent glow behind the frame */}
      <div
        className="absolute -inset-1 rounded-3xl opacity-25 blur-xl pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${color}, transparent 70%)` }}
      />

      <div
        className={`relative rounded-2xl overflow-hidden border ${
          isDark
            ? "bg-cyber-card border-cyber-border/60"
            : "bg-white border-light-border shadow-glass-light"
        }`}
        style={{ boxShadow: isDark ? `0 0 30px ${color}14` : undefined }}
      >
        {/* Accent bar */}
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
        />

        {/* Title bar */}
        <div
          className={`flex items-center gap-3 px-4 py-2.5 border-b ${
            isDark
              ? "bg-cyber-dark/80 border-cyber-border/50"
              : "bg-light-bg border-light-border"
          }`}
          dir="ltr"
        >
          <div className="flex gap-1.5 flex-shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
          </div>
          <span
            className={`font-display text-xs tracking-wider truncate ${
              isDark ? "text-slate-400" : "text-light-muted"
            }`}
          >
            {label}
          </span>
        </div>

        {/* Embedded content */}
        <div className={`relative ${bodyClassName}`}>{children}</div>
      </div>

      {/* Corner brackets */}
      <span
        className={`${corner} -top-1.5 -left-1.5 border-t-2 border-l-2 rounded-tl-lg`}
        style={{ borderColor: color }}
      />
      <span
        className={`${corner} -top-1.5 -right-1.5 border-t-2 border-r-2 rounded-tr-lg`}
        style={{ borderColor: color }}
      />
      <span
        className={`${corner} -bottom-1.5 -left-1.5 border-b-2 border-l-2 rounded-bl-lg`}
        style={{ borderColor: color }}
      />
      <span
        className={`${corner} -bottom-1.5 -right-1.5 border-b-2 border-r-2 rounded-br-lg`}
        style={{ borderColor: color }}
      />
    </div>
  );
};

interface ResourceTabsProps {
  accent: ResourceAccent;
  items: string[];
  selected: number;
  onSelect: (index: number) => void;
}

/** Pill selector used above framed embeds that have several entries. */
export const ResourceTabs: React.FC<ResourceTabsProps> = ({
  accent,
  items,
  selected,
  onSelect,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const color = useAccent(accent);

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {items.map((item, index) => {
        const active = selected === index;
        return (
          <button
            key={`${item}-${index}`}
            onClick={() => onSelect(index)}
            className={`px-5 py-2.5 rounded-lg font-display text-sm border transition-all duration-300 ${
              active
                ? "font-bold"
                : isDark
                  ? "bg-cyber-card text-gray-400 border-cyber-border hover:text-white"
                  : "bg-light-card text-light-muted border-light-border hover:text-light-text"
            }`}
            style={
              active
                ? {
                    background: color,
                    borderColor: color,
                    color: isDark ? "#050A0F" : "#fff",
                    boxShadow: `0 0 20px ${color}55`,
                  }
                : undefined
            }
          >
            {item}
          </button>
        );
      })}
    </div>
  );
};
