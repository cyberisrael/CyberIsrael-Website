import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { VaultFolder, VaultNote } from "./types";

export interface VaultEntry {
  note: VaultNote;
  folder: VaultFolder;
}

/** Open tabs and the focused note, with the focused note mirrored to `?note=`. */
export const useVaultTabs = (folders: VaultFolder[]) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const notesById = useMemo(() => {
    const map = new Map<string, VaultEntry>();
    folders.forEach((folder) =>
      folder.notes.forEach((note) => map.set(note.id, { note, folder })),
    );
    return map;
  }, [folders]);

  const firstNoteId =
    folders.find((f) => f.notes.length > 0)?.notes[0]?.id ?? null;
  const requestedId = searchParams.get("note");
  const initialId =
    requestedId && notesById.has(requestedId) ? requestedId : firstNoteId;

  const [openIds, setOpenIds] = useState<string[]>(
    initialId ? [initialId] : [],
  );
  const [activeId, setActiveId] = useState<string | null>(initialId);

  // Keep the focused note in the URL so a note can be linked to directly.
  useEffect(() => {
    if (activeId === searchParams.get("note")) return;
    const next = new URLSearchParams(searchParams);
    if (activeId) next.set("note", activeId);
    else next.delete("note");
    setSearchParams(next, { replace: true });
  }, [activeId, searchParams, setSearchParams]);

  const openNote = (id: string) => {
    setOpenIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
    setActiveId(id);
  };

  const closeNote = (id: string) => {
    const index = openIds.indexOf(id);
    const remaining = openIds.filter((openId) => openId !== id);
    setOpenIds(remaining);
    if (activeId === id)
      setActiveId(remaining[Math.min(index, remaining.length - 1)] ?? null);
  };

  const openTabs = openIds.flatMap((id) => notesById.get(id) ?? []);
  const active = activeId ? notesById.get(activeId) : undefined;

  return { openTabs, active, activeId, setActiveId, openNote, closeNote };
};
