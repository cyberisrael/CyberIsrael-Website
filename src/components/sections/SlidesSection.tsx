import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { useInView } from "framer-motion";
import IframeSkeleton from "@/components/ui/IframeSkeleton";

const SlidesSection: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
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
    <section className="m-10" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1
          className={`font-display text-3xl font-bold mb-8 ${
            theme === "dark" ? "text-white" : "text-light-text"
          }`}
        >
          {t("resources.slides_title")}
        </h1>

        <div className="flex flex-wrap gap-3 mb-6">
          {slidesPresentations.map((presentation, index) => (
            <button
              key={presentation.url}
              onClick={() => {
                setSelected(index);
                setIframeLoading(true);
              }}
              className={`px-5 py-2.5 rounded-lg font-display text-sm transition-all duration-300 ${
                selected === index
                  ? theme === "dark"
                    ? "bg-cyber-green text-cyber-black shadow-neon-green"
                    : "bg-light-blue text-white shadow-glass-light"
                  : theme === "dark"
                    ? "bg-cyber-card text-gray-400 border border-cyber-border hover:border-cyber-green/50 hover:text-white"
                    : "bg-light-card text-light-muted border border-light-border hover:border-light-blue/50 hover:text-light-text"
              }`}
            >
              {t(presentation.title)}
            </button>
          ))}
        </div>

        <div
          className={`relative w-[90vw] h-[50vh] md:w-[50vw] md:h-[60vh] max-w-4xl max-h-96 rounded-xl overflow-hidden border ${
            theme === "dark"
              ? "border-cyber-border bg-cyber-card"
              : "border-light-border bg-light-card"
          }`}
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
                className="w-full h-full border-0"
                allowFullScreen
                title={t(slidesPresentations[selected].title)}
                onLoad={() => setIframeLoading(false)}
              />
            </>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default SlidesSection;
