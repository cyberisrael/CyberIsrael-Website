import React from "react";
import { useTranslation } from "react-i18next";
import { FiLink, FiBookOpen } from "react-icons/fi";
import { useTheme } from "@/context/ThemeContext";
import { useLang } from "@/context/LangContext";
import { useAccessibility } from "@/context/AccessibilityContext";
import SectionLabel from "./SectionLabel";
import { useOptionClasses } from "./useOptionClasses";

const AdditionalAdjustmentsSelector: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isRTL } = useLang();
  const { highlightLinks, toggleHighlightLinks, readableFont, toggleReadableFont } =
    useAccessibility();
  const { activeClasses, idleClasses } = useOptionClasses();

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

  return (
    <div>
      <SectionLabel>{t("accessibility.adjustments")}</SectionLabel>
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
  );
};

export default AdditionalAdjustmentsSelector;
