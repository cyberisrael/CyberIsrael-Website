import React from 'react'
import HeroSection from '@/components/sections/HeroSection'
import AboutSection from '@/components/sections/AboutSection'
import EventsSection from '@/components/sections/EventsSection'
import SocialSection from '@/components/sections/SocialSection'
import JoinSection from '@/components/sections/JoinSection'
import ArticlesSection from '@/components/sections/ArticlesSection'
import ValuesSection from '@/components/sections/ValuesSection'

const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ValuesSection />
      <ArticlesSection />
      <EventsSection />
      <SocialSection />
      <JoinSection />
    </>
  )
}

export default HomePage
