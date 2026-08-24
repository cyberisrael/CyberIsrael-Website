import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/context/ThemeContext'

const ResourcesPage: React.FC = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1
          className={`font-display text-3xl font-bold mb-8 ${
            theme === 'dark' ? 'text-white' : 'text-light-text'
          }`}
        >
          {t('resources.articles_title')}
        </h1>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Link to="/articles" className="btn-primary">
            {t('resources.articles_cta')}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ResourcesPage
