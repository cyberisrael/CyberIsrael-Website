import { useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaChalkboardTeacher } from "react-icons/fa";
import IframeSkeleton from "@/components/ui/IframeSkeleton";
import {
  ResourceFrame,
  ResourceSection,
  ResourceTabs,
} from "@/components/ui/ResourceBlocks";

const LecturesSection: React.FC = () => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(0);
  const [iframeLoading, setIframeLoading] = useState(true);

  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "100px",
  });

  const safePastLecturesContent = () => {
    try {
      const value = t("resources.past_lectures", {
        returnObjects: true,
      });

      if (!Array.isArray(value)) {
        console.error("resources.past_lectures is not an array.");
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
          console.error(`Invalid entry at resources.past_lectures`);
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

  const pastLectures = safePastLecturesContent();

  return (
    <ResourceSection
      index={2}
      icon={FaChalkboardTeacher}
      accent="teal"
      title={t("resources.past_lectures_title")}
    >
      <div ref={ref}>
        {pastLectures.length > 1 && (
          <ResourceTabs
            accent="teal"
            items={pastLectures.map((lecture) => t(lecture.title))}
            selected={selected}
            onSelect={(index) => {
              setSelected(index);
              setIframeLoading(true);
            }}
          />
        )}

        {pastLectures[selected] && (
          <ResourceFrame
            accent="teal"
            label={t(pastLectures[selected].title)}
            bodyClassName="aspect-video"
            className="max-w-4xl mx-auto"
          >
            {isInView && (
              <>
                {iframeLoading && <IframeSkeleton />}
                <iframe
                  key={selected}
                  src={pastLectures[selected].url.replace("/edit", "/embed")}
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  title={t(pastLectures[selected].title)}
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

export default LecturesSection;
