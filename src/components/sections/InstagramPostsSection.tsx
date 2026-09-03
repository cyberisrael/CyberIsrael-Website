import React, { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

const InstagramPostsSection: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    margin: "100px",
  });

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

  return (
    <section className="m-20" ref={ref}>
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
        <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-4">
          {instagramPosts.map((post, index) => (
            <blockquote
              key={index}
              className="instagram-media justify-self-center"
              data-instgrm-permalink={post.url}
              data-instgrm-version="14"
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default InstagramPostsSection;
