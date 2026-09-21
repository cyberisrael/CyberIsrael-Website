import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import { useTheme } from '@/context/ThemeContext'
import { useLang } from '@/context/LangContext'
import { getHomePreviewArticles } from '@/services/articlesData'
import ArticleCard from '@/components/ui/ArticleCard'

const previewArticles = getHomePreviewArticles()

const ArticlesSection: React.FC = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { isRTL } = useLang()
  const isDark = theme === 'dark'

  if (previewArticles.length === 0) return null

  const ArrowIcon = isRTL ? FaArrowLeft : FaArrowRight

  return (
    <section id="articles" className="py-10 relative z-10">
      {/* Background accent */}
      <div className={`absolute inset-0 ${isDark
        ? 'bg-gradient-to-b from-transparent via-cyber-dark/40 to-transparent'
        : 'bg-gradient-to-b from-transparent via-blue-50/60 to-transparent'
        }`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className={`font-display text-xs tracking-widest uppercase ${isDark ? 'text-cyber-green' : 'text-light-blue'}`}>
            {t('articles.home_subtitle')}
          </span>
          <h2 className="section-title mt-2">
            <span className={isDark ? 'text-white' : 'text-light-text'}>
              {t('articles.home_title')}
            </span>
          </h2>
        </motion.div>

        {/* Article previews */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {previewArticles.map((article, i) => (
            <ArticleCard key={article.href} article={article} index={i} ignoreFeatured />
          ))}
        </div>

        {/* Link to the full articles page */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mt-12"
        >
          <Link to="/articles" className="btn-secondary inline-flex items-center gap-2 group">
            {t('articles.view_all')}
            <ArrowIcon
              size={12}
              className={`transition-transform duration-200 ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'
                }`}
            />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default ArticlesSection
