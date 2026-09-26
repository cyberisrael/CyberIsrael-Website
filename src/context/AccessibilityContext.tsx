import React, { createContext, useContext, useEffect, useState } from 'react'

const FONT_SIZES = ['small', 'normal', 'large', 'xlarge'] as const
const CONTRASTS = ['default', 'grayscale', 'high'] as const

type FontSize = (typeof FONT_SIZES)[number]
type Contrast = (typeof CONTRASTS)[number]

interface AccessibilitySettings {
  fontSize: FontSize
  contrast: Contrast
  highlightLinks: boolean
  readableFont: boolean
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSize: 'normal',
  contrast: 'default',
  highlightLinks: false,
  readableFont: false,
}

const STORAGE_KEY = 'cyberisrael-accessibility'

const isValidSettings = (value: unknown): value is AccessibilitySettings => {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    (FONT_SIZES as readonly unknown[]).includes(v.fontSize) &&
    (CONTRASTS as readonly unknown[]).includes(v.contrast) &&
    typeof v.highlightLinks === 'boolean' &&
    typeof v.readableFont === 'boolean'
  )
}

interface AccessibilityContextType extends AccessibilitySettings {
  setFontSize: (size: FontSize) => void
  setContrast: (contrast: Contrast) => void
  toggleHighlightLinks: () => void
  toggleReadableFont: () => void
  reset: () => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return DEFAULT_SETTINGS
      const parsed: unknown = JSON.parse(saved)
      if (typeof parsed !== 'object' || parsed === null) return DEFAULT_SETTINGS
      const { fontSize, contrast, highlightLinks, readableFont } = { ...DEFAULT_SETTINGS, ...parsed }
      const merged = { fontSize, contrast, highlightLinks, readableFont }
      return isValidSettings(merged) ? merged : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-a11y-font-size', settings.fontSize)
    root.setAttribute('data-a11y-contrast', settings.contrast)
    root.setAttribute('data-a11y-links', settings.highlightLinks ? 'on' : 'off')
    root.setAttribute('data-a11y-font', settings.readableFont ? 'readable' : 'default')
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const setFontSize = (fontSize: FontSize) => setSettings(prev => ({ ...prev, fontSize }))
  const setContrast = (contrast: Contrast) => setSettings(prev => ({ ...prev, contrast }))
  const toggleHighlightLinks = () => setSettings(prev => ({ ...prev, highlightLinks: !prev.highlightLinks }))
  const toggleReadableFont = () => setSettings(prev => ({ ...prev, readableFont: !prev.readableFont }))
  const reset = () => setSettings(DEFAULT_SETTINGS)

  return (
    <AccessibilityContext.Provider
      value={{
        ...settings,  
        setFontSize,
        setContrast,
        toggleHighlightLinks,
        toggleReadableFont,
        reset,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export const useAccessibility = (): AccessibilityContextType => {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider')
  return ctx
}
