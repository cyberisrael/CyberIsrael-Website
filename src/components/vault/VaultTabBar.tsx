import React from "react";
import { useTranslation } from "react-i18next";
import { LuFileText, LuX } from "react-icons/lu";
import VaultSidebarToggle from "./VaultSidebarToggle";
import { useVaultStyles } from "./useVaultStyles";
import type { VaultEntry } from "./useVaultTabs";

interface VaultTabBarProps {
  tabs: VaultEntry[];
  activeId: string | null;
  sidebarOpen: boolean;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onOpenSidebar: () => void;
}

/** Row of open notes above the pane, like editor tabs. */
const VaultTabBar: React.FC<VaultTabBarProps> = ({
  tabs,
  activeId,
  sidebarOpen,
  onSelect,
  onClose,
  onOpenSidebar,
}) => {
  const { t } = useTranslation();
  const c = useVaultStyles();

  return (
    <div className={`flex items-end gap-1 border-b px-2 pt-2 ${c.tabBar}`}>
      {!sidebarOpen && (
        <VaultSidebarToggle
          label={t("resources.vault.open_sidebar")}
          onClick={onOpenSidebar}
          className="mb-1.5 me-1"
        />
      )}

      <div className="flex items-end gap-1 overflow-x-auto" role="tablist">
        {tabs.map(({ note }) => {
          const isActive = note.id === activeId;
          return (
            <div
              key={note.id}
              role="tab"
              aria-selected={isActive}
              className={`group flex items-center gap-2 max-w-[220px] rounded-t-lg ps-3 pe-1.5 py-2 text-sm cursor-pointer transition-colors ${
                isActive ? c.tabActive : c.tabIdle
              }`}
              onClick={() => onSelect(note.id)}
            >
              <LuFileText size={14} className="flex-shrink-0 opacity-60" />
              <span className="truncate">{note.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(note.id);
                }}
                aria-label={t("resources.vault.close_tab")}
                className={`flex-shrink-0 p-0.5 rounded transition-opacity ${
                  isActive
                    ? "opacity-70 hover:opacity-100"
                    : "opacity-0 group-hover:opacity-70"
                }`}
              >
                <LuX size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VaultTabBar;
