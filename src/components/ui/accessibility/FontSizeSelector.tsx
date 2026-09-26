import React from "react";
import { useTranslation } from "react-i18next";
import { FiType } from "react-icons/fi";
import { useAccessibility } from "@/context/AccessibilityContext";
import SectionLabel from "./SectionLabel";
import { useOptionClasses } from "./useOptionClasses";

const FontSizeSelector: React.FC = () => {
  const { t } = useTranslation();
  const { fontSize, setFontSize } = useAccessibility();
  const { activeClasses, idleClasses } = useOptionClasses();

  const sizeOptions: { value: typeof fontSize; label: string }[] = [
    { value: "small", label: t("accessibility.size_small") },
    { value: "normal", label: t("accessibility.size_normal") },
    { value: "large", label: t("accessibility.size_large") },
    { value: "xlarge", label: t("accessibility.size_xlarge") },
  ];

  return (
    <div>
      <SectionLabel icon={FiType}>{t("accessibility.text_size")}</SectionLabel>
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
  );
};

export default FontSizeSelector;
