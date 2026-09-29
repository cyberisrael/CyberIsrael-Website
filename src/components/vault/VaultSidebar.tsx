import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { LuLibrary, LuSearch } from "react-icons/lu";
import VaultFolderGroup from "./VaultFolderGroup";
import VaultSidebarToggle from "./VaultSidebarToggle";
import { useVaultStyles } from "./useVaultStyles";
import type { VaultFolder } from "./types";

interface VaultSidebarProps {
  folders: VaultFolder[];
  activeId: string | null;
  featuredIds: Set<string>;
  open: boolean;
  onOpenNote: (id: string) => void;
  onClose: () => void;
}

/** Search box + folder tree. Hidden rather than unmounted, so search and folder state survive. */
const VaultSidebar: React.FC<VaultSidebarProps> = ({
  folders,
  activeId,
  featuredIds,
  open,
  onOpenNote,
  onClose,
}) => {
  const { t } = useTranslation();
  const c = useVaultStyles();
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleFolder = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const normalizedQuery = query.trim().toLowerCase();
  const visibleFolders = normalizedQuery
    ? folders
        .map((folder) => ({
          ...folder,
          notes: folder.notes.filter(
            (note) =>
              note.title.toLowerCase().includes(normalizedQuery) ||
              note.tag.toLowerCase().includes(normalizedQuery),
          ),
        }))
        .filter((folder) => folder.notes.length > 0)
    : folders;

  return (
    <aside
      className={`absolute md:static inset-y-0 start-0 z-30 w-72 md:w-64 lg:w-72 flex-shrink-0 flex-col border-e ${
        open ? "flex" : "hidden"
      } ${c.sidebar}`}
    >
      <div className="flex items-center gap-2 p-3">
        <div className="relative flex-1">
          <LuSearch
            size={15}
            className={`absolute top-1/2 -translate-y-1/2 start-2.5 pointer-events-none ${c.muted}`}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("resources.vault.search")}
            className={`w-full rounded-md border ps-8 pe-2 py-1.5 text-sm outline-none transition-colors ${c.input}`}
          />
        </div>
        <VaultSidebarToggle
          label={t("resources.vault.close_sidebar")}
          onClick={onClose}
        />
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-3 text-sm">
        {visibleFolders.length === 0 && (
          <p className={`px-3 py-4 ${c.muted}`}>
            {t("resources.vault.no_results")}
          </p>
        )}

        {visibleFolders.map((folder) => (
          <VaultFolderGroup
            key={folder.id}
            folder={folder}
            // A search expands every folder so matches are never hidden.
            collapsed={!normalizedQuery && collapsed.has(folder.id)}
            activeId={activeId}
            featuredIds={featuredIds}
            onToggle={() => toggleFolder(folder.id)}
            onOpenNote={onOpenNote}
          />
        ))}
      </nav>

      <div className={`flex items-center gap-2 px-4 py-3 border-t ${c.guide}`}>
        <LuLibrary size={16} className={c.accentText} />
        <span className={`font-display text-sm truncate ${c.text}`}>
          {t("nav.resources")}
        </span>
      </div>
    </aside>
  );
};

export default VaultSidebar;
