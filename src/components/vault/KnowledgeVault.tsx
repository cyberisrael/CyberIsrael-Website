import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import VaultSidebar from "./VaultSidebar";
import VaultTabBar from "./VaultTabBar";
import VaultNoteView from "./VaultNoteView";
import VaultEmptyState from "./VaultEmptyState";
import VaultGraph from "./VaultGraph";
import VaultFeatured from "./VaultFeatured";
import { useVaultStyles } from "./useVaultStyles";
import { useVaultTabs } from "./useVaultTabs";
import type { VaultFolder } from "./types";
import { localize, type VaultFeaturedConfig } from "@/services/vaultResources";

interface KnowledgeVaultProps {
  folders: VaultFolder[];
  featured: VaultFeaturedConfig;
}

/** On phones the sidebar overlays the note instead of sitting beside it. */
const isPhone = () => window.matchMedia("(max-width: 767px)").matches;
/** Below `lg` the graph overlays the note too; it only starts open where all three columns fit. */
const isNarrow = () => window.matchMedia("(max-width: 1023px)").matches;
const isWide = () => window.matchMedia("(min-width: 1280px)").matches;
/** A shared `?note=` link should land on that note rather than on the graph. */
const hasLinkedNote = () =>
  new URLSearchParams(window.location.search).has("note");

/**
 * Obsidian-style browser: folder tree on the side, open notes as tabs, one note in focus,
 * graph view on the far side. With the note view closed the graph takes over the pane.
 */
const KnowledgeVault: React.FC<KnowledgeVaultProps> = ({
  folders,
  featured,
}) => {
  const { t, i18n } = useTranslation();
  const c = useVaultStyles();
  const frameRef = useRef<HTMLDivElement>(null);
  const [noteViewOpen, setNoteViewOpen] = useState(hasLinkedNote);
  const {
    notesById,
    openTabs,
    active,
    activeId,
    setActiveId,
    openNote,
    closeNote,
  } = useVaultTabs(folders, noteViewOpen);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [graphOpen, setGraphOpen] = useState(isWide);

  const lang = i18n.language;

  const featuredEntries = featured.items.flatMap(
    (id) => notesById.get(id) ?? [],
  );
  const featuredSet = new Set(featured.items);

  const handleOpenNote = (id: string) => {
    setNoteViewOpen(true);
    openNote(id);
    if (isPhone()) setSidebarOpen(false);
    if (isNarrow()) setGraphOpen(false);
  };

  const toggleGraph = () => {
    if (!graphOpen && isPhone()) setSidebarOpen(false);
    setGraphOpen(!graphOpen);
  };

  const handleOpenFeatured = (id: string) => {
    handleOpenNote(id);
    frameRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const graphExpanded = !noteViewOpen;

  return (
    <>
      <VaultFeatured
        entries={featuredEntries}
        description={localize(featured.description, lang)}
        activeId={noteViewOpen ? activeId : null}
        onOpenNote={handleOpenFeatured}
      />
      <div
        ref={frameRef}
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
          {graphOpen && !graphExpanded && (
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
          featuredIds={featuredSet}
          featuredEmoji={featured.emoji}
          open={sidebarOpen}
          onOpenNote={handleOpenNote}
          onClose={() => setSidebarOpen(false)}
        />

        {noteViewOpen && (
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
              onCloseNoteView={() => setNoteViewOpen(false)}
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
        )}

        {(graphOpen || graphExpanded) && (
          <VaultGraph
            folders={folders}
            activeId={activeId}
            featuredIds={featuredSet}
            featuredColor={featured.graphColor}
            featuredEmoji={featured.emoji}
            expanded={graphExpanded}
            sidebarOpen={sidebarOpen}
            onOpenNote={handleOpenNote}
            onClose={() => setGraphOpen(false)}
            onOpenSidebar={() => setSidebarOpen(true)}
            onShowNoteView={active ? () => setNoteViewOpen(true) : undefined}
          />
        )}
      </div>
    </>
  );
};

export default KnowledgeVault;
