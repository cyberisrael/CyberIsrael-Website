import React from "react";
import { useTranslation } from "react-i18next";
import { LuFileText, LuWaypoints, LuX } from "react-icons/lu";
import VaultSidebarToggle from "./VaultSidebarToggle";
import { useVaultStyles } from "./useVaultStyles";

interface GraphHeaderProps {
  /** Whether the graph fills the pane in place of the note view. */
  expanded: boolean;
  sidebarOpen: boolean;
  onClose: () => void;
  onOpenSidebar: () => void;
  /** Brings back the note view; left out when no note is open to show. */
  onShowNoteView?: () => void;
}

/** Title bar of the graph panel: sidebar toggle, title, and close / back-to-note action. */
const GraphHeader: React.FC<GraphHeaderProps> = ({
  expanded,
  sidebarOpen,
  onClose,
  onOpenSidebar,
  onShowNoteView,
}) => {
  const { t } = useTranslation();
  const c = useVaultStyles();

  return (
    <div className={`flex items-center gap-2 px-4 py-3 border-b ${c.guide}`}>
      {expanded && !sidebarOpen && (
        <VaultSidebarToggle
          label={t("resources.vault.open_sidebar")}
          onClick={onOpenSidebar}
          className="-ms-1.5"
        />
      )}
      <LuWaypoints size={16} className={c.accentText} />
      <span className={`font-display text-sm truncate ${c.text}`}>
        {t("resources.vault.graph_title")}
      </span>
      {!expanded && (
        <button
          onClick={onClose}
          aria-label={t("resources.vault.close_graph")}
          className={`ms-auto p-1.5 rounded-md transition-colors ${c.icon}`}
        >
          <LuX size={16} />
        </button>
      )}
      {expanded && onShowNoteView && (
        <button
          onClick={onShowNoteView}
          className={`ms-auto flex items-center gap-1.5 px-2 py-1 rounded-md text-sm transition-colors ${c.icon}`}
        >
          <LuFileText size={15} />
          {t("resources.vault.show_note_view")}
        </button>
      )}
    </div>
  );
};

export default GraphHeader;
