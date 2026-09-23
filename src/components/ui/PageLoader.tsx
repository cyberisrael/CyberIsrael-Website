import React from 'react'

const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-cyber-green/30 border-t-cyber-green rounded-full animate-spin" />
      <span className="font-display text-xs tracking-widest text-cyber-green/60">LOADING...</span>
    </div>
  </div>
)

export default PageLoader
