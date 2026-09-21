import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

const ResourcesHeroSection: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className="relative z-10 text-center pt-6 pb-14 md:pb-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <span
          className={`font-display text-xs tracking-widest uppercase ${
            isDark ? "text-cyber-green" : "text-light-blue"
          }`}
        >
          {t("resources.subtitle")}
        </span>

        <h1 className="section-title mt-2 mb-4 text-balance">
          <span className={isDark ? "gradient-text" : "gradient-text-light"}>
            {t("resources.title")}
          </span>
        </h1>

        <div
          className={`mx-auto h-1 w-24 rounded-full bg-gradient-to-r ${
            isDark
              ? "from-cyber-green to-cyber-teal shadow-neon-green"
              : "from-light-blue to-light-teal"
          }`}
        />
      </motion.div>
    </section>
  );
};

export default ResourcesHeroSection;
