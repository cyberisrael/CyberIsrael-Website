import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LuChevronDown } from "react-icons/lu";
import { useVaultStyles } from "./useVaultStyles";
import { noteDetail } from "./noteDetail";
import { useVaultResources } from "./VaultResourcesContext";
import type { VaultEntry } from "./useVaultTabs";

interface VaultFeaturedProps {
  entries: VaultEntry[];
  activeId: string | null;
  onOpenNote: (id: string) => void;
}

const HIDDEN_KEY = "cyberisrael-vault-featured-hidden";

// Storage can throw (private windows, blocked site data); the strip then just starts shown.
const readHidden = () => {
  try {
    return localStorage.getItem(HIDDEN_KEY) === "1";
  } catch {
    return false;
  }
};

const writeHidden = (hidden: boolean) => {
  try {
    localStorage.setItem(HIDDEN_KEY, hidden ? "1" : "0");
  } catch {
    // Not remembered, but the toggle still works for this visit.
  }
};

/** Compact row of featured notes above the vault; viewers can collapse it, and that choice is remembered. */
const VaultFeatured: React.FC<VaultFeaturedProps> = ({
  entries,
  activeId,
  onOpenNote,
}) => {
  const { t } = useTranslation();
  const c = useVaultStyles();
  const { resources } = useVaultResources();
  const [hidden, setHidden] = useState(readHidden);

  if (entries.length === 0) return null;

  const toggle = () => {
    writeHidden(!hidden);
    setHidden(!hidden);
  };

  return (
    <section aria-labelledby="vault-featured-title">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={!hidden}
        aria-controls="vault-featured-list"
        className={`flex items-center gap-1 text-xs font-display transition-colors ${c.muted} hover:text-[color:var(--vault-featured)]`}
      >
        <LuChevronDown
          size={14}
          className={`transition-transform ${hidden ? "-rotate-90 rtl:rotate-90" : ""}`}
        />
        {hidden
          ? t("resources.vault.featured_show", { count: entries.length })
          : t("resources.vault.featured_hide")}
      </button>

      <AnimatePresence initial={false}>
        {!hidden && (
          <motion.div
            id="vault-featured-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {/* A scroller clips what spills out of it, so the padding gives the cards' glow room. */}
            <ul className="flex gap-3 overflow-x-auto -mx-4 px-4 pt-3 pb-5 scroll-px-4 snap-x">
              {entries.map(({ note, folder }) => {
                const Icon = folder.icon;
                const active = note.id === activeId;
                return (
                  <li key={note.id} className="snap-start flex-shrink-0 w-52">
                    <button
                      type="button"
                      onClick={() => onOpenNote(note.id)}
                      aria-current={active || undefined}
                      className={`w-full h-full flex flex-col rounded-lg border px-3 py-2.5 text-start backdrop-blur-sm transition-[border-color,box-shadow] duration-300 ${
                        active ? c.featuredCardActive : c.featuredCard
                      }`}
                    >
                      <span
                        className={`flex items-center gap-1.5 text-[11px] mb-1 ${c.muted}`}
                      >
                        <Icon size={11} className="flex-shrink-0" />
                        <span className="truncate">{folder.title}</span>
                        <span
                          className={`ms-auto flex-shrink-0 px-1.5 rounded-full font-display ${c.tagPill}`}
                        >
                          {t("resources.vault.from_source", {
                            source: note.source.label,
                          })}
                        </span>
                      </span>
                      <span
                        className={`font-semibold text-sm leading-snug mb-1 line-clamp-1 ${c.featuredText}`}
                        dir="auto"
                        title={note.title}
                      >
                        {`${note.title} ${resources.featured.emoji}`}
                      </span>
                      <span
                        className={`text-xs leading-relaxed line-clamp-2 ${c.muted}`}
                        dir="auto"
                      >
                        {noteDetail(note)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default VaultFeatured;
