import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaInstagram } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";
import { ResourceSection } from "@/components/ui/ResourceBlocks";

const InstagramPostsSection: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const instagramPosts = [
    {
      url: "https://www.instagram.com/p/DXuiFBEiLtQ/",
    },
    {
      url: "https://www.instagram.com/p/DabKNJWiCni/",
    },
    {
      url: "https://www.instagram.com/p/DaQehYhCAYr/",
    },
  ];

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

  const isDark = theme === "dark";

  return (
    <ResourceSection
      index={6}
      icon={FaInstagram}
      accent="purple"
      title={t("resources.instagram_title")}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {instagramPosts.map((post, index) => (
          <motion.div
            key={post.url}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className={`relative rounded-2xl overflow-hidden border p-3 flex justify-center ${
              isDark
                ? "bg-cyber-card border-cyber-border/60 shadow-[0_0_24px_rgba(139,92,246,0.15)]"
                : "bg-white border-light-border shadow-glass-light"
            }`}
          >
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                isDark
                  ? "from-cyber-purple to-cyber-pink"
                  : "from-purple-500 to-indigo-600"
              }`}
            />
            <blockquote
              className="instagram-media mt-2"
              style={{ margin: "8px 0 0", minWidth: 0, width: "100%" }}
              data-instgrm-permalink={post.url}
              data-instgrm-version="14"
            />
          </motion.div>
        ))}
      </div>
    </ResourceSection>
  );
};

export default InstagramPostsSection;
