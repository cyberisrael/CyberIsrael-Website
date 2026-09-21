import { useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaChalkboard } from "react-icons/fa";
import IframeSkeleton from "@/components/ui/IframeSkeleton";
import {
  ResourceFrame,
  ResourceSection,
  ResourceTabs,
} from "@/components/ui/ResourceBlocks";

const SlidesSection: React.FC = () => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(0);
  const [iframeLoading, setIframeLoading] = useState(true);

  const ref = useRef<HTMLDivElement>(null);

  const isInView = useInView(ref, {
    once: true,
    margin: "100px",
  });

  const safeSlidesContent = () => {
    try {
      const value = t("resources.slides_presentations", {
        returnObjects: true,
      });

      if (!Array.isArray(value)) {
        console.error("resources.slides_presentations is not an array.");
        console.log("Received value:", value);
        return [];
      }

      return value.filter((item) => {
        const valid =
          item &&
          typeof item === "object" &&
          typeof item.title === "string" &&
          typeof item.url === "string";

        if (!valid) {
          console.error(`Invalid entry at resources.slides_presentations`);
          console.log(item);
        }

        return valid;
      });
    } catch (err) {
      console.error("Failed loading resources.slides_presentations");
      console.log(err);
      return [];
    }
  };

  const slidesPresentations = safeSlidesContent();

  return (
    <ResourceSection
      index={5}
      icon={FaChalkboard}
      accent="yellow"
      title={t("resources.slides_title")}
    >
      <div ref={ref}>
        <ResourceTabs
          accent="yellow"
          items={slidesPresentations.map((presentation) =>
            t(presentation.title),
          )}
          selected={selected}
          onSelect={(index) => {
            setSelected(index);
            setIframeLoading(true);
          }}
        />

        {slidesPresentations[selected] && (
          <ResourceFrame
            accent="yellow"
            label={t(slidesPresentations[selected].title)}
            bodyClassName="aspect-video"
            className="max-w-4xl mx-auto"
          >
            {isInView && (
              <>
                {iframeLoading && <IframeSkeleton />}
                <iframe
                  key={selected}
                  src={slidesPresentations[selected].url.replace(
                    "/edit",
                    "/embed",
                  )}
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  title={t(slidesPresentations[selected].title)}
                  onLoad={() => setIframeLoading(false)}
                />
              </>
            )}
          </ResourceFrame>
        )}
      </div>
    </ResourceSection>
  );
};

export default SlidesSection;
