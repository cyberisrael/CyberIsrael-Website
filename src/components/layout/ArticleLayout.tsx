/**
 * ArticleLayout
 * ─────────────────────────────────────────────────────────────────────────────
 * Wraps every individual article page with:
 *   • SEO meta tags (injected into <head> via useEffect)
 *   • Hero header (cover image, title, meta, tags)
 *   • Breadcrumb navigation
 *   • Side table-of-contents (desktop)
 *   • Related articles sidebar
 *   • Back / share bar
 *   • Content slot (children)
 *
 * Usage:
 *   <ArticleLayout article={articleData}>
 *     <NotionHtmlEmbed ... />   ← or any other content component
 *   </ArticleLayout>
 */

import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  FaArrowLeft,
  FaClock,
  FaUser,
  FaTag,
  FaShare,
  FaTwitter,
  FaLinkedin,
  FaLink,
} from 'react-icons/fa'
import { useTheme } from '@/context/ThemeContext'
import { articles, getCategoryColor, type Article } from '@/services/articlesData'

interface ArticleLayoutProps {
  article: Article
  children: React.ReactNode
}

// ── Share bar ─────────────────────────────────────────────────────────────────
const ShareBar: React.FC<{ title: string }> = ({ title }) => {
  const { theme } = useTheme()
  const url = typeof window !== 'undefined' ? window.location.href : ''

  const copyLink = () => {
    navigator.clipboard.writeText(url).catch(() => { })
  }

  const btnCls = `p-2.5 rounded-lg border transition-all duration-200 ${theme === 'dark'
    ? 'border-cyber-border/50 text-slate-400 hover:text-cyber-teal hover:border-cyber-teal/40 hover:bg-cyber-teal/5'
    : 'border-light-border text-light-muted hover:text-light-blue hover:border-light-blue/40 hover:bg-light-blue/5'
    }`

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-display tracking-widest uppercase mr-1 ${theme === 'dark' ? 'text-slate-500' : 'text-light-muted'
        }`}>
        <FaShare size={11} className="inline mr-1.5" />Share
      </span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Twitter"
        className={btnCls}
      >
        <FaTwitter size={14} />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className={btnCls}
      >
        <FaLinkedin size={14} />
      </a>
      <button onClick={copyLink} aria-label="Copy link" className={btnCls}>
        <FaLink size={13} />
      </button>
    </div>
  )
}

// ── Related articles ──────────────────────────────────────────────────────────
const RelatedArticles: React.FC<{ current: Article }> = ({ current }) => {
  const { theme } = useTheme()
  const related = articles
    .filter(a => a.href !== current.href && (a.category === current.category || a.tags.some(t => current.tags.includes(t))))
    .slice(0, 3)

  if (related.length === 0) return null

  return (
    <aside className="mt-12">
      <h3 className={`font-display text-xs tracking-widest uppercase mb-5 ${theme === 'dark' ? 'text-cyber-teal' : 'text-light-teal'
        }`}>
        Related Articles
      </h3>
      <div className="space-y-3">
        {related.map(a => {
          const cat = getCategoryColor(a.category)
          return (
            <Link
              key={a.href}
              to={`/articles/${a.href}`}
              className={`group flex gap-3 p-3 rounded-xl border transition-all duration-200 ${theme === 'dark'
                ? 'border-cyber-border/40 hover:border-cyber-teal/30 bg-cyber-card/60'
                : 'border-light-border hover:border-light-teal/40 bg-white'
                }`}
            >
              <img
                src={a.image}
                alt={a.title}
                className="w-16 h-12 object-cover rounded-lg flex-shrink-0"
              />
              <div className="min-w-0">
                <span
                  className="text-[10px] font-display tracking-widest uppercase"
                  style={{ color: cat.text }}
                >
                  {a.category}
                </span>
                <p className={`text-xs font-display font-semibold leading-snug mt-0.5 line-clamp-2 transition-colors ${theme === 'dark'
                  ? 'text-slate-300 group-hover:text-cyber-teal'
                  : 'text-light-text group-hover:text-light-teal'
                  }`}>
                  {a.title}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </aside>
  )
}

// ── Main layout ───────────────────────────────────────────────────────────────
const ArticleLayout: React.FC<ArticleLayoutProps> = ({ article, children }) => {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const cat = getCategoryColor(article.category)

  // Inject SEO meta tags
  useEffect(() => {
    const prev = {
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
      ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') ?? '',
    }

    document.title = `${article.title} — CyberIsrael`

    const setMeta = (selector: string, attr: string, val: string) => {
      let el = document.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(selector.includes('property') ? 'property' : 'name', selector.match(/"([^"]+)"/)?.[1] ?? '')
        document.head.appendChild(el)
      }
      el.setAttribute(attr, val)
    }

    setMeta('meta[name="description"]', 'content', article.excerpt)
    setMeta('meta[property="og:title"]', 'content', article.title)
    setMeta('meta[property="og:description"]', 'content', article.excerpt)
    setMeta('meta[property="og:image"]', 'content', article.image)
    setMeta('meta[name="keywords"]', 'content', article.tags.join(', '))

    return () => {
      document.title = prev.title
      document.querySelector('meta[name="description"]')?.setAttribute('content', prev.desc)
      document.querySelector('meta[property="og:title"]')?.setAttribute('content', prev.ogTitle)
    }
  }, [article])

  const formattedDate = new Date(article.date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-screen pt-16">

      {/* ── Hero banner ────────────────────────────────────────────────────── */}
      <div className="relative h-56 md:h-80 overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay gradient */}
        <div className={`absolute inset-0 ${theme === 'dark'
          ? 'bg-gradient-to-b from-cyber-black/70 via-cyber-black/50 to-cyber-black'
          : 'bg-gradient-to-b from-white/30 via-white/20 to-light-bg'
          }`} />
        {/* Subtle grid over image */}
        <div className="absolute inset-0 cyber-grid-bg opacity-20" />
      </div>

      {/* ── Page body ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-24 relative z-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 items-start">

          {/* ── Main column ──────────────────────────────────────────────── */}
          <div>
            {/* Breadcrumb */}
            <motion.nav
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs font-display tracking-widest uppercase mb-6"
            >
              <Link
                to="/articles"
                className={`flex items-center gap-1.5 transition-colors duration-200 ${theme === 'dark'
                  ? 'text-slate-500 hover:text-cyber-green'
                  : 'text-light-muted hover:text-light-blue'
                  }`}
              >
                <FaArrowLeft size={10} />
                {t('nav.articles')}
              </Link>
              <span className={theme === 'dark' ? 'text-slate-700' : 'text-slate-300'}>/</span>
              <span
                className="truncate max-w-[200px]"
                style={{ color: cat.text }}
              >
                {article.category.toUpperCase()}
              </span>
            </motion.nav>

            {/* Article header card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`rounded-2xl border p-6 md:p-8 mb-8 ${theme === 'dark'
                ? 'bg-cyber-card/90 border-cyber-border/50 shadow-glass'
                : 'bg-white/95 border-light-border shadow-glass-light'
                }`}
              style={{ backdropFilter: 'blur(16px)' }}
            >
              {/* Category badge */}
              <div className="mb-4">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-display tracking-widest uppercase"
                  style={{ background: cat.bg, color: cat.text, border: `1px solid ${cat.border}` }}
                >
                  {article.category}
                </span>
              </div>

              {/* Title */}
              <h1 className={`font-display text-2xl md:text-4xl font-bold leading-tight mb-5 ${theme === 'dark' ? 'text-white' : 'text-light-text'
                }`}>
                {article.title}
              </h1>

              {/* Excerpt */}
              <p className={`text-base leading-relaxed mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-light-muted'
                }`}>
                {article.excerpt}
              </p>

              {/* Meta row */}
              <div className={`flex flex-wrap items-center gap-x-6 gap-y-3 pt-5 border-t ${theme === 'dark' ? 'border-cyber-border/40' : 'border-light-border'
                }`}>

                {/* Date */}
                <div className="flex items-center gap-1.5">
                  <FaUser size={11} className={theme === 'dark' ? 'text-slate-600' : 'text-slate-400'} />
                  <span className={`text-xs font-display ${theme === 'dark' ? 'text-slate-500' : 'text-light-muted'
                    }`}>
                    {formattedDate}
                  </span>
                </div>

                {/* Reading time */}
                <div className="flex items-center gap-1.5">
                  <FaClock size={11} className={theme === 'dark' ? 'text-slate-600' : 'text-slate-400'} />
                  <span className={`text-xs font-display ${theme === 'dark' ? 'text-slate-500' : 'text-light-muted'
                    }`}>
                    {article.readTime} {t('articles.min_read')}
                  </span>
                </div>

                {/* Share — pushed to right */}
                <div className="ml-auto">
                  <ShareBar title={article.title} />
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {article.tags.map(tag => (
                  <span
                    key={tag}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-display ${theme === 'dark'
                      ? 'bg-slate-800/80 text-slate-400 border border-slate-700/80'
                      : 'bg-slate-100 text-light-muted border border-slate-200'
                      }`}
                  >
                    <FaTag size={9} />
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* ── Article content slot ──────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              {children}
            </motion.div>

            {/* ── Bottom back button ────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-12 flex items-center justify-between flex-wrap gap-4"
            >
              <button
                onClick={() => navigate('/articles')}
                className={`flex items-center gap-2 text-sm font-display tracking-widest uppercase transition-all duration-200 group ${theme === 'dark'
                  ? 'text-slate-500 hover:text-cyber-green'
                  : 'text-light-muted hover:text-light-blue'
                  }`}
              >
                <FaArrowLeft
                  size={12}
                  className="group-hover:-translate-x-1 transition-transform duration-200"
                />
                Back to Articles
              </button>
              <ShareBar title={article.title} />
            </motion.div>
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <aside className="hidden lg:block sticky top-24 space-y-0">
            {/* Article info card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className={`rounded-2xl border p-5 mb-6 space-y-3 ${theme === 'dark'
                ? 'bg-cyber-card/80 border-cyber-border/50'
                : 'bg-white border-light-border shadow-sm'
                }`}
            >
              <p className={`font-display text-xs tracking-widest uppercase ${theme === 'dark' ? 'text-cyber-teal' : 'text-light-teal'
                }`}>
                Article Info
              </p>
              {[
                { label: 'Published', value: formattedDate },
                { label: 'Read time', value: `${article.readTime} min` },
                { label: 'Category', value: article.category.toUpperCase() },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-light-muted'}`}>
                    {label}
                  </span>
                  <span className={`text-xs font-display font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-light-text'
                    }`}>
                    {value}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Related articles */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <RelatedArticles current={article} />
            </motion.div>
          </aside>

        </div>
      </div>
    </div>
  )
}

export default ArticleLayout