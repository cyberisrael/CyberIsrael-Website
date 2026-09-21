import React, { useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaMap, FaTable } from "react-icons/fa";
import IframeSkeleton from "@/components/ui/IframeSkeleton";
import {
  ResourceFrame,
  ResourceSection,
} from "@/components/ui/ResourceBlocks";

const ResourcesDocsSection: React.FC = () => {
  const { t } = useTranslation();
  const [sheetsLoading, setSheetsLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(true);

  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "100px",
  });

  const iframeAllow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";

  return (
    <div ref={ref} className="w-full">
      <ResourceSection
        index={3}
        icon={FaTable}
        accent="purple"
        title={t("resources.sheets_title")}
      >
        <ResourceFrame accent="purple" label={t("resources.sheets_title")}>
          {isInView && (
            <>
              {sheetsLoading && <IframeSkeleton />}
              <iframe
                className="absolute inset-0 w-full h-full border-0"
                src="https://docs.google.com/spreadsheets/d/1ylNPja33yQBsLWXUK2loKzthUMrBe9UpHUsAbnc0iLA/preview?gid=0"
                title={t("resources.sheets_title")}
                loading="lazy"
                allow={iframeAllow}
                allowFullScreen
                onLoad={() => setSheetsLoading(false)}
              />
            </>
          )}
        </ResourceFrame>
      </ResourceSection>

      <ResourceSection
        index={4}
        icon={FaMap}
        accent="green"
        title={t("resources.docs_title")}
      >
        <ResourceFrame accent="green" label={t("resources.docs_title")}>
          {isInView && (
            <>
              {docsLoading && <IframeSkeleton />}
              <iframe
                className="absolute inset-0 w-full h-full border-0"
                src="https://docs.google.com/document/d/19tF4arwM14EaQJFX3Y6OPH3tG9ZytQ3oRCM7gCIhxt8/preview?gid=0"
                title={t("resources.docs_title")}
                loading="lazy"
                allow={iframeAllow}
                allowFullScreen
                onLoad={() => setDocsLoading(false)}
              />
            </>
          )}
        </ResourceFrame>
      </ResourceSection>
    </div>
  );
};

export default ResourcesDocsSection;
