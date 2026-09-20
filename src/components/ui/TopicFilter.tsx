import React, { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaCheck, FaChevronDown, FaSearch, FaTimes } from 'react-icons/fa'

export interface TopicOption {
  topic: string
  count: number
}

interface TopicFilterProps {
  topics: TopicOption[]
  selected: string[]
  onToggle: (topic: string) => void
  onClear: () => void
}

const chipShape = 'rounded-xl border text-xs font-display uppercase tracking-widest transition-colors duration-200'
const chipIdle = 'border-light-border text-light-muted hover:text-light-text dark:border-cyber-border/40 dark:text-slate-400 dark:hover:text-slate-200'
const chipActive = 'border-light-teal/40 bg-light-teal/10 text-light-teal dark:border-cyber-teal/40 dark:bg-cyber-teal/10 dark:text-cyber-teal'

const TopicFilter: React.FC<TopicFilterProps> = ({ topics, selected, onToggle, onClear }) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  const close = () => {
    setIsOpen(false)
    setQuery('')
  }

  useEffect(() => {
    if (!isOpen) return

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) close()
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      close()
      triggerRef.current?.focus()
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  if (topics.length === 0) return null

  const matches = topics.filter(({ topic }) => topic.toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <div ref={containerRef} className="relative mt-8 flex items-center justify-center gap-2">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-haspopup="dialog"
        className={`${chipShape} ${isOpen || selected.length > 0 ? chipActive : chipIdle} flex items-center gap-2 px-4 py-2`}
      >
        <FaSearch size={11} />
        {t('articles.filter_title')}
        {selected.length > 0 && (
          <span className="min-w-[1.25rem] rounded-full bg-light-teal/15 px-1.5 text-[10px] leading-5 dark:bg-cyber-teal/20">
            {selected.length}
          </span>
        )}
        <FaChevronDown size={10} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {selected.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          aria-label={t('articles.filter_clear')}
          title={t('articles.filter_clear')}
          className={`${chipShape} ${chipIdle} p-2`}
        >
          <FaTimes size={11} />
        </button>
      )}

      {isOpen && (
        <div
          id={panelId}
          className="absolute left-1/2 top-full z-30 mt-2 w-72 -translate-x-1/2 overflow-hidden rounded-xl border border-light-border bg-white shadow-xl dark:border-cyber-border/60 dark:bg-cyber-card"
        >
          <div className="flex items-center gap-2 border-b border-light-border px-3 py-2 dark:border-cyber-border/40">
            <FaSearch size={11} className="text-light-muted dark:text-slate-500" />
            <input
              autoFocus
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder={t('articles.filter_search_placeholder')}
              aria-label={t('articles.filter_search_placeholder')}
              className="w-full bg-transparent text-sm text-light-text outline-none placeholder:text-light-muted dark:text-slate-200 dark:placeholder:text-slate-600"
            />
          </div>

          <div role="group" aria-label={t('articles.filter_title')} className="max-h-64 overflow-y-auto py-1">
            {matches.map(({ topic, count }) => {
              const isSelected = selected.includes(topic)
              return (
                <button
                  key={topic}
                  type="button"
                  role="checkbox"
                  aria-checked={isSelected}
                  onClick={() => onToggle(topic)}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-start text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60 ${isSelected ? 'text-light-teal dark:text-cyber-teal' : 'text-light-text dark:text-slate-300'
                    }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${isSelected ? 'border-current' : 'border-light-border dark:border-cyber-border/60'
                      }`}>
                      {isSelected && <FaCheck size={8} />}
                    </span>
                    <span className="truncate">{topic}</span>
                  </span>
                  <span className="text-xs text-light-muted dark:text-slate-500">{count}</span>
                </button>
              )
            })}

            {matches.length === 0 && (
              <p className="px-3 py-4 text-center text-xs text-light-muted dark:text-slate-500">
                {t('articles.filter_no_topics')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TopicFilter
