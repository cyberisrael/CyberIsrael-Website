import React from 'react'
import { useTheme } from '@/context/ThemeContext'

const IframeSkeleton: React.FC = () => {
  const { theme } = useTheme()

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center animate-pulse ${
        theme === 'dark' ? 'bg-cyber-card' : 'bg-light-card'
      }`}
    >
      <div
        className={`w-3/4 h-3/4 rounded-lg ${
          theme === 'dark' ? 'bg-cyber-green/20' : 'bg-light-blue/20'
        }`}
      />
    </div>
  )
}

export default IframeSkeleton
