import { useTheme } from "@/context/ThemeContext";

const darkStyles = {
  frame:
    "border-cyber-border/70 bg-cyber-black/90 shadow-[0_0_40px_rgba(0,255,136,0.06)]",
  sidebar: "bg-cyber-dark border-cyber-border/60",
  pane: "bg-cyber-black/60",
  tabBar: "bg-cyber-dark border-cyber-border/60",
  tabActive: "bg-cyber-card text-white",
  tabIdle: "text-slate-500 hover:text-slate-300 hover:bg-cyber-card/50",
  // `--vault-type` is the note's folder colour, set on the element by the component.
  item: "text-[color:color-mix(in_srgb,var(--vault-type)_80%,#94a3b8)] hover:bg-cyber-card hover:text-[color:var(--vault-type)]",
  itemActive: "bg-cyber-card text-[color:var(--vault-type)]",
  folder: "text-slate-300 hover:bg-cyber-card/60",
  icon: "text-slate-400 hover:text-white hover:bg-cyber-card",
  input:
    "bg-cyber-black/60 border-cyber-border/60 text-slate-200 placeholder:text-slate-500 focus:border-cyber-green/60",
  text: "text-slate-300",
  muted: "text-slate-500",
  guide: "border-cyber-border/60",
  accentText: "text-cyber-green",
  accentBar: "bg-cyber-green",
  graphEdge: "stroke-cyber-border",
  graphEdgeActive: "stroke-cyber-green",
  graphNode:
    "bg-cyber-card border-[color:color-mix(in_srgb,var(--vault-type)_55%,transparent)] text-slate-300 shadow-[0_0_10px_color-mix(in_srgb,var(--vault-type)_40%,transparent)] hover:border-[color:var(--vault-type)] hover:text-[color:var(--vault-type)] hover:shadow-[0_0_16px_color-mix(in_srgb,var(--vault-type)_70%,transparent)]",
  graphNodeActive:
    "bg-cyber-card border-cyber-green text-cyber-green shadow-[0_0_14px_rgba(0,255,136,0.45)]",
  graphNodeFeatured:
    "bg-cyber-card border-[color:var(--vault-featured)] text-[color:var(--vault-featured)] shadow-[0_0_14px_color-mix(in_srgb,var(--vault-featured)_55%,transparent)] hover:shadow-[0_0_20px_color-mix(in_srgb,var(--vault-featured)_80%,transparent)]",
  graphHub:
    "bg-cyber-dark border-cyber-green/60 text-cyber-green shadow-[0_0_18px_rgba(0,255,136,0.18)]",
  tooltip: "bg-cyber-dark/95 border-cyber-border text-slate-300",
  featuredText: "text-[color:var(--vault-featured)]",
  featuredCard:
    "bg-cyber-dark/90 border-cyber-border/70 text-slate-300 hover:border-cyber-green/60",
  featuredCardActive:
    "bg-cyber-dark/90 border-cyber-green text-slate-200 shadow-[0_0_14px_rgba(0,255,136,0.25)]",
  tagPill: "bg-cyber-purple/20 text-violet-300",
  graphControl:
    "bg-cyber-card/80 border-cyber-border/60 text-slate-400 hover:text-white hover:border-cyber-green/60",
};

const lightStyles: typeof darkStyles = {
  frame: "border-light-border bg-white/90 shadow-glass-light",
  sidebar: "bg-light-bg border-light-border",
  pane: "bg-white",
  tabBar: "bg-light-bg border-light-border",
  tabActive: "bg-white text-light-text",
  tabIdle: "text-light-muted hover:text-light-text hover:bg-white/60",
  // Darkened so bright folder colours (yellow, pink) stay readable on white.
  item: "text-[color:color-mix(in_srgb,var(--vault-type)_60%,#1e293b)] hover:bg-white",
  itemActive:
    "bg-white text-[color:color-mix(in_srgb,var(--vault-type)_70%,#1e293b)] shadow-sm",
  folder: "text-light-text hover:bg-white/70",
  icon: "text-light-muted hover:text-light-text hover:bg-white",
  input:
    "bg-white border-light-border text-light-text placeholder:text-light-muted focus:border-light-blue/60",
  text: "text-light-text",
  muted: "text-light-muted",
  guide: "border-light-border",
  accentText: "text-light-blue",
  accentBar: "bg-light-blue",
  graphEdge: "stroke-light-border",
  graphEdgeActive: "stroke-light-blue",
  graphNode:
    "bg-white border-[color:color-mix(in_srgb,var(--vault-type)_60%,transparent)] text-light-muted shadow-[0_0_10px_color-mix(in_srgb,var(--vault-type)_45%,transparent)] hover:border-[color:var(--vault-type)] hover:text-[color:color-mix(in_srgb,var(--vault-type)_70%,#1e293b)] hover:shadow-[0_0_14px_color-mix(in_srgb,var(--vault-type)_70%,transparent)]",
  graphNodeActive:
    "bg-white border-light-blue text-light-blue shadow-[0_0_12px_rgba(37,99,235,0.35)]",
  graphNodeFeatured:
    "bg-white border-[color:var(--vault-featured)] text-[color:var(--vault-featured)] shadow-[0_0_12px_color-mix(in_srgb,var(--vault-featured)_55%,transparent)] hover:shadow-[0_0_18px_color-mix(in_srgb,var(--vault-featured)_80%,transparent)]",
  graphHub: "bg-light-bg border-light-blue/60 text-light-blue shadow-sm",
  tooltip: "bg-white/95 border-light-border text-light-text shadow-glass-light",
  // Darkened so a bright featured colour (amber by default) stays readable on white.
  featuredText:
    "text-[color:color-mix(in_srgb,var(--vault-featured)_70%,#1e293b)]",
  featuredCard:
    "bg-white/90 border-light-border text-light-text shadow-glass-light hover:border-light-blue/60",
  featuredCardActive:
    "bg-white/90 border-light-blue text-light-text shadow-[0_0_12px_rgba(37,99,235,0.25)]",
  tagPill: "bg-violet-100 text-violet-700",
  graphControl:
    "bg-white/80 border-light-border text-light-muted hover:text-light-text hover:border-light-blue/60",
};

export type VaultStyles = typeof darkStyles;

export const useVaultStyles = (): VaultStyles => {
  const { theme } = useTheme();
  return theme === "dark" ? darkStyles : lightStyles;
};
