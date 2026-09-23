import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { FaBookOpen } from 'react-icons/fa'
import { useTheme } from '@/context/ThemeContext'
import { articles } from '@/services/articlesData'
import ArticleCard from '@/components/ui/ArticleCard'
import TopicFilter, { type TopicOption } from '@/components/ui/TopicFilter'

const topicOptions: TopicOption[] = Object.entries(
  articles.flatMap(article => article.tags).reduce<Record<string, number>>((counts, tag) => {
    counts[tag] = (counts[tag] ?? 0) + 1
    return counts
  }, {})
)
  .map(([topic, count]) => ({ topic, count }))
  .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic))

const ArticlesPage: React.FC = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])

  const toggleTopic = (topic: string) =>
    setSelectedTopics(current =>
      current.includes(topic) ? current.filter(item => item !== topic) : [...current, topic]
    )

  const filtered = selectedTopics.length === 0
    ? articles
    : articles.filter(article => article.tags.some(tag => selectedTopics.includes(tag)))

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

        {/* Topic filters */}
        <TopicFilter
          topics={topicOptions}
          selected={selectedTopics}
          onToggle={toggleTopic}
          onClear={() => setSelectedTopics([])}
        />
      </div>

      {/* Articles grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((article, i) => (
            <ArticleCard key={article.href} article={article} index={i} />
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className={theme === 'dark' ? 'text-slate-500' : 'text-light-muted'}>
              {t('articles.no_results')}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ArticlesPage
