import React from "react";
import type { IconType } from "react-icons";
import { useTheme } from "@/context/ThemeContext";

interface SectionLabelProps {
  icon?: IconType;
  children: React.ReactNode;
}

const SectionLabel: React.FC<SectionLabelProps> = ({ icon: Icon, children }) => {
  const { theme } = useTheme();

  return (
    <div className="flex items-center gap-2 mb-2">
      {Icon && (
        <Icon
          size={14}
          className={theme === "dark" ? "text-cyber-teal" : "text-light-teal"}
        />
      )}
      <span className="font-display text-xs tracking-widest uppercase text-slate-400">
        {children}
      </span>
    </div>
  );
};

export default SectionLabel;
