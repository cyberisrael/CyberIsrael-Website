import React from "react";
import { LuPanelLeft } from "react-icons/lu";
import { useVaultStyles } from "./useVaultStyles";

interface VaultSidebarToggleProps {
  label: string;
  onClick: () => void;
  className?: string;
}

/** Panel icon that shows/hides the sidebar; mirrored in RTL so it points at the sidebar. */
const VaultSidebarToggle: React.FC<VaultSidebarToggleProps> = ({
  label,
  onClick,
  className = "",
}) => {
  const c = useVaultStyles();

  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`p-1.5 rounded-md transition-colors ${c.icon} ${className}`}
    >
      <LuPanelLeft size={18} className="rtl:-scale-x-100" />
    </button>
  );
};

export default VaultSidebarToggle;
