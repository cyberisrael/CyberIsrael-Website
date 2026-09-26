import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaUniversalAccess } from "react-icons/fa";
import { FiX, FiRotateCcw } from "react-icons/fi";
import { useTheme } from "@/context/ThemeContext";
import { useLang } from "@/context/LangContext";
import { useAccessibility } from "@/context/AccessibilityContext";
import FontSizeSelector from "./accessibility/FontSizeSelector";
import ContrastSelector from "./accessibility/ContrastSelector";
import AdditionalAdjustmentsSelector from "./accessibility/AdditionalAdjustmentsSelector";
import { useOptionClasses } from "./accessibility/useOptionClasses";

const AccessibilityMenu: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isRTL } = useLang();
  const { reset } = useAccessibility();
  const { idleClasses } = useOptionClasses();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        aria-label={t("accessibility.open")}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`fixed bottom-6 left-6 z-40 flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-200 ${
          theme === "dark"
            ? "bg-cyber-card border-cyber-green/40 text-cyber-green shadow-neon-green hover:bg-cyber-green/10"
            : "bg-light-card border-light-blue/40 text-light-blue shadow-[0_0_20px_rgba(37,99,235,0.25)] hover:bg-light-blue/10"
        }`}
      >
        <FaUniversalAccess size={22} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/50"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t("accessibility.title")}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`fixed z-50 bottom-24 left-6 w-[calc(100vw-3rem)] max-w-sm max-h-[75vh] overflow-y-auto scrollbar-thin rounded-2xl glass-strong ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-cyber-border/30">
                <div className="flex items-center gap-2">
                  <FaUniversalAccess
                    className={
                      theme === "dark" ? "text-cyber-green" : "text-light-blue"
                    }
                    size={18}
                  />
                  <h2 className="font-display text-sm tracking-widest uppercase">
                    {t("accessibility.title")}
                  </h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label={t("accessibility.close")}
                  className={`p-1.5 rounded-lg transition-colors duration-200 ${
                    theme === "dark"
                      ? "text-slate-400 hover:text-cyber-teal"
                      : "text-light-muted hover:text-light-blue"
                  }`}
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="px-5 py-4 flex flex-col gap-5">
                <FontSizeSelector />
                <ContrastSelector />
                <AdditionalAdjustmentsSelector />

                <button
                  onClick={reset}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-display tracking-widest uppercase transition-all duration-200 ${idleClasses}`}
                >
                  <FiRotateCcw size={14} />
                  {t("accessibility.reset")}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AccessibilityMenu;
