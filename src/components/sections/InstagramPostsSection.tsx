import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

const InstagramPostsSection: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

   useEffect(() => {
    // Load Instagram's embed script
    if (window.instgrm) {
      window.instgrm.Embeds.process();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;

    script.onload = () => {
      window.instgrm?.Embeds.process();
    };

    document.body.appendChild(script);
  }, []);

  return (
    <section className="m-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <h1
          className={`font-display text-3xl font-bold mb-8 ${
            theme === "dark" ? "text-white" : "text-light-text"
          }`}
        >
          {t("resources.instagram_title")}
        </h1>
        <div className="flex gap-4">
          <blockquote
            className="instagram-media"
            data-instgrm-permalink="https://www.instagram.com/p/DYh2Uk_CEO1/"
            data-instgrm-version="14"
          />
          <blockquote
            className="instagram-media"
            data-instgrm-permalink="https://www.instagram.com/p/DXuiFBEiLtQ/"
            data-instgrm-version="14"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default InstagramPostsSection;
