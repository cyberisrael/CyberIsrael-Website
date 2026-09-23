import React, { createContext, useContext, useEffect, useState } from 'react'

type FontSize = 'small' | 'normal' | 'large' | 'xlarge'
type Contrast = 'default' | 'grayscale' | 'high'

interface AccessibilitySettings {
  fontSize: FontSize
  contrast: Contrast
  highlightLinks: boolean
  reduceMotion: boolean
  readableFont: boolean
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSize: 'normal',
  contrast: 'default',
  highlightLinks: false,
  reduceMotion: false,
  readableFont: false,
}

const STORAGE_KEY = 'cyberisrael-accessibility'

interface AccessibilityContextType extends AccessibilitySettings {
  setFontSize: (size: FontSize) => void
  setContrast: (contrast: Contrast) => void
  toggleHighlightLinks: () => void
  toggleReduceMotion: () => void
  toggleReadableFont: () => void
  reset: () => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-a11y-font-size', settings.fontSize)
    root.setAttribute('data-a11y-contrast', settings.contrast)
    root.setAttribute('data-a11y-links', settings.highlightLinks ? 'on' : 'off')
    root.setAttribute('data-a11y-motion', settings.reduceMotion ? 'reduce' : 'auto')
    root.setAttribute('data-a11y-font', settings.readableFont ? 'readable' : 'default')
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const setFontSize = (fontSize: FontSize) => setSettings(prev => ({ ...prev, fontSize }))
  const setContrast = (contrast: Contrast) => setSettings(prev => ({ ...prev, contrast }))
  const toggleHighlightLinks = () => setSettings(prev => ({ ...prev, highlightLinks: !prev.highlightLinks }))
  const toggleReduceMotion = () => setSettings(prev => ({ ...prev, reduceMotion: !prev.reduceMotion }))
  const toggleReadableFont = () => setSettings(prev => ({ ...prev, readableFont: !prev.readableFont }))
  const reset = () => setSettings(DEFAULT_SETTINGS)

  return (
    <AccessibilityContext.Provider
      value={{
        ...settings,
        setFontSize,
        setContrast,
        toggleHighlightLinks,
        toggleReduceMotion,
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
