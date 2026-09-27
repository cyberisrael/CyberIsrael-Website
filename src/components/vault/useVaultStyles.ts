import { useTheme } from "@/context/ThemeContext";

const darkStyles = {
  frame:
    "border-cyber-border/70 bg-cyber-black/90 shadow-[0_0_40px_rgba(0,255,136,0.06)]",
  sidebar: "bg-cyber-dark border-cyber-border/60",
  pane: "bg-cyber-black/60",
  tabBar: "bg-cyber-dark border-cyber-border/60",
  tabActive: "bg-cyber-card text-white",
  tabIdle: "text-slate-500 hover:text-slate-300 hover:bg-cyber-card/50",
  item: "text-slate-400 hover:bg-cyber-card hover:text-white",
  itemActive: "bg-cyber-card text-white",
  folder: "text-slate-300 hover:bg-cyber-card/60",
  icon: "text-slate-400 hover:text-white hover:bg-cyber-card",
  input:
    "bg-cyber-black/60 border-cyber-border/60 text-slate-200 placeholder:text-slate-500 focus:border-cyber-green/60",
  text: "text-slate-300",
  muted: "text-slate-500",
  guide: "border-cyber-border/60",
  accentText: "text-cyber-green",
  accentBar: "bg-cyber-green",
};

const lightStyles: typeof darkStyles = {
  frame: "border-light-border bg-white/90 shadow-glass-light",
  sidebar: "bg-light-bg border-light-border",
  pane: "bg-white",
  tabBar: "bg-light-bg border-light-border",
  tabActive: "bg-white text-light-text",
  tabIdle: "text-light-muted hover:text-light-text hover:bg-white/60",
  item: "text-light-muted hover:bg-white hover:text-light-text",
  itemActive: "bg-white text-light-text shadow-sm",
  folder: "text-light-text hover:bg-white/70",
  icon: "text-light-muted hover:text-light-text hover:bg-white",
  input:
    "bg-white border-light-border text-light-text placeholder:text-light-muted focus:border-light-blue/60",
  text: "text-light-text",
  muted: "text-light-muted",
  guide: "border-light-border",
  accentText: "text-light-blue",
  accentBar: "bg-light-blue",
};

export type VaultStyles = typeof darkStyles;

/** Tailwind classes shared by the vault's pieces, picked for the current theme. */
export const useVaultStyles = (): VaultStyles => {
  const { theme } = useTheme();
  return theme === "dark" ? darkStyles : lightStyles;
};
