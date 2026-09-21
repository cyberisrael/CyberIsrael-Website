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

  const Divider = () => (
    <div
      className={`w-full h-px bg-gradient-to-r from-transparent to-transparent ${
        theme === "dark" ? "via-cyber-green/40" : "via-light-blue/40"
      }`}
    />
  );

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <ResourcesHeroSection />
        <Divider />
        <ResourcesArticlesSection />
        <Divider />
        <ResourcesLecturesSection />
        <Divider />
        <ResourcesDocsSection />
        <Divider />
        <SlidesSection />
        <Divider />
        <InstagramPostsSection />
      </div>
    </div>
  );
};

export default ResourcesPage;
