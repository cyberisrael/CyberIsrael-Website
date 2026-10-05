import React, { createContext, useContext, useMemo } from "react";
import type { VaultResources } from "@/services/vaultResources";

interface VaultResourcesContextValue {
  /** `knowledge-vault.json` as fetched by the resources page. */
  resources: VaultResources;
  featuredIds: Set<string>;
  isFeatured: (id: string) => boolean;
}

const VaultResourcesContext = createContext<
  VaultResourcesContextValue | undefined
>(undefined);

/** Shares the fetched vault data with every vault component, instead of threading it through props. */
export const VaultResourcesProvider: React.FC<{
  resources: VaultResources;
  children: React.ReactNode;
}> = ({ resources, children }) => {
  const value = useMemo(() => {
    const featuredIds = new Set(resources.featured.items);
    return {
      resources,
      featuredIds,
      isFeatured: (id: string) => featuredIds.has(id),
    };
  }, [resources]);

  return (
    <VaultResourcesContext.Provider value={value}>
      {children}
    </VaultResourcesContext.Provider>
  );
};

export const useVaultResources = (): VaultResourcesContextValue => {
  const ctx = useContext(VaultResourcesContext);
  if (!ctx)
    throw new Error(
      "useVaultResources must be used within VaultResourcesProvider",
    );
  return ctx;
};
