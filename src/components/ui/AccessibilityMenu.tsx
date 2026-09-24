import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaUniversalAccess } from "react-icons/fa";
import {
  FiX,
  FiType,
  FiEye,
  FiLink,
  FiBookOpen,
  FiRotateCcw,
} from "react-icons/fi";
import { useTheme } from "@/context/ThemeContext";
import { useLang } from "@/context/LangContext";
import { useAccessibility } from "@/context/AccessibilityContext";

const AccessibilityMenu: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isRTL } = useLang();
  const {
    fontSize,
    setFontSize,
    contrast,
    setContrast,
    highlightLinks,
    toggleHighlightLinks,
    readableFont,
    toggleReadableFont,
    reset,
  } = useAccessibility();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const sizeOptions: { value: typeof fontSize; label: string }[] = [
    { value: "small", label: t("accessibility.size_small") },
    { value: "normal", label: t("accessibility.size_normal") },
    { value: "large", label: t("accessibility.size_large") },
    { value: "xlarge", label: t("accessibility.size_xlarge") },
  ];

  const contrastOptions: { value: typeof contrast; label: string }[] = [
    { value: "default", label: t("accessibility.contrast_default") },
    { value: "grayscale", label: t("accessibility.contrast_grayscale") },
    { value: "high", label: t("accessibility.contrast_high") },
  ];

  const toggles = [
    {
      icon: FiLink,
      label: t("accessibility.highlight_links"),
      active: highlightLinks,
      onToggle: toggleHighlightLinks,
    },
    {
      icon: FiBookOpen,
      label: t("accessibility.readable_font"),
      active: readableFont,
      onToggle: toggleReadableFont,
    },
  ];

  const activeClasses =
    theme === "dark"
      ? "bg-cyber-green/10 border-cyber-green/50 text-cyber-green"
      : "bg-light-blue/10 border-light-blue/50 text-light-blue";

  const idleClasses =
    theme === "dark"
      ? "border-cyber-border text-slate-400 hover:text-cyber-teal hover:border-cyber-teal/40"
      : "border-light-border text-light-muted hover:text-light-blue hover:border-light-blue/40";

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
                {/* Text size */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FiType
                      size={14}
                      className={
                        theme === "dark" ? "text-cyber-teal" : "text-light-teal"
                      }
                    />
                    <span className="font-display text-xs tracking-widest uppercase text-slate-400">
                      {t("accessibility.text_size")}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {sizeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setFontSize(opt.value)}
                        aria-pressed={fontSize === opt.value}
                        className={`px-2 py-2 rounded-lg border text-xs font-display transition-all duration-200 ${
                          fontSize === opt.value ? activeClasses : idleClasses
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contrast */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FiEye
                      size={14}
                      className={
                        theme === "dark" ? "text-cyber-teal" : "text-light-teal"
                      }
                    />
                    <span className="font-display text-xs tracking-widest uppercase text-slate-400">
                      {t("accessibility.contrast")}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {contrastOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setContrast(opt.value)}
                        aria-pressed={contrast === opt.value}
                        className={`px-3 py-2 rounded-lg border text-xs font-display transition-all duration-200 ${
                          contrast === opt.value ? activeClasses : idleClasses
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div>
                  <span className="font-display text-xs tracking-widest uppercase text-slate-400 mb-2 block">
                    {t("accessibility.adjustments")}
                  </span>
                  <div className="flex flex-col gap-2">
                    {toggles.map(({ icon: Icon, label, active, onToggle }) => (
                      <button
                        key={label}
                        onClick={onToggle}
                        aria-pressed={active}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs font-display transition-all duration-200 ${
                          active ? activeClasses : idleClasses
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon size={14} />
                          {label}
                        </span>
                        <span
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                            active
                              ? theme === "dark"
                                ? "bg-cyber-green"
                                : "bg-light-blue"
                              : theme === "dark"
                                ? "bg-cyber-border"
                                : "bg-light-border"
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${
                              active
                                ? isRTL
                                  ? "-translate-x-4"
                                  : "translate-x-4"
                                : "translate-x-1"
                            }`}
                          />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

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
