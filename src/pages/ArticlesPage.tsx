import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { FaBookOpen } from 'react-icons/fa'
import { useTheme } from '@/context/ThemeContext'
import { articles } from '@/services/articlesData'
import ArticleCard from '@/components/ui/ArticleCard'

// const categories = ['all', 'web', 'pwn', 'crypto', 'forensics', 'malware', 'osint', 'ctf']

const ArticlesPage: React.FC = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  // const [activeCategory, setActiveCategory] = useState('all')
  const [activeCategory] = useState('all')

  const filtered = activeCategory === 'all'
    ? articles
    : articles.filter(a => a.category === activeCategory)

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-cyber-teal/10' : 'bg-light-teal/10'
              }`}>
              <FaBookOpen size={28} className={theme === 'dark' ? 'text-cyber-teal' : 'text-light-teal'} />
            </div>
          </div>
          <h1 className="section-title">
            <span className={theme === 'dark' ? 'text-white' : 'text-light-text'}>{t('articles.title')}</span>
          </h1>
          <p className={`text-lg max-w-xl mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-light-muted'
            }`}>
            {t('articles.subtitle')}
          </p>
        </motion.div>

        {/* Category filters TODO ADD IN THE FUTURE!!! */}
        {/*
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mt-8"
        >
          {categories.map(cat => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-display tracking-widest uppercase transition-all duration-200 ${activeCategory === cat
                ? theme === 'dark'
                  ? 'bg-cyber-teal/20 text-cyber-teal border border-cyber-teal/40'
                  : 'bg-light-teal/10 text-light-teal border border-light-teal/40'
                : theme === 'dark'
                  ? 'border border-cyber-border/40 text-slate-400 hover:text-slate-200'
                  : 'border border-light-border text-light-muted hover:text-light-text'
                }`}
            >
              {t(`articles.categories.${cat}`)}
            </motion.button>
          ))}
        </motion.div>
         */}
      </div>

      {/* Articles grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((article, i) => (
              <ArticleCard key={article.href} article={article} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className={theme === 'dark' ? 'text-slate-500' : 'text-light-muted'}>
              No articles in this category yet.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ArticlesPage
