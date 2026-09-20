import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { FaClock, FaArrowRight, FaGlobe } from 'react-icons/fa'
import { useTheme } from '@/context/ThemeContext'
import { getCategoryColor, type Article } from '@/services/articlesData'

interface ArticleCardProps {
  article: Article
  index: number
  ignoreFeatured?: boolean
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, index, ignoreFeatured = false }) => {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const isDark = theme === 'dark'
  const catColor = getCategoryColor(article.category)
  const isFeatured = Boolean(article.featured) && !ignoreFeatured

  const styles = {
    card: isDark
      ? 'bg-cyber-card border-cyber-border/40 hover:border-cyber-teal/30 hover:shadow-neon-teal'
      : 'bg-white border-light-border shadow-sm hover:shadow-lg hover:border-light-teal/40',
    featuredBadge: isDark
      ? 'bg-cyber-green/20 text-cyber-green border-cyber-green/30'
      : 'bg-light-blue/10 text-light-blue border-light-blue/30',
    meta: isDark ? 'text-slate-500' : 'text-light-muted',
    title: isDark ? 'text-white group-hover:text-cyber-teal' : 'text-light-text group-hover:text-light-blue',
    excerpt: isDark ? 'text-slate-400' : 'text-light-muted',
    tag: isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-light-muted border-slate-200',
    readMore: isDark ? 'text-cyber-green group-hover:text-cyber-teal' : 'text-light-blue group-hover:text-light-teal',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ y: -6 }}
      className={`group rounded-2xl overflow-hidden border transition-all duration-300 ${styles.card} ${isFeatured ? 'md:col-span-2' : ''}`}
    >
      <Link to={`/articles/${article.href}`} className="block h-full">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-display tracking-widest uppercase"
              style={{ background: catColor.bg, color: catColor.text, border: `1px solid ${catColor.border}` }}
            >
              {t(`articles.categories.${article.category}`)}
            </span>
          </div>

          {isFeatured && (
            <div className="absolute top-3 right-3">
              <span className={`px-2.5 py-1 rounded-full border text-xs font-display tracking-widest uppercase ${styles.featuredBadge}`}>
                {t('articles.featured')}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Meta */}
          <div className={`flex items-center gap-4 text-xs mb-3 font-display ${styles.meta}`}>
            <span className="flex items-center gap-1.5">
              <FaClock size={10} />
              {article.readTime} {t('articles.min_read')}
            </span>
            <span className="flex items-center gap-1.5">
              <FaGlobe size={13} />
              {article.language}
            </span>
            <span>{new Date(article.date).toLocaleDateString()}</span>
          </div>

          {/* Title */}
          <h3 className={`font-display font-bold text-base mb-2 leading-snug group-hover:transition-colors duration-200 ${styles.title}`}>
            {article.title}
          </h3>

          {/* Excerpt */}
          <p className={`text-sm leading-relaxed mb-4 line-clamp-2 ${styles.excerpt}`}>
            {article.excerpt}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {article.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className={`text-xs px-2 py-0.5 rounded-full border font-display ${styles.tag}`}
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Read more */}
          <span className={`flex items-center gap-2 text-xs font-display tracking-widest uppercase transition-all duration-200 ${styles.readMore}`}>
            {t('articles.read_more')}
            <FaArrowRight size={10} className="group-hover:translate-x-1 transition-transform duration-200" />
          </span>
        </div>
      </Link>
    </motion.div>
  )
}

export default ArticleCard
