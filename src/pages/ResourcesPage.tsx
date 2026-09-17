import React from "react";
import ResourcesHeroSection from "@/components/sections/ResourcesHeroSection";
import ResourcesArticlesSection from "@/components/sections/ResourcesArticlesSection";
import ResourcesLecturesSection from "@/components/sections/ResourcesLecturesSection";
import ResourcesDocsSection from "@/components/sections/ResourcesDocsSection";
import SlidesSection from "@/components/sections/SlidesSection";
import { useTheme } from "@/context/ThemeContext";
import InstagramPostsSection from "@/components/sections/InstagramPostsSection";

const ResourcesPage: React.FC = () => {
  const { theme } = useTheme();
  const divider = `border-t ${theme === "dark" ? "border-cyber-border/100" : "border-light-border"}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center pt-24 pb-20">
      <ResourcesHeroSection />
      <div className={`w-full max-w-4xl ${divider}`} />
      <ResourcesArticlesSection />
      <div className={`w-full max-w-4xl ${divider}`} />
      <ResourcesLecturesSection />
      <div className={`w-full max-w-4xl ${divider}`} />
      <ResourcesDocsSection />
      <div className={`w-full max-w-4xl ${divider}`} />
      <SlidesSection />
      <div className={`w-full max-w-4xl ${divider}`} />
      <InstagramPostsSection />
    </div>
  );
};

export default ResourcesPage;
