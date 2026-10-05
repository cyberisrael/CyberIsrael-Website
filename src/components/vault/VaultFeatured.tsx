import React from "react";
import { useTranslation } from "react-i18next";
import { useVaultStyles } from "./useVaultStyles";
import { noteDetail } from "./noteDetail";
import { useVaultResources } from "./VaultResourcesContext";
import type { VaultEntry } from "./useVaultTabs";
import { localize } from "@/services/vaultResources";

interface VaultFeaturedProps {
  entries: VaultEntry[];
  activeId: string | null;
  onOpenNote: (id: string) => void;
}

const VaultFeatured: React.FC<VaultFeaturedProps> = ({
  entries,
  activeId,
  onOpenNote,
}) => {
  const { t } = useTranslation();
  const c = useVaultStyles();
  const { resources } = useVaultResources();

  if (entries.length === 0) return null;

  return (
    <section className="mb-4" aria-labelledby="vault-featured-title">
      {/* A scroller clips what spills out of it, so the padding gives the cards' glow room. */}
      <ul className="flex gap-4 overflow-x-auto -mx-4 px-4 pt-3 pb-6 scroll-px-4 snap-x">
        {entries.map(({ note, folder }) => {
          const Icon = folder.icon;
          const active = note.id === activeId;
          return (
            <li key={note.id} className="snap-start flex-shrink-0 w-64">
              <button
                type="button"
                onClick={() => onOpenNote(note.id)}
                aria-current={active || undefined}
                className={`w-full h-full flex flex-col rounded-lg border p-3 text-start backdrop-blur-sm transition-[border-color,box-shadow] duration-300 ${
                  active ? c.featuredCardActive : c.featuredCard
                }`}
              >
                <span
                  className={`flex items-center gap-1.5 text-xs mb-1 ${c.muted}`}
                >
                  <Icon size={12} className="flex-shrink-0" />
                  <span className="truncate">{folder.title}</span>
                </span>
                <span
                  className={`font-semibold text-sm leading-snug mb-2 line-clamp-2 ${c.featuredText}`}
                  dir="auto"
                >
                  {`${note.title} ${resources.featured.emoji}`}
                </span>
                <span
                  className={`self-start px-2 py-0.5 rounded-full text-xs font-display mb-2 ${c.tagPill}`}
                >
                  #{note.tag}
                </span>
                <span
                  className={`text-xs leading-relaxed line-clamp-3 ${c.muted}`}
                  dir="auto"
                >
                  {noteDetail(note)}
                </span>
                <span
                  className={`mt-auto pt-2 text-xs font-display ${c.accentText}`}
                >
                  {t("resources.vault.graph_open_hint")}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default VaultFeatured;
