import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { LangProvider } from '@/context/LangContext'
import RootLayout from '@/components/layout/RootLayout'
import PageLoader from '@/components/ui/PageLoader'
import ComingSoonPage from './pages/ComingSoonPage'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/pages/HomePage'))
const ArticlesPage = lazy(() => import('@/pages/ArticlesPage'))
const ArticlePage = lazy(() => import('@/pages/ArticlePage'))
const ImpactPage = lazy(() => import('@/pages/ImpactPage'))
const CollaboratePage = lazy(() => import('@/pages/CollaboratePage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LangProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<RootLayout />}>
                <Route index element={<HomePage />} />
                <Route path="articles" element={<ArticlesPage />} />
                <Route path="articles/:slug" element={<ArticlePage />} />
                <Route path="/coming-soon" element={<ComingSoonPage />} />
                <Route path="/coming-soon/:name" element={<ComingSoonPage />} />
                <Route path="impact" element={<ImpactPage />} />
                <Route path="collaborate" element={<CollaboratePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </LangProvider>
    </ThemeProvider>
  )
}

export default App