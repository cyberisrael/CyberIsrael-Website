import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import VaultSidebar from "./VaultSidebar";
import VaultTabBar from "./VaultTabBar";
import VaultNoteView from "./VaultNoteView";
import VaultEmptyState from "./VaultEmptyState";
import VaultGraph from "./VaultGraph";
import { useVaultStyles } from "./useVaultStyles";
import { useVaultTabs } from "./useVaultTabs";
import type { VaultFolder } from "./types";

interface KnowledgeVaultProps {
  folders: VaultFolder[];
}

/** On phones the sidebar overlays the note instead of sitting beside it. */
const isPhone = () => window.matchMedia("(max-width: 767px)").matches;
/** Below `lg` the graph overlays the note too; it only starts open where all three columns fit. */
const isNarrow = () => window.matchMedia("(max-width: 1023px)").matches;
const isWide = () => window.matchMedia("(min-width: 1280px)").matches;

/** Obsidian-style browser: folder tree on the side, open notes as tabs, one note in focus, graph view on the far side. */
const KnowledgeVault: React.FC<KnowledgeVaultProps> = ({ folders }) => {
  const { t } = useTranslation();
  const c = useVaultStyles();
  const { openTabs, active, activeId, setActiveId, openNote, closeNote } =
    useVaultTabs(folders);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [graphOpen, setGraphOpen] = useState(isWide);

  useEffect(() => {
    if (isPhone()) setSidebarOpen(false);
  }, []);

  const handleOpenNote = (id: string) => {
    openNote(id);
    if (isPhone()) setSidebarOpen(false);
    if (isNarrow()) setGraphOpen(false);
  };

  const toggleGraph = () => {
    if (!graphOpen && isPhone()) setSidebarOpen(false);
    setGraphOpen(!graphOpen);
  };

  return (
    <div
      className={`relative flex h-[calc(100vh-12rem)] min-h-[560px] rounded-xl border overflow-hidden backdrop-blur-sm ${c.frame}`}
    >
      {/* Backdrop behind the sidebar on phones */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            key="sidebar-backdrop"
            aria-label={t("resources.vault.close_sidebar")}
            className="md:hidden absolute inset-0 z-20 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {graphOpen && (
          <motion.button
            key="graph-backdrop"
            aria-label={t("resources.vault.close_graph")}
            className="lg:hidden absolute inset-0 z-20 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setGraphOpen(false)}
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
          graphOpen={graphOpen}
          onSelect={setActiveId}
          onClose={closeNote}
          onOpenSidebar={() => setSidebarOpen(true)}
          onToggleGraph={toggleGraph}
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

      {graphOpen && (
        <VaultGraph
          folders={folders}
          activeId={activeId}
          onOpenNote={handleOpenNote}
          onClose={() => setGraphOpen(false)}
        />
      )}
    </div>
  );
};

export default KnowledgeVault;
