import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";

const ResourcesPage: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center pt-24 p-20">
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
      <section className="m-20">
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
            {t("resources.articles_title")}
          </h1>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link to="/articles" className="btn-primary">
              {t("resources.articles_cta")}
            </Link>
          </motion.div>
        </motion.div>
      </section>
      <section className="m-10">
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
            {t("resources.past_lectures_title")}
          </h1>
          <div className="aspect-video w-[800px] max-w-full bg-black/10">
            <iframe
              className="w-full h-full"
              src="https://drive.google.com/drive/folders/1k4Yvrw6YjK9uht1GvGhZYUo4Dd7STKV1?usp=sharing"
              title={t("resources.video_title")}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default ResourcesPage;
