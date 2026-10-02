import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { LangProvider } from '@/context/LangContext'
import { AccessibilityProvider } from '@/context/AccessibilityContext'
import RootLayout from '@/components/layout/RootLayout'
import PageLoader from '@/components/ui/PageLoader'
import siteRoutes from '@/siteRoutes.json'

// Each page is its own chunk, looked up by the file name siteRoutes.json gives it
const pageModules = import.meta.glob<{ default: React.ComponentType }>('./pages/*.tsx')
const pages = Object.fromEntries(
  Object.entries(pageModules).map(([file, load]) => [file.slice('./pages/'.length, -'.tsx'.length), lazy(load)])
)
const NotFoundPage = pages.NotFoundPage

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LangProvider>
        <AccessibilityProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<RootLayout />}>
                {siteRoutes.map(({ path, page }) => {
                  const Page = pages[page]
                  return path === '/'
                    ? <Route key={path} index element={<Page />} />
                    : <Route key={path} path={path} element={<Page />} />
                })}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
        </AccessibilityProvider>
      </LangProvider>
    </ThemeProvider>
  )
}

export default App
