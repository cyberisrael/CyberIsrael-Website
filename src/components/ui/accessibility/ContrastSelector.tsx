import React from "react";
import { useTranslation } from "react-i18next";
import { FiEye } from "react-icons/fi";
import { useAccessibility } from "@/context/AccessibilityContext";
import SectionLabel from "./SectionLabel";
import { useOptionClasses } from "./useOptionClasses";

const ContrastSelector: React.FC = () => {
  const { t } = useTranslation();
  const { contrast, setContrast } = useAccessibility();
  const { activeClasses, idleClasses } = useOptionClasses();

  const contrastOptions: { value: typeof contrast; label: string }[] = [
    { value: "default", label: t("accessibility.contrast_default") },
    { value: "grayscale", label: t("accessibility.contrast_grayscale") },
    { value: "high", label: t("accessibility.contrast_high") },
  ];

  return (
    <div>
      <SectionLabel icon={FiEye}>{t("accessibility.contrast")}</SectionLabel>
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
  );
};

export default ContrastSelector;
