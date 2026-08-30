import React from "react";
import ResourcesHeroSection from "@/components/sections/ResourcesHeroSection";
import ResourcesArticlesSection from "@/components/sections/ResourcesArticlesSection";
import ResourcesLecturesSection from "@/components/sections/ResourcesLecturesSection";
import ResourcesDocsSection from "@/components/sections/ResourcesDocsSection";
import SlidesSection from "@/components/sections/SlidesSection";

const ResourcesPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center pt-24 pb-20">
      <ResourcesHeroSection />
      <ResourcesArticlesSection />
      <ResourcesLecturesSection />
      <ResourcesDocsSection />
      <SlidesSection />
    </div>
  );
};

export default ResourcesPage;