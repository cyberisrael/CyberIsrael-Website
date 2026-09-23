import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/context/ThemeContext'

const SuggestionsSection: React.FC = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [suggestion, setSuggestion] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSuggestion('')
  }

  return (
    <section id="suggestions" className="m-10 w-full py-28 relative z-10 overflow-hidden">
      <div className="absolute inset-0">
        <div className={`absolute inset-0 ${theme === 'dark'
          ? 'bg-gradient-to-br from-cyber-dark via-cyber-black to-cyber-dark'
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
          }`} />
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: theme === 'dark'
              ? 'radial-gradient(circle, rgba(0,255,136,0.06), transparent 70%)'
              : 'radial-gradient(circle, rgba(37,99,235,0.08), transparent 70%)',
          }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className={`font-display text-xs tracking-widest uppercase ${theme === 'dark' ? 'text-cyber-green' : 'text-light-blue'
            }`}>
            {t('resources.suggestions_subtitle')}
          </span>
          <h2 className="section-title mt-3 gradient-text">
            {t('resources.suggestions_title')}
          </h2>
          <p className={`text-lg max-w-2xl mx-auto mb-10 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-light-muted'
            }`}>
            {t('resources.suggestions_description')}
          </p>

          <form onSubmit={handleSubmit} className="flex gap-3 max-w-xl mx-auto">
            <input
              type="text"
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder={t('resources.suggestions_placeholder')}
              className={`flex-1 px-5 py-3.5 rounded-xl text-sm outline-none transition-colors ${
                theme === 'dark'
                  ? 'bg-cyber-card border border-cyber-border/40 text-white placeholder:text-slate-500 focus:border-cyber-green/60'
                  : 'bg-white border border-light-border text-light-text placeholder:text-slate-400 focus:border-light-blue/60 shadow-sm'
              }`}
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(0,255,136,0.3)' }}
              whileTap={{ scale: 0.96 }}
              className="btn-primary px-6 py-3.5 text-sm"
            >
              {t('resources.suggestions_submit')}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}

export default SuggestionsSection
