import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

const ResourcesHeroSection: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <section>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <h1 className="section-title">
          <span
            className={theme === "dark" ? "text-white" : "text-light-text"}
          >
            {t("resources.title")}
          </span>
        </h1>
      </motion.div>
    </section>
  );
};

export default ResourcesHeroSection;