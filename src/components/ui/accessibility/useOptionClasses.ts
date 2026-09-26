import { useTheme } from "@/context/ThemeContext";

/** Border/text classes for a selected vs. unselected option button. */
export const useOptionClasses = () => {
  const { theme } = useTheme();

  const activeClasses =
    theme === "dark"
      ? "bg-cyber-green/10 border-cyber-green/50 text-cyber-green"
      : "bg-light-blue/10 border-light-blue/50 text-light-blue";

  const idleClasses =
    theme === "dark"
      ? "border-cyber-border text-slate-400 hover:text-cyber-teal hover:border-cyber-teal/40"
      : "border-light-border text-light-muted hover:text-light-blue hover:border-light-blue/40";

  return { activeClasses, idleClasses };
};
