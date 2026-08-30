import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

const ResourcesDocsSection: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <section className="m-10 flex flex-col md:flex-row justify-center gap-10 w-full">
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1
          className={`font-display text-3xl font-bold mb-8 ${
            theme === "dark" ? "text-white" : "text-light-text"
          }`}
        >
          {t("resources.sheets_title")}
        </h1>
        <div className="aspect-video max-w-full bg-black/10">
          <iframe
            className="w-full h-[600px] border-0"
            src="https://docs.google.com/spreadsheets/d/1ylNPja33yQBsLWXUK2loKzthUMrBe9UpHUsAbnc0iLA/edit?gid=0#gid=0"
            title={t("resources.video_title")}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </motion.div>
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1
          className={`font-display text-3xl font-bold mb-8 ${
            theme === "dark" ? "text-white" : "text-light-text"
          }`}
        >
          {t("resources.docs_title")}
        </h1>
        <div className="aspect-video max-w-full bg-black/10">
          <iframe
            className="w-full h-[600px] border-0"
            src="https://docs.google.com/document/d/19tF4arwM14EaQJFX3Y6OPH3tG9ZytQ3oRCM7gCIhxt8/edit?tab=t.0#heading=h.y2t8o8g8j8ax"
            title={t("resources.video_title")}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </motion.div>
    </section>
  );
};

export default ResourcesDocsSection;
