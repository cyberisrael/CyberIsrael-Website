import React from "react";
import { useTranslation } from "react-i18next";
import { LuFileQuestion } from "react-icons/lu";
import { useVaultStyles } from "./useVaultStyles";

const VaultEmptyState: React.FC = () => {
  const { t } = useTranslation();
  const c = useVaultStyles();

  return (
    <div
      className={`m-auto flex flex-col items-center gap-3 text-center ${c.muted}`}
    >
      <LuFileQuestion size={40} />
      <p className="text-lg">{t("resources.vault.empty_title")}</p>
      <p className="text-sm">{t("resources.vault.empty_hint")}</p>
    </div>
  );
};

export default VaultEmptyState;
