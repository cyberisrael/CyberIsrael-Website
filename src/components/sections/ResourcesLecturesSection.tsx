import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

const ResourcesLecturesSection: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <section className="m-10">
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
          {t("resources.past_lectures_title")}
        </h1>
        <div className="aspect-video w-full max-w-full bg-black/10">
          <iframe
            className="w-full h-full"
            src="https://drive.google.com/file/d/1HmqAaIn8TY-UD4fWkRXspBJDTCrK_E4E/preview"
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

export default ResourcesLecturesSection;
