import React, { Suspense, useEffect } from 'react'
import { useLocation, useNavigationType, useOutlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'
import ParticleBackground from '@/components/particles/ParticleBackground'
import PageLoader from '@/components/ui/PageLoader'
import { useTheme } from '@/context/ThemeContext'

const RootLayout: React.FC = () => {
  const { theme } = useTheme()
  const location = useLocation()
  const navigationType = useNavigationType()
  const outlet = useOutlet()
  
  useEffect(() => {
    if (navigationType === 'POP' || location.hash) return
    window.scrollTo(0, 0)
  }, [location.pathname, location.hash, navigationType])

  return (
    <div className={`min-h-screen relative ${theme === 'dark' ? 'bg-cyber-black' : 'bg-light-bg'}`}>
      {/* Particle background */}
      <ParticleBackground />

      {/* Subtle grid overlay */}
      <div className="fixed inset-0 cyber-grid-bg pointer-events-none z-0 opacity-50" />

      {/* Navbar */}
      <Navbar />

      {/* Page content with transitions */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="relative z-10"
        >
          {/* Keeps a lazily loaded page from tearing down the whole shell */}
          <Suspense fallback={<PageLoader />}>{outlet}</Suspense>
        </motion.main>
      </AnimatePresence>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default RootLayout

