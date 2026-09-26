import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { FiMenu, FiX, FiSun, FiMoon, FiGlobe, FiFileText } from 'react-icons/fi'
import Logo from '@/components/ui/Logo'
import { useTheme } from '@/context/ThemeContext'
import { useLang } from '@/context/LangContext'
import { socialLinks } from '@/services/socialLinks'


const Navbar: React.FC = () => {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const { lang, setLang, isRTL } = useLang()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/articles', label: t('nav.articles') },
    { to: '/impact', label: t('nav.impact') },
    { to: '/collaborate', label: t('nav.collaborate') },
  ]

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'glass-strong shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
        : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Nav */}
          <div className={`hidden md:flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 rounded-lg font-display text-xs tracking-widest uppercase transition-all duration-200 ${isActive(link.to)
                  ? theme === 'dark'
                    ? 'text-cyber-green'
                    : 'text-light-blue'
                  : theme === 'dark'
                    ? 'text-slate-400 hover:text-cyber-teal'
                    : 'text-light-muted hover:text-light-blue'
                  }`}
              >
                {isActive(link.to) && (
                  <motion.span
                    layoutId="nav-active"
                    className={`absolute inset-0 rounded-lg ${theme === 'dark'
                      ? 'bg-cyber-green/10 border border-cyber-green/20'
                      : 'bg-light-blue/10 border border-light-blue/20'
                      }`}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Controls */}
          <div className={`hidden md:flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>

            {/* Lang toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'he' : 'en')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-display tracking-widest transition-all duration-200 ${theme === 'dark'
                ? 'border border-cyber-border text-slate-400 hover:text-cyber-teal hover:border-cyber-teal/40'
                : 'border border-light-border text-light-muted hover:text-light-blue hover:border-light-blue/40'
                }`}
              aria-label="Toggle language"
            >
              <FiGlobe size={14} />
              {lang === 'en' ? 'HE' : 'EN'}
            </button>
          </div>


          {/* Mobile Articles button */}
          <div className="flex md:hidden items-center gap-1">

            {!location.pathname.startsWith('/articles') && (
              <Link
                to="/articles"
                className={`p-2 rounded-lg transition-all duration-200 ${theme === 'dark'
                  ? 'text-cyber-green hover:bg-cyber-green/10'
                  : 'text-light-blue hover:bg-light-blue/10'
                  }`}
                aria-label="Articles"
              >
                <FiFileText size={18} />
              </Link>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'text-slate-200' : 'text-light-text'
                }`}
            >
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </motion.button>


            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-all duration-200 ${theme === 'dark'
                ? 'border-cyber-green/30 bg-cyber-green/10 text-cyber-green hover:bg-cyber-green/20'
                : 'border-light-blue/30 bg-light-blue/10 text-light-blue hover:bg-light-blue/20'
                }`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden glass-strong border-t border-cyber-border/30"
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-3 rounded-lg font-display text-xs tracking-widest uppercase transition-all duration-200 ${isActive(link.to)
                    ? theme === 'dark'
                      ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/20'
                      : 'bg-light-blue/10 text-light-blue border border-light-blue/20'
                    : theme === 'dark'
                      ? 'text-slate-400'
                      : 'text-light-muted'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => setLang(lang === 'en' ? 'he' : 'en')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-display tracking-widest border ${theme === 'dark'
                    ? 'border-cyber-border text-slate-400'
                    : 'border-light-border text-light-muted'
                    }`}
                >
                  <FiGlobe size={14} />
                  {lang === 'en' ? 'עברית' : 'English'}
                </button>
                <a
                  href={socialLinks.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-xs py-2 px-4 flex-1 text-center"
                >
                  {t('social.join_discord')}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav >
  )
}

export default Navbar
