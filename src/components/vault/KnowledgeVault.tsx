import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import VaultSidebar from "./VaultSidebar";
import VaultTabBar from "./VaultTabBar";
import VaultNoteView from "./VaultNoteView";
import VaultEmptyState from "./VaultEmptyState";
import { useVaultStyles } from "./useVaultStyles";
import { useVaultTabs } from "./useVaultTabs";
import type { VaultFolder } from "./types";

interface KnowledgeVaultProps {
  folders: VaultFolder[];
}

/** On phones the sidebar overlays the note instead of sitting beside it. */
const isPhone = () => window.matchMedia("(max-width: 767px)").matches;

/** Obsidian-style browser: folder tree on the side, open notes as tabs, one note in focus. */
const KnowledgeVault: React.FC<KnowledgeVaultProps> = ({ folders }) => {
  const { t } = useTranslation();
  const c = useVaultStyles();
  const { openTabs, active, activeId, setActiveId, openNote, closeNote } =
    useVaultTabs(folders);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (isPhone()) setSidebarOpen(false);
  }, []);

  const handleOpenNote = (id: string) => {
    openNote(id);
    if (isPhone()) setSidebarOpen(false);
  };

  return (
    <div
      className={`relative flex h-[calc(100vh-12rem)] min-h-[560px] rounded-xl border overflow-hidden backdrop-blur-sm ${c.frame}`}
    >
      {/* Backdrop behind the sidebar on phones */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            aria-label={t("resources.vault.close_sidebar")}
            className="md:hidden absolute inset-0 z-20 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <VaultSidebar
        folders={folders}
        activeId={activeId}
        open={sidebarOpen}
        onOpenNote={handleOpenNote}
        onClose={() => setSidebarOpen(false)}
      />

      <div className={`flex-1 min-w-0 flex flex-col ${c.pane}`}>
        <VaultTabBar
          tabs={openTabs}
          activeId={activeId}
          sidebarOpen={sidebarOpen}
          onSelect={setActiveId}
          onClose={closeNote}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <div className="flex-1 overflow-y-auto px-5 py-8 md:px-10 md:py-10 flex flex-col">
          {active ? (
            <VaultNoteView
              key={active.note.id}
              note={active.note}
              folderTitle={active.folder.title}
            />
          ) : (
            <VaultEmptyState />
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeVault;
