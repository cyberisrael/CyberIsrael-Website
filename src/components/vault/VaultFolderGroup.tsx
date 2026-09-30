import React from "react";
import { useTranslation } from "react-i18next";
import { LuChevronRight } from "react-icons/lu";
import { useVaultStyles } from "./useVaultStyles";
import type { VaultFolder } from "./types";

interface VaultFolderGroupProps {
  folder: VaultFolder;
  collapsed: boolean;
  activeId: string | null;
  featuredIds: Set<string>;
  featuredEmoji: string;
  onToggle: () => void;
  onOpenNote: (id: string) => void;
}

/** One folder row in the sidebar tree, with its notes listed underneath. */
const VaultFolderGroup: React.FC<VaultFolderGroupProps> = ({
  folder,
  collapsed,
  activeId,
  featuredIds,
  featuredEmoji,
  onToggle,
  onOpenNote,
}) => {
  const { t } = useTranslation();
  const c = useVaultStyles();
  const Icon = folder.icon;

  return (
    <div className="mb-0.5">
      <button
        onClick={onToggle}
        aria-expanded={!collapsed}
        className={`w-full flex items-center gap-1.5 rounded-md px-2 py-1.5 text-start transition-colors ${c.folder}`}
      >
        <LuChevronRight
          size={14}
          className={`flex-shrink-0 transition-transform ${c.muted} ${
            collapsed ? "rtl:rotate-180" : "rotate-90"
          }`}
        />
        <Icon size={15} className={`flex-shrink-0 ${c.muted}`} />
        <span className="truncate">{folder.title}</span>
        <span className={`ms-auto text-xs ${c.muted}`}>
          {folder.notes.length}
        </span>
      </button>

      {!collapsed && (
        <ul className={`ms-[15px] ps-2 border-s ${c.guide}`}>
          {folder.notes.map((note) => {
            const isActive = note.id === activeId;
            return (
              <li key={note.id}>
                <button
                  onClick={() => onOpenNote(note.id)}
                  title={note.title}
                  className={`relative w-full flex items-center gap-1.5 rounded-md px-3 py-1.5 text-start transition-colors ${
                    isActive ? c.itemActive : c.item
                  }`}
                >
                  {isActive && (
                    <span
                      className={`absolute inset-y-1.5 start-0 w-0.5 rounded-full ${c.accentBar}`}
                    />
                  )}
                  <span className="truncate">{note.title}</span>
                  {featuredIds.has(note.id) && (
                    <span
                      role="img"
                      aria-label={t("resources.vault.featured")}
                      title={t("resources.vault.featured")}
                      className="flex-shrink-0 text-xs"
                    >
                      {featuredEmoji}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default VaultFolderGroup;
