import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaNewspaper } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";
import { ResourceSection } from "@/components/ui/ResourceBlocks";

const ResourcesArticlesSection: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <ResourceSection
      index={1}
      icon={FaNewspaper}
      accent="green"
      title={t("resources.articles_title")}
    >
      <div
        className={`relative overflow-hidden rounded-2xl border p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
          isDark
            ? "bg-cyber-card border-cyber-border/60 shadow-[0_0_30px_rgba(0,255,136,0.08)]"
            : "bg-white border-light-border shadow-glass-light"
        }`}
      >
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
            isDark
              ? "from-cyber-green to-cyber-teal"
              : "from-light-blue to-light-teal"
          }`}
        />
        <div
          className={`absolute -top-24 -end-24 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${
            isDark ? "bg-cyber-green" : "bg-light-blue"
          }`}
        />

        <p
          className={`relative text-sm md:text-base leading-relaxed max-w-xl text-start ${
            isDark ? "text-slate-400" : "text-light-muted"
          }`}
        >
          {t("resources.articles_desc")}
        </p>

        <motion.div
          className="relative flex-shrink-0"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <Link to="/articles" className="btn-primary inline-block">
            {t("resources.articles_cta")}
          </Link>
        </motion.div>
      </div>
    </ResourceSection>
  );
};

export default ResourcesArticlesSection;
